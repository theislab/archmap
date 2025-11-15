import express, { Router } from "express";
import AtlasService from "../../../../database/services/atlas.service";
import s3 from "../../../../util/s3";
import { validationMdw } from "../../middleware/validation";

import { Storage } from "@google-cloud/storage";

import multer from "multer";
import optional_auth from "../../middleware/check_auth";
import tar from 'tar-stream';
import zlib from 'zlib';
import { pipeline } from 'stream';
import { ExtRequest } from "../../../../definitions/ext_request";

import fs from "fs";
import { atlasModel } from "../../../../database/models/atlas";
import axios from "axios";
import { upload_permission_auth } from "../../middleware/check_institution_auth";
import { AtlasModelAssociation } from "../../../../database/models/atlas_model_association";
import AtlasModelAssociationService from "../../../../database/services/atlas_model_association.service";
import ModelService from "../../../../database/services/model.service";
import AtlasUpdateTokenService from "../../../../database/services/atlas_update_token.service.js";
import { UpdateAtlasDTO } from "../../../../database/dtos/atlas.dto";
import { result_benchmark_path } from "../file_upload/bucket_filepaths";

import util from "util";


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

const get_user_atlases = (): Router => {
  let router = express.Router();
  router.get("/youratlases", validationMdw, optional_auth(), async (req: any, res) => {
    try {
      const loggedInUserId = req.user_id; // Assuming req.user.id contains the logged-in user's ID

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
      
      const filteredAtlases1 = atlases_filtered.filter(atlas => atlas !== null);

      // filter out private atlases
      // Check for logged-in user
      
      // Get atlases uploaded by user
      const filteredAtlases = filteredAtlases1.filter(atlas => {
          loggedInUserId && atlas.uploadedBy === loggedInUserId;
          });

      return res.status(200).json(filteredAtlases);
    } catch (err) {
      console.error("Error accessing the atlases!");
      console.error(JSON.stringify(err));
      console.error(err);
      return res.status(500).send("Unable to access the atlases.");
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


import jwt from "jsonwebtoken";


// Helper function to generate a random public JWT
function generatePublicAtlasToken(): string {
  const payload = { role: "public" };
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "1h" });
}

// const get_allAtlases_old = (): Router => {
//   let router = express.Router();

//   router.get("/atlases", validationMdw, optional_auth(), async (req: any, res) => {
//     try {
//       const atlases = await AtlasService.getAllAtlases();
//       // check if the atlases are present in the GCP bucket
//       // Delete the atlas from GCP
//       const storage = new Storage({
//         projectId: process.env.GCP_PROJECT_ID,
//         credentials: {
//           client_email: process.env.GCP_CLIENT_EMAIL,
//           private_key: process.env.GCP_PRIVATE_KEY,
//           client_id: process.env.GCP_CLIENT_ID,
//         },

//       });
//       const bucketName = process.env.S3_BUCKET_NAME;
      

//       const atlases_filtered = await Promise.all(atlases.map(async (atlas) => {
//         const fileName = `atlas/${atlas._id}/data.h5ad`;
//         const file = storage.bucket(bucketName).file(fileName);
//         const [exists] = await file.exists();
        
//         if (!exists) {
//           return null; // Return null for non-existing atlases
//         }
      
//         return atlas; // Return the atlas object for existing atlases
//       }));
      
//       const filteredAtlases1 = atlases_filtered.filter(atlas => atlas !== null);

//       // filter out private atlases
//       // Check for logged-in user
//       const loggedInUserId = req.user_id; // Assuming req.user.id contains the logged-in user's ID

//       // Filter atlases
//       const filteredAtlases = filteredAtlases1.filter(atlas => {
//           if (atlas.isPrivate) {
//               // Exclude if atlas is private and either no user is logged in or the IDs don't match
//               return loggedInUserId && atlas.uploadedBy === loggedInUserId;
//           }
//           // Include public atlases
//           return true;
//       });
//       // check user == atlas.uploadedBy 
//       return res.status(200).json(filteredAtlases);
//     } catch (err) {
//       console.error("Error accessing the atlases!");
//       console.error(JSON.stringify(err));
//       console.error(err);
//       return res.status(500).send("Unable to access the atlases.");
//     }
//   });
//   return router;
// };

const get_allAtlases = (): Router => {
  const router = express.Router();

  router.get("/atlases", check_auth(), async (req: any, res) => {
    try {
      // If no JWT provided, auto-generate public one
      let public_jwt: string | null = null;
      if (!req.is_authenticated) {
        public_jwt = generatePublicAtlasToken();
      }

      const atlases = await AtlasService.getAllAtlases();

      const storage = new Storage({
        projectId: process.env.GCP_PROJECT_ID,
        credentials: {
          client_email: process.env.GCP_CLIENT_EMAIL,
          private_key: process.env.GCP_PRIVATE_KEY,
          client_id: process.env.GCP_CLIENT_ID,
        },
      });

      const bucketName = process.env.S3_BUCKET_NAME;

      const atlases_filtered = await Promise.all(
        atlases.map(async (atlas) => {
          const file = storage.bucket(bucketName).file(`atlas/${atlas._id}/data.h5ad`);
          const [exists] = await file.exists();
          return exists ? atlas : null;
        })
      );

      const filteredAtlases = atlases_filtered.filter(atlas => atlas !== null);

      const loggedInUserId = req.user_id;

      // Filter private atlases for guests
      const visibleAtlases = filteredAtlases.filter((atlas) => {
        if (atlas.isPrivate) {
          return loggedInUserId && atlas.uploadedBy === loggedInUserId;
        }
        return true;
      });

      // Send the data back
      return res.status(200).json(visibleAtlases);
    } catch (err) {
      console.error("Error accessing the atlases!", err);
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


const trigger_cloud_run_job = (): Router => {
  let router = express.Router();

  router.post("/trigger-job", async(req: any, res)=> {
    try {
      const endpoint = "https://europe-west3-custom-helix-329116.cloudfunctions.net/trigger-job";
      console.log("endpoint", endpoint)

      console.log(req.body.atlasId)

      //Create a token, which can be used later to update the projects status
      let { token: updateToken } = await AtlasUpdateTokenService.addToken({
        _atlasId: req.body.atlasId,
      });

      req.body.webhook = `${process.env.API_URL}/atlasbenchmark/updatestatus/${updateToken}`

      console.log("req:", req.body) 
    

      // Send the POST request
      const response = await axios.post(endpoint, req.body);

      // Respond to the client with the result
      res.status(200).json({
        message: "Job triggered successfully",
        data: response.data,
      });
    } catch (error) {
      // Handle errors gracefully
      console.error("Error triggering job:", error.message);

      res.status(error.response?.status || 500).json({
        message: "Failed to trigger the job",
        error: error.response?.data || error.message,
      });
    }
  })

  // Return the router
  return router;
}


const update_atlas_benchmark_status = (): Router => {
  const router = express.Router();

  router.post(
    "/atlasbenchmark/updatestatus/:token",
    validationMdw,
    async (req: any, res) => {
      try {
        const updateToken = req.params.token;

        // Validate the update token
        const tokenObject = await AtlasUpdateTokenService.getTokenByToken(updateToken);
        if (!tokenObject) {
          return res.status(404).send("Invalid token");
        }

        // Fetch the atlas
        const atlas = await AtlasService.getAtlasById(tokenObject._atlasId);
        if (!atlas) {
          return res.status(404).send("Atlas not found");
        }

        // Fetch the model
        const modelName = atlas.compatibleModels?.[0];
        if (!modelName) {
          return res.status(400).send("No compatible models found for the atlas");
        }

        const model = await ModelService.getModelByName(modelName);
        if (!model) {
          return res.status(404).send("Model not found");
        }

        // Fetch the association
        const association = await AtlasModelAssociationService.getOneByAtlasAndModelId(
          atlas._id,
          model._id
        );
        if (!association) {
          return res.status(404).send("Association not found");
        }

        // Update atlas benchmark status
        const updateStatus: UpdateAtlasDTO = { benchmarked: true };
        await AtlasService.updateAtlasById(atlas._id, updateStatus);

        // Generate and save benchmark results URL

        const bucketName = process.env.S3_BUCKET_NAME;
        if (!bucketName) {
          return res.status(500).send("S3_BUCKET_NAME environment variable is missing");
        }

        // let params: any = {
        //   Bucket: process.env.S3_BUCKET_NAME!,
        //   Key: result_benchmark_path(association._id),
        //   Expires: 60 * 60 * 24 * 7 - 1, // one week minus one second
        // };
        // let benchmarkResultsUrl = await s3.getSignedUrlPromise("getObject", params);

        let benchmarkResultsUrl = result_benchmark_path(association._id)
        const updateLocation: UpdateAtlasDTO = {
          benchmark_location: benchmarkResultsUrl,
        };
        await AtlasService.updateAtlasById(atlas._id, updateLocation);

      

        return res.status(200).send("OK");
      } catch (error) {
        console.error("Error updating atlas benchmark status:", error);
        return res.status(500).send("Internal server error");
      }
    }
  );

  return router;
};



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
const upload_atlas = (): Router => {
  let router = express.Router();


  router.post('/atlases/upload', validationMdw, upload_permission_auth() ,upload.fields([
      { name: 'atlasFile', maxCount: 1 },
      { name: 'modelFile_scANVI', maxCount: 1 },
      { name: 'modelFile_scVI', maxCount: 1 },
      { name: 'classifierFile', maxCount: 1 }, // Optional
      { name: 'encoderFile', maxCount: 1 } // Optional
    ]), async (req: any, res) => {
      
    let atlasDocument;
    try {
      if (!req.files.atlasFile && !req.body.atlasUrl) {
        res.status(400).send("No atlas file uploaded.");
        return;
      }
      

      // Validate and process classifier files
      if (req.body.selectedClassifier && (!req.files.classifierFile || req.files.classifierFile.length === 0) && (!req.files.encoderFile || req.files.encoderFile.length === 0) ) {
        return res.status(400).send("Classifier file is required when a classifier is selected.");
      }
      
      const compatibleModels = req.body.compatibleModels ? JSON.parse(req.body.compatibleModels) : [];
      
      for (const modelName of compatibleModels) {
        const fieldName = `modelFile_${modelName}`;
        if (!req.files[fieldName] || req.files[fieldName].length === 0) {
          return res.status(400).send(`File for model ${modelName} not uploaded.`);
        }
      }



      if (!req.files.atlasFile && req.body.atlasUrl === "") {
        console.log("No atlas file uploaded.")
        res.status(400).send("No Atlas  file uploaded.");
        return;
      }

      // check if the env variables are set.
      if (!process.env.GCP_PROJECT_ID || !process.env.GCP_CLIENT_EMAIL || !process.env.GCP_PRIVATE_KEY || !process.env.GCP_CLIENT_ID  || !process.env.S3_BUCKET_NAME) {
        res.status(500).send("GCP_PROJECT_ID  or S3_BUCKET_NAME or GCP_CLIENT_EMAIL or GCP_PRIVATE_KEY or GCP_CLIENT_ID is not set."); 
        return;
      }

      if(req.body.atlasUrl == undefined){
        req.body.atlasUrl = "";
      }
      
      

      //a variable to keep track of all the stuffs that are uploaded to gcp bucket
      let uploadedFiles = [];
      
      const atlasData = {
        name: req.body.name,
        batchKey: req.body.batchKey,
        cellTypeKey: req.body.cellTypeKey,
        previewPictureURL: req.body.previewPictureURL,
        classifierLabels: req.body.classifierLabels,
        modalities: req.body.modalities,
        numberOfCells: req.body.numberOfCells,
        species: req.body.species,
        uploadedBy: req.body.userId,
        atlasUrl: req.body.atlasUrl,
        inrevision: req.body.inrevision,
        isPrivate: req.body.isPrivate,
        benchmarked: req.body.benchmarked,
        doi: req.body.doi,
        samples: req.body.samples,
        individuals: req.body.individuals,
        datasets: req.body.datasets,
        compatibleModels: req.body.compatibleModels,

      }

      atlasDocument = await atlasModel.create(atlasData);

      // TODO: use the already used methods
      // Upload the file to GCP
      const storage = new Storage({
        projectId: process.env.GCP_PROJECT_ID,
        credentials: {
          client_email: process.env.GCP_CLIENT_EMAIL,
          private_key: process.env.GCP_PRIVATE_KEY,
          client_id: process.env.GCP_CLIENT_ID,
        },

      });


      if(atlasData.atlasUrl == "" ){
        const atlasFile = req.files.atlasFile[0];
        const atlasFilename = atlasFile.filename;
        const atlasFilePath = atlasFile.path;
      
        const bucket = storage.bucket(process.env.S3_BUCKET_NAME);
        const atlasBlob = bucket.file(`atlas/${atlasDocument._id}/data.h5ad`);

        const fileNameTxt = `atlas/${atlasDocument._id}/${atlasDocument.name}.txt`;

        const file = storage.bucket(bucketName).file(fileNameTxt);
        await file.save(''); // Creates an empty file for naming consistency

        const atlasBlobStream = atlasBlob.createWriteStream({
          metadata: {
            contentType: "application/octet-stream",
          },
        });
      
        atlasBlobStream.on("error", (err) => {
          console.error(err);
          res.status(500).send("Failed to upload atlas file to GCP");
        });
      
        atlasBlobStream.on("finish", async () => {
          console.log("Atlas file uploaded to GCP");
          uploadedFiles.push(atlasBlob.name);
          
        });
      
        const atlasReadStream = fs.createReadStream(atlasFilePath);
        atlasReadStream.pipe(atlasBlobStream);
        atlasBlobStream.on("close", () => {
          console.log("Atlas file upload process completed");
          if (fs.existsSync(atlasFilePath)) fs.unlinkSync(atlasFilePath);
        });
      } else {

        console.log("Downloading file from url: " + atlasData.atlasUrl + " using the post request to the server " + process.env.ATLAS_UPLOAD_URI);
        const response = await axios.post(process.env.ATLAS_UPLOAD_URI, {
          url: atlasData.atlasUrl,
          path_to_store: `atlas/${atlasDocument._id}`,
          file_name: "data.h5ad",
        });
        
        // check if its not 200
        
        if (response.status !== 200) {
          res.status(500).send("Failed to upload file to GCP");
          return;
        }
        // Return the Atlas ID as a response
        uploadedFiles.push(`atlas/${atlasDocument._id}/data.h5ad`);
      }
      
      // now upload the model file. Model file path is obtained from AtlasModelAssociation atlas service

      for (const modelName of compatibleModels) {
        const fieldName = `modelFile_${modelName}`;
        const modelFile = req.files[fieldName][0];
        const modelFilename = modelFile.filename;
        const modelFilePath = modelFile.path;

        const bucket = storage.bucket(process.env.S3_BUCKET_NAME);
        const model = await ModelService.getModelByName(modelName);
        const modelMongoId = await AtlasModelAssociationService.createAssociation(atlasDocument._id, model._id);
        const fileName = 'models/' + modelMongoId._id + '/' + atlasDocument.name + '-' + model.name + '.txt'; 

        const file = storage.bucket(bucketName).file(fileName);
        await file.save(''); // Creates an empty file for naming consistency
        console.log("sucessfully created empty file for model " + model.name + " and atlas " + atlasDocument.name);
        console.log("file name is " + fileName);
        const modelBlob = bucket.file(`models/${modelMongoId._id}/model.pt`);
        const modelBlobStream = modelBlob.createWriteStream({
          metadata: {
            contentType: "application/octet-stream",
          },
        });
        modelBlobStream.on("error", (err) => {
          console.error(err);
          res.status(500).send("Failed to upload model file to GCP");
        });
  
        modelBlobStream.on("finish", async () => {
          console.log("Model file uploaded to GCP");
          uploadedFiles.push(modelBlob.name);
          if(!req.files.classifierFile){
            console.log("Atlas upload process completed with the following files uploaded: " , uploadedFiles);
            // return the successfull status with uploaded files
            return res.status(200).json({atlasId: atlasDocument._id, uploadedFiles: uploadedFiles});
          }

        });
  
        const modelBlobReadStream = fs.createReadStream(modelFilePath);
        modelBlobReadStream.pipe(modelBlobStream);
        modelBlobStream.on("close", () => {
          console.log("Model file upload process completed");
          if (fs.existsSync(modelFilePath)) fs.unlinkSync(modelFilePath);
        });

      }

      // and then upload the classifier file if it exists
      console.log("now uploading classifier file", req.body.selectedClassifier)
      if(req.files.classifierFile && req.body.selectedClassifier){
        const classifierFile = req.files.classifierFile[0];
        const classifierFilename = classifierFile.filename;
        const classifierFilePath = classifierFile.path;
        console.log("now uploading classifier file 2")

        let classifierFilePathInBucket = `classifiers/${atlasDocument._id}/`;
        switch (req.body.selectedClassifier) {
          case "KNN":
            classifierFilePathInBucket += "classifier_knn.pickle";
            break;
          case "XGBoost":
            classifierFilePathInBucket += "classifier_xgb.ubj";
            break;
          default:
            return res.status(400).send("Invalid classifier selected");
            
        }

        
        const bucket = storage.bucket(process.env.S3_BUCKET_NAME);
        const classifierBlob = bucket.file(classifierFilePathInBucket);
        const classifierBlobStream = classifierBlob.createWriteStream({
          metadata: {
            contentType: "application/octet-stream",
          },
        });

        classifierBlobStream.on("error", (err) => {
          console.error(err);
          res.status(500).send("Failed to upload classifier file to GCP");
        });

        classifierBlobStream.on("finish", async () => {
          console.log("Classifier file uploaded to GCP");
          uploadedFiles.push(classifierBlob.name);
        });

        const classifierReadStream = fs.createReadStream(classifierFilePath);
        classifierReadStream.pipe(classifierBlobStream);
        classifierBlobStream.on("close", () => {
          console.log("Classifier file upload process completed");
          if (fs.existsSync(classifierFilePath)) fs.unlinkSync(classifierFilePath);
        });
      }

      // and then upload the encoder file if it exists the same steps except the file name is classifier_encoding.pickle in the end

      if (req.files.encoderFile && req.body.selectedClassifier) {
        const encoderFile = req.files.encoderFile[0];
        const encoderFilename = encoderFile.filename;
        const encoderFilePath = encoderFile.path;

        let encoderFilePathInBucket = `classifiers/${atlasDocument._id}/classifier_encoding.pickle`;
        

        const bucket = storage.bucket(process.env.S3_BUCKET_NAME);
        const encoderBlob = bucket.file(encoderFilePathInBucket);
        const encoderBlobStream = encoderBlob.createWriteStream({
          metadata: {
            contentType: "application/octet-stream",
          },
        });

        encoderBlobStream.on("error", (err) => {
          console.error(err);
          res.status(500).send("Failed to upload encoder file to GCP");
        });

        encoderBlobStream.on("finish", async () => {
          console.log("Encoder file uploaded to GCP");
          uploadedFiles.push(encoderBlob.name);
          console.log("Atlas upload process completed with the following files uploaded: " , uploadedFiles);
          // return the successfull status with uploaded files
          return res.status(200).json({atlasId: atlasDocument._id, uploadedFiles: uploadedFiles});
        });

        const encoderReadStream = fs.createReadStream(encoderFilePath);
        encoderReadStream.pipe(encoderBlobStream);
        encoderBlobStream.on("close", () => {
          console.log("Encoder file upload process completed");
          if (fs.existsSync(encoderFilePath)) fs.unlinkSync(encoderFilePath);
        });
      }
      
      
       
    } catch (err) {
      console.error(err);
      return res.status(500).send("Internal error");
    }

    
  })
  return router;
}

const edit_atlas = (): Router => {
  let router = express.Router();

  router.put("/api/atlases/:id", upload_permission_auth(), validationMdw, async (req: any, res) => {
    try {
      const atlasId = req.params.id;

      const updatedAtlasData = req.body; //req.body is the data sent by the client

      console.log(updatedAtlasData)

      // Check if the atlas exists in MongoDB
      const atlasDocument = await atlasModel.findById(atlasId);
      if (!atlasDocument) {
        return res.status(404).send("Atlas not found");
      }

      // Update the atlas in MongoDB
      await atlasModel.findByIdAndUpdate(atlasId, updatedAtlasData);
      res.sendStatus(204);
      console.log("added data")
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
  const modelAssociation = await AtlasModelAssociation.findOne({atlas: atlasId});
  if (modelAssociation) {
    const modelFolderPath = `models/${modelAssociation._id}/`; // Define folder path
    const [files] = await storage.bucket(bucketName).getFiles({ prefix: modelFolderPath });
  
    if (files.length > 0) {
      await Promise.all(files.map(file => file.delete())); // Delete all files asynchronously
      console.log(`All files in folder ${modelFolderPath} deleted from GCP`);
    } else {
      console.log(`No files found in folder ${modelFolderPath}`);
    }
  }
  return true;
};

const generatePresignedUrls = async (fileNames: string[], bucketName: string) => {
  try {
    const presignedUrls = await Promise.all(
      fileNames.map(async (fileName) => {
        const params: any = {
          Bucket: bucketName,
          Key: fileName,
          Expires: 60 * 60 * 24 * 7 - 1, // one week minus one second
        };
        return {
          fileName: fileName,
          presignedUrl: await s3.getSignedUrlPromise("getObject", params),
        };
      })
    );

    return presignedUrls;
  } catch (error) {
    console.error("Error generating presigned URLs:", error);
    throw new Error("Failed to generate presigned URLs");
  }
};

const download_atlas = (): Router => {
  let router = express.Router();
  router.post("/file_download/atlas_files", validationMdw, async (req: ExtRequest, res) => {
    console.log("POST /file_download/atlas_files");

    let {atlasId} = req.body;

    try {

      const storage = new Storage({
        projectId: process.env.GCP_PROJECT_ID,
        credentials: {
          client_email: process.env.GCP_CLIENT_EMAIL,
          private_key: process.env.GCP_PRIVATE_KEY,
          client_id: process.env.GCP_CLIENT_ID,
        },
    
      });

      if (!process.env.S3_BUCKET_NAME) {
        return res.status(500).send("S3-BucketName is not set");
      }

      const bucketName = process.env.S3_BUCKET_NAME!

      let allFiles = [];

      const fileName_atlas = `atlas/${atlasId}/data.h5ad`;
      const file_atlas = storage.bucket(bucketName).file(fileName_atlas);
      const [exists_atlas] = await file_atlas.exists();
      if (exists_atlas) allFiles.push(fileName_atlas);

      const modelAssociation = await AtlasModelAssociation.findOne({ atlas: atlasId });
      if (modelAssociation) {
        const modelFolderPath = `models/${modelAssociation._id}`;

        const fileNames_models = [
          `${modelFolderPath}/model.pt`,
          `${modelFolderPath}/model_params.pt`,
          `${modelFolderPath}/attr.pkl`,
          `${modelFolderPath}/var_names.csv`
        ];
        
        for (const fileName of fileNames_models) {
          const file = storage.bucket(bucketName).file(fileName);
          const [exists] = await file.exists();
          
          if (exists) {
            allFiles.push(fileName);
          }
        }
      }
        
    
      const fileName_counts = `atlas/${atlasId}/data_only_count.h5ad`;
      const fileExists = await s3
        .headObject({ Bucket: bucketName, Key: fileName_counts })
        .promise()
        .then(() => true)
        .catch(() => false); // Returns false if the file does not exist
      if (fileExists) {
        allFiles.push(fileName_counts);
      }

      console.log(allFiles);

      const urls = await generatePresignedUrls(allFiles, bucketName);

      console.log(urls);

      return res.status(200).send(urls);
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  })
  return router;
}


// export const downloadAtlasById = async (atlasId, res) => {
//   try {
//     const storage = new Storage({
//       projectId: process.env.GCP_PROJECT_ID,
//       credentials: {
//         client_email: process.env.GCP_CLIENT_EMAIL,
//         private_key: process.env.GCP_PRIVATE_KEY,
//         client_id: process.env.GCP_CLIENT_ID,
//       },
//     });

//     let allFiles = [];
//     const bucketName = process.env.S3_BUCKET_NAME;

//     const atlas = await AtlasService.getAtlasById(atlasId);

//     // Add atlas file
//     const fileName_atlas = `atlas/${atlasId}/data.h5ad`;
//     const file_atlas = storage.bucket(bucketName).file(fileName_atlas);
//     const [exists_atlas] = await file_atlas.exists();
//     if (exists_atlas) allFiles.push(file_atlas);

//     // Add count data file
//     const fileName_counts = `atlas/${atlasId}/data_only_count.h5ad`;
//     const file_counts = storage.bucket(bucketName).file(fileName_counts);
//     const [exists_counts] = await file_counts.exists();
//     if (exists_counts) allFiles.push(file_counts);

//     // Add model files
//     const modelAssociation = await AtlasModelAssociation.findOne({ atlas: atlasId });
//     if (modelAssociation) {
//       const modelFolderPath = `models/${modelAssociation._id}/`;
//       const [files] = await storage.bucket(bucketName).getFiles({ prefix: modelFolderPath });
//       if (files.length > 0) {
//         allFiles = allFiles.concat(files);
//       } else {
//         console.log(`No files found in folder ${modelFolderPath}`);
//       }
//     }

//     console.log(`All files to be downloaded:`, allFiles.map(f => f.name));

//     // Set response headers for tar.gz
//     res.setHeader("Content-Disposition", `attachment; filename="atlas_${atlas.name}.tar.gz"`);
//     res.setHeader("Content-Type", "application/gzip");

//     // Create tar and gzip streams
//     const tarStream = tar.pack();
//     const gzip = zlib.createGzip();

//     // Pipe tar -> gzip -> response
//     pipeline(tarStream, gzip, res, (err) => {
//       if (err) {
//         console.error("Error streaming tar.gz file:", err);
//         res.status(500).send("Error generating download.");
//       } else {
//         console.log("Tar.gz file sent successfully.");
//       }
//     });

//     // Process files concurrently
//     await Promise.all(allFiles.map(async (file) => {
//       try {
//         // Check if metadata exists before streaming
//         const [metadata] = await file.getMetadata().catch(err => {
//           console.error(`Error getting metadata for file ${file.name}:`, err);
//           return [null]; // Return null to indicate failure
//         });

//         if (!metadata) {
//           console.error(`Skipping file ${file.name} due to missing metadata.`);
//           return;
//         }

//         const fileStream = file.createReadStream();

//         fileStream.on("error", (err) => {
//           console.error(`Error reading file ${file.name}:`, err);
//         });

//         const entry = tarStream.entry({ name: file.name }, (err, entryStream) => {
//           if (err) {
//             console.error("Error adding file to tar:", file.name, err);
//           } else {
//             fileStream.pipe(entryStream);
//           }
//         });

//         if (!entry) {
//           console.error(`Failed to create tar entry for ${file.name}`);
//           return;
//         }

//       } catch (error) {
//         console.error(`Error processing file ${file.name}:`, error);
//       }
//     }));

//     // Finalize tar stream
//     tarStream.finalize();

//   } catch (err) {
//     console.error("Error processing download:", err);
//     res.status(500).send("Error processing request.");
//   }
// };



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

// const download_atlas = (): Router => {
//   let router = express.Router();

//   router.get("/api/download_atlas/:id", validationMdw, upload_permission_auth(), async (req: any, res) => {
//     try {
//       const atlasId = req.params.id;

//       // Check if the atlas exists in MongoDB
//       const atlasDocument = await atlasModel.findById(atlasId);
//       if (!atlasDocument) {
//         return res.status(404).send("Atlas not found");
//       }

//       // Directly call the function to stream the file
//       await downloadAtlasById(atlasId, res);

//       console.log("Atlas download initiated.");
      
//       // Do not send any additional response after streaming
//     } catch (err) {
//       console.error(err);
//       res.status(500).send("Internal Server Error");
//     }
//   });

//   return router;
// };


export { get_atlas, get_user_atlases, get_atlas_visualization, get_allAtlases, upload_atlas, edit_atlas, delete_atlas, download_atlas, get_scvi_atlases, post_anndata_args, trigger_cloud_run_job, update_atlas_benchmark_status };
