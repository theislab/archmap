import express, { Router } from "express";
import AtlasService from "../../../../database/services/atlas.service";
import s3 from "../../../../util/s3";
import { validationMdw } from "../../middleware/validation";

import { Storage } from "@google-cloud/storage";

import multer from "multer";



import fs from "fs";
import { atlasModel } from "../../../../database/models/atlas";
import axios from "axios";
import { upload_permission_auth } from "../../middleware/check_institution_auth";
import { AtlasModelAssociation } from "../../../../database/models/atlas_model_association";
import AtlasModelAssociationService from "../../../../database/services/atlas_model_association.service";
import ModelService from "../../../../database/services/model.service";



const uploadDirectory = "/tmp/"; // for gcp 
const bucketName = process.env.S3_BUCKET_NAME; // for gcp


if(!fs.existsSync(uploadDirectory)){
  fs.mkdirSync(uploadDirectory);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },
  filename: (req, file, cb) => {
    console.log("file in filename", file);
    cb(null, file.originalname);
  },
});


const upload = multer({ storage: storage });


/**
 *  Get details about an atlas.
 */
const get_atlas = (): Router => {
  let router = express.Router();

  router.get("/atlas/:id", validationMdw, async (req: any, res) => {
    const atlasId: string = req.params.id;

    try {
      const atlas = await AtlasService.getAtlasById(atlasId);
      return res.status(200).json(atlas);
    } catch (err) {
      console.error("Error getting information about the atlas!");
      console.error(JSON.stringify(err));
      console.error(err);
      return res.status(500).send("Unable to retrieve information about the atlas.");
    }
  });
  return router;
};

const get_atlas_visualization = (): Router => {
  let router = express.Router();

  router.get("/atlas/:id/visualization", validationMdw, async (req: any, res) => {
    //TODO: Using presigned urls at the moment, instead of a public bucket, is a temporary solution for the moment.
    const atlasId = req.params.id;

    try {
      const atlas = await AtlasService.getAtlasById(atlasId);
      if (!atlas) return res.status(404).send("Atlas not found");
      let params: any = {
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: `atlas/${atlasId}/visualization.csv`,
        Expires: 60 * 60 * 24 * 7 - 1, // one week minus one second
      };
      let presignedUrl = await s3.getSignedUrlPromise("getObject", params);
      return res.status(200).contentType("text/plain").send(presignedUrl);
    } catch (err) {
      console.error(err);
      return res.status(500).send("Internal error");
    }
  });
  return router;
};

/**
 *  Get all available Archmap Core atlases.
 */
const get_allAtlases = (): Router => {
  let router = express.Router();

  router.get("/atlases", validationMdw, async (req: any, res) => {
    try {
      const atlases = await AtlasService.getAllAtlases();
      // check if the atlases are present in the GCP bucket
      // Delete the atlas from GCP
      const storage = new Storage({
        projectId: process.env.GCP_PROJECT_ID,
        credentials: {
          client_email: process.env.GCP_CLIENT_EMAIL,
          private_key: process.env.GCP_PRIVATE_KEY,
          client_id: process.env.GCP_CLIENT_ID,
        },

      });
      const bucketName = process.env.S3_BUCKET_NAME;
      

      const atlases_filtered = await Promise.all(atlases.map(async (atlas) => {
        const fileName = `atlas/${atlas._id}/data.h5ad`;
        const file = storage.bucket(bucketName).file(fileName);
        const [exists] = await file.exists();
        
        if (!exists) {
          return null; // Return null for non-existing atlases
        }
      
        return atlas; // Return the atlas object for existing atlases
      }));
      
      const filteredAtlases = atlases_filtered.filter(atlas => atlas !== null);
      const filteredAtlases2 = filteredAtlases.filter(atlas => atlas.inRevision == false);
      return res.status(200).json(filteredAtlases2);
    } catch (err) {
      console.error("Error accessing the atlases!");
      console.error(JSON.stringify(err));
      console.error(err);
      return res.status(500).send("Unable to access the atlases.");
    }
  });
  return router;
};

const get_scvi_atlases = (): Router => {
  let router = express.Router();

  router.get("/scvi-atlases", async(req: any, res) => {
    try{
      // Endpoint to get all scvi atlases
      const endpoint = "https://europe-west3-custom-helix-329116.cloudfunctions.net/scvi-atlases";
      const atlases = (await axios.get(endpoint)).data;

      const atlasMap = new Map();

      for (const item of atlases) {
        const atlas = item.atlasName.replace(/[-_]/g, " ");
        const model = item.modelName;
        const id = item.scviHubId;

        if (atlasMap.has(atlas)) {
          atlasMap.get(atlas).modelIds.push({model: model, scviHubId: id});
          atlasMap.get(atlas).compatibleModels.push(model);
        } else {
          atlasMap.set(atlas, {name: atlas, modelIds: [{model, scviHubId: id}], compatibleModels: [model] , scviAtlas: true});
        }
      }

      // Convert the map values to an array
      const atlasArr = Array.from(atlasMap.values());

      return res.status(200).json(atlasArr);
    }catch(err){
      console.error("Error accessing the atlases");
      console.error(JSON.stringify(err));
      console.error(err);
      return res.status(500).send("Unable to access the SCVI atlases.");
    }
  });
  return router;
}

const post_anndata_args = (): Router => {
  let router = express.Router();

  router.post("/model_setup_anndata_args", async(req: any, res) => {
    try{
      const { scviHubId } = req.body;
      const endpoint = "https://europe-west3-custom-helix-329116.cloudfunctions.net/scvi-atlas-anndata-args"; 

      const postData = {
        scviHubId: scviHubId
      };
      const response = await axios.post(endpoint, postData);

      const atlas = response.data;
      const model_setup_anndata_args = atlas[0].model_setup_anndata_args;

      res.status(200).send({"model_setup_anndata_args" : model_setup_anndata_args});
    }catch(err){
      res.status(500).send(err);
    }
  })
  
  return router;
}

// upload atlas by url or file
// const upload_atlas = (): Router => {
//   let router = express.Router();


//   router.post('/atlases/upload', validationMdw, upload_permission_auth() ,upload.fields([
//       { name: 'atlasFile', maxCount: 1 },
//       { name: 'modelFile_scANVI', maxCount: 1 },
//       { name: 'modelFile_scVI', maxCount: 1 },
//       { name: 'modelFile_scPoli', maxCount: 1 },
//       { name: 'classifierFile', maxCount: 1 }, // Optional
//       { name: 'encoderFile', maxCount: 1 } // Optional
//     ]), async (req: any, res) => {
      
//     let atlasDocument;
//     try {
//       if (!req.files.atlasFile && !req.body.atlasUrl) {
//         res.status(400).send("No atlas file uploaded.");
//         return;
//       }
      

//       // Validate and process classifier files
//       if (req.body.selectedClassifier && (!req.files.classifierFile || req.files.classifierFile.length === 0) && (!req.files.encoderFile || req.files.encoderFile.length === 0) ) {
//         return res.status(400).send("Classifier file is required when a classifier is selected.");
//       }
      
//       const compatibleModels = req.body.compatibleModels ? JSON.parse(req.body.compatibleModels) : [];
      
//       for (const modelName of compatibleModels) {
//         const fieldName = `modelFile_${modelName}_pt`;
//         if (!req.files[fieldName] || req.files[fieldName].length === 0) {
//           return res.status(400).send(`File for model ${modelName} not uploaded.`);
//         }
//       }



//       if (!req.files.atlasFile && req.body.atlasUrl === "") {
//         console.log("No atlas file uploaded.")
//         res.status(400).send("No Atlas  file uploaded.");
//         return;
//       }

//       // check if the env variables are set.
//       if (!process.env.GCP_PROJECT_ID || !process.env.GCP_CLIENT_EMAIL || !process.env.GCP_PRIVATE_KEY || !process.env.GCP_CLIENT_ID  || !process.env.S3_BUCKET_NAME) {
//         res.status(500).send("GCP_PROJECT_ID  or S3_BUCKET_NAME or GCP_CLIENT_EMAIL or GCP_PRIVATE_KEY or GCP_CLIENT_ID is not set."); 
//         return;
//       }

//       if(req.body.atlasUrl == undefined){
//         req.body.atlasUrl = "";
//       }
      
      

//       //a variable to keep track of all the stuffs that are uploaded to gcp bucket
//       let uploadedFiles = [];
      
//       const atlasData = {
//         name: req.body.name,
//         previewPictureURL: req.body.previewPictureURL,
//         modalities: req.body.modalities,
//         numberOfCells: req.body.numberOfCells,
//         species: req.body.species,
//         compatibleModels: req.body.compatibleModels,
//         uploadedBy: req.body.userId,
//         atlasUrl: req.body.atlasUrl,
//         inRevision: true
//       }

//       atlasDocument = await atlasModel.create(atlasData);

//       // TODO: use the already used methods
//       // Upload the file to GCP
//       const storage = new Storage({
//         projectId: process.env.GCP_PROJECT_ID,
//         credentials: {
//           client_email: process.env.GCP_CLIENT_EMAIL,
//           private_key: process.env.GCP_PRIVATE_KEY,
//           client_id: process.env.GCP_CLIENT_ID,
//         },

//       });


//       if(atlasData.atlasUrl == "" ){
//         const atlasFile = req.files.atlasFile[0];
//         const atlasFilename = atlasFile.filename;
//         const atlasFilePath = atlasFile.path;
      
//         const bucket = storage.bucket(process.env.S3_BUCKET_NAME);
//         const atlasBlob = bucket.file(`atlas/${atlasDocument._id}/data.h5ad`);

//         const fileNameTxt = `atlas/${atlasDocument._id}/${atlasDocument.name}.txt`;

//         const file = storage.bucket(bucketName).file(fileNameTxt);
//         await file.save(''); // Creates an empty file for naming consistency

//         const atlasBlobStream = atlasBlob.createWriteStream({
//           metadata: {
//             contentType: "application/octet-stream",
//           },
//         });
      
//         atlasBlobStream.on("error", (err) => {
//           console.error(err);
//           res.status(500).send("Failed to upload atlas file to GCP");
//         });
      
//         atlasBlobStream.on("finish", async () => {
//           console.log("Atlas file uploaded to GCP");
//           uploadedFiles.push(atlasBlob.name);
          
//         });
      
//         const atlasReadStream = fs.createReadStream(atlasFilePath);
//         atlasReadStream.pipe(atlasBlobStream);
//         atlasBlobStream.on("close", () => {
//           console.log("Atlas file upload process completed");
//           if (fs.existsSync(atlasFilePath)) fs.unlinkSync(atlasFilePath);
//         });
//       } else {

//         console.log("Downloading file from url: " + atlasData.atlasUrl + " using the post request to the server " + process.env.ATLAS_UPLOAD_URI);
//         const response = await axios.post(process.env.ATLAS_UPLOAD_URI, {
//           url: atlasData.atlasUrl,
//           path_to_store: `atlas/${atlasDocument._id}`,
//           file_name: "data.h5ad",
//         });
        
//         // check if its not 200
        
//         if (response.status !== 200) {
//           res.status(500).send("Failed to upload file to GCP");
//           return;
//         }
//         // Return the Atlas ID as a response
//         uploadedFiles.push(`atlas/${atlasDocument._id}/data.h5ad`);
//       }
      
//       // now upload the model file. Model file path is obtained from AtlasModelAssociation atlas service

//       for (const modelName of compatibleModels) {
//         if (modelName=="scPoli") {
//           const modelFile = req.files.ptFile[0];
//           const pklFile = req.files.pklFile[0];
//           const csvFile = req.files.csvFile[0];
//         }
//         else {
//           const fieldName = `modelFile_${modelName}_pt`;
//           const modelFile = req.files[fieldName][0];
//           const modelFilename = modelFile.filename;
//           const modelFilePath = modelFile.path;

//           const bucket = storage.bucket(process.env.S3_BUCKET_NAME);
//           const model = await ModelService.getModelByName(modelName);
//           const modelMongoId = await AtlasModelAssociationService.createAssociation(atlasDocument._id, model._id);
//           const fileName = 'models/' + modelMongoId._id + '/' + atlasDocument.name + '-' + model.name + '.txt'; 

//           const file = storage.bucket(bucketName).file(fileName);
//           await file.save(''); // Creates an empty file for naming consistency
//           console.log("sucessfully created empty file for model " + model.name + " and atlas " + atlasDocument.name);
//           console.log("file name is " + fileName);
//           const modelBlob = bucket.file(`models/${modelMongoId._id}/model.pt`);
//           const modelBlobStream = modelBlob.createWriteStream({
//             metadata: {
//               contentType: "application/octet-stream",
//             },
//           });
//           modelBlobStream.on("error", (err) => {
//             console.error(err);
//             res.status(500).send("Failed to upload model file to GCP");
//           });
    
//           modelBlobStream.on("finish", async () => {
//             console.log("Model file uploaded to GCP");
//             uploadedFiles.push(modelBlob.name);
//             if(!req.files.classifierFile){
//               console.log("Atlas upload process completed with the following files uploaded: " , uploadedFiles);
//               // return the successfull status with uploaded files
//               return res.status(200).json({atlasId: atlasDocument._id, uploadedFiles: uploadedFiles});
//             }
//           });

//           const modelBlobReadStream = fs.createReadStream(modelFilePath);
//           modelBlobReadStream.pipe(modelBlobStream);
//           modelBlobStream.on("close", () => {
//             console.log("Model file upload process completed");
//             if (fs.existsSync(modelFilePath)) fs.unlinkSync(modelFilePath);
//           });
//         } 

//       }

//       // and then upload the classifier file if it exists
//       console.log("now uploading classifier file", req.body.selectedClassifier)
//       if(req.files.classifierFile && req.body.selectedClassifier){
//         const classifierFile = req.files.classifierFile[0];
//         const classifierFilename = classifierFile.filename;
//         const classifierFilePath = classifierFile.path;
//         console.log("now uploading classifier file 2")

//         let classifierFilePathInBucket = `classifiers/${atlasDocument._id}/`;
//         switch (req.body.selectedClassifier) {
//           case "KNN":
//             classifierFilePathInBucket += "classifier_knn.pickle";
//             break;
//           case "XGBoost":
//             classifierFilePathInBucket += "classifier_xgb.ubj";
//             break;
//           default:
//             return res.status(400).send("Invalid classifier selected");
            
//         }

        
//         const bucket = storage.bucket(process.env.S3_BUCKET_NAME);
//         const classifierBlob = bucket.file(classifierFilePathInBucket);
//         const classifierBlobStream = classifierBlob.createWriteStream({
//           metadata: {
//             contentType: "application/octet-stream",
//           },
//         });

//         classifierBlobStream.on("error", (err) => {
//           console.error(err);
//           res.status(500).send("Failed to upload classifier file to GCP");
//         });

//         classifierBlobStream.on("finish", async () => {
//           console.log("Classifier file uploaded to GCP");
//           uploadedFiles.push(classifierBlob.name);
//         });

//         const classifierReadStream = fs.createReadStream(classifierFilePath);
//         classifierReadStream.pipe(classifierBlobStream);
//         classifierBlobStream.on("close", () => {
//           console.log("Classifier file upload process completed");
//           if (fs.existsSync(classifierFilePath)) fs.unlinkSync(classifierFilePath);
//         });
//       }

//       // and then upload the encoder file if it exists the same steps except the file name is classifier_encoding.pickle in the end

//       if (req.files.encoderFile && req.body.selectedClassifier) {
//         const encoderFile = req.files.encoderFile[0];
//         const encoderFilename = encoderFile.filename;
//         const encoderFilePath = encoderFile.path;

//         let encoderFilePathInBucket = `classifiers/${atlasDocument._id}/classifier_encoding.pickle`;
        

//         const bucket = storage.bucket(process.env.S3_BUCKET_NAME);
//         const encoderBlob = bucket.file(encoderFilePathInBucket);
//         const encoderBlobStream = encoderBlob.createWriteStream({
//           metadata: {
//             contentType: "application/octet-stream",
//           },
//         });

//         encoderBlobStream.on("error", (err) => {
//           console.error(err);
//           res.status(500).send("Failed to upload encoder file to GCP");
//         });

//         encoderBlobStream.on("finish", async () => {
//           console.log("Encoder file uploaded to GCP");
//           uploadedFiles.push(encoderBlob.name);
//           console.log("Atlas upload process completed with the following files uploaded: " , uploadedFiles);
//           // return the successfull status with uploaded files
//           return res.status(200).json({atlasId: atlasDocument._id, uploadedFiles: uploadedFiles});
//         });

//         const encoderReadStream = fs.createReadStream(encoderFilePath);
//         encoderReadStream.pipe(encoderBlobStream);
//         encoderBlobStream.on("close", () => {
//           console.log("Encoder file upload process completed");
//           if (fs.existsSync(encoderFilePath)) fs.unlinkSync(encoderFilePath);
//         });
//       }
      
      
       
//     } catch (err) {
//       console.error(err);
//       return res.status(500).send("Internal error");
//     }

    
//   })
//   return router;
// }

const edit_atlas = (): Router => {
  let router = express.Router();

  router.put("/api/atlases/:id", upload_permission_auth(), validationMdw, async (req: any, res) => {
    try {
      const atlasId = req.params.id;

      const updatedAtlasData = req.body; //req.body is the data sent by the client

      // Check if the atlas exists in MongoDB
      const atlasDocument = await atlasModel.findById(atlasId);
      if (!atlasDocument) {
        return res.status(404).send("Atlas not found");
      }

      // Update the atlas in MongoDB
      await atlasModel.findByIdAndUpdate(atlasId, updatedAtlasData);
      res.sendStatus(204);
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    }
    
  });
  return router;
};


// TODO: Move this to a util 
export const deleteAtlasById = async (atlasId) => {
  await atlasModel.findByIdAndDelete(atlasId);

  // Delete the atlas from GCP
  const storage = new Storage({
    projectId: process.env.GCP_PROJECT_ID,
    credentials: {
      client_email: process.env.GCP_CLIENT_EMAIL,
      private_key: process.env.GCP_PRIVATE_KEY,
      client_id: process.env.GCP_CLIENT_ID,
    },

  });
  const bucketName = process.env.S3_BUCKET_NAME;
  const fileName = `atlas/${atlasId}/data.h5ad`;
  const file = storage.bucket(bucketName).file(fileName);

  const [exists] = await file.exists();
  if (exists) {
    await file.delete();
    console.log("Atlas file deleted from GCP", fileName);
    
  }
  // check for the model files and delete them as well
  const modelAssociation = await AtlasModelAssociation.findOne({atlasId: atlasId});
  if(modelAssociation){
    const model = await ModelService.getModelById(modelAssociation._id);
    const modelFileName = `models/${modelAssociation._id}/model.pt`;
    const modelFile = storage.bucket(bucketName).file(modelFileName);
    const [exists] = await modelFile.exists();
    if (exists) {

      await modelFile.delete();
      console.log("Model file deleted from GCP", modelFileName);
    }
  }

  // check if the classifier files and encoder files are present as well
  const classifierFileNameKNN = `classifiers/${atlasId}/classifier_knn.pickle`;
  const classifierFileKNN = storage.bucket(bucketName).file(classifierFileNameKNN);
  const [existsKNN] = await classifierFileKNN.exists();
  if (existsKNN) {
    await classifierFileKNN.delete(); 
    console.log("KNN classifier file deleted from GCP", classifierFileNameKNN);
  }

  const classifierFileNameXGB = `classifiers/${atlasId}/classifier_xgb.ubj`;
  const classifierFileXGB = storage.bucket(bucketName).file(classifierFileNameXGB);
  const [existsXGB] = await classifierFileXGB.exists();
  if (existsXGB) {
    await classifierFileXGB.delete(); 
    console.log("XGB classifier file deleted from GCP", classifierFileNameXGB);
  }

  const encoderFileName = `classifiers/${atlasId}/classifier_encoding.pickle`;
  const encoderFile = storage.bucket(bucketName).file(encoderFileName);
  const [existsEncoder] = await encoderFile.exists();
  if (existsEncoder) {
    await encoderFile.delete(); 
    console.log("Encoder file deleted from GCP", encoderFileName);
  }
  return true;
};


const delete_atlas = (): Router => {
  let router = express.Router();
  
  router.delete("/api/atlases/:id", validationMdw, upload_permission_auth(), async (req: any, res) => {
    
    try {
      const atlasId = req.params.id;
  
      // Check if the atlas exists in MongoDB
      const atlasDocument = await atlasModel.findById(atlasId);
      if (!atlasDocument) {
        return res.status(404).send("Atlas not found");
      }
  
      const resp = await deleteAtlasById(atlasId);
      if (!resp) {
        return res.status(404).send("Atlas not found");
      } else {
        console.log("Atlas deleted from GCP");
        res.sendStatus(204);
      }
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    }
  });
  return router;
};


// export { get_atlas, get_atlas_visualization, get_allAtlases, upload_atlas, edit_atlas, delete_atlas, get_scvi_atlases, post_anndata_args };
export { get_atlas, get_atlas_visualization, get_allAtlases, edit_atlas, delete_atlas, get_scvi_atlases, post_anndata_args };
