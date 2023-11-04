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



const uploadDirectory = "/tmp/"; // for gcp 

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

const get_scvi_atlases = (): Router => {
  let router = express.Router();

  router.get("/scvi-atlases", async(req: any, res) => {
    try{
      // Endpoint to get all scvi atlases
      const endpoint = "https://europe-west3-custom-helix-329116.cloudfunctions.net/scvi-atlases";
      const atlases = (await axios.get(endpoint)).data;

      console.log(atlases);
      
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

// upload atlas by url or file
const upload_atlas = (): Router => {
  let router = express.Router();


  router.post('/atlases/upload', validationMdw, upload_permission_auth() ,upload.single('file'), async (req: any, res) => {
      
    let atlasDocument;
    try {
      if (!req.file && !req.body.atlasUrl) {
        
        res.status(400).send("No file uploaded.");
        return;
      }

      if (!req.file && req.body.atlasUrl === "") {
        
        res.status(400).send("No file uploaded.");
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

      const atlasData = {
        name: req.body.name,
        previewPictureURL: req.body.previewPictureURL,
        modalities: req.body.modalities,
        numberOfCells: req.body.numberOfCells,
        species: req.body.species,
        compatibleModels: req.body.compatibleModels,
        uploadedBy: req.body.userId,
        atlasUrl: req.body.atlasUrl,
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


      if(atlasData.atlasUrl == ""){
        const filename = req.file.filename;
        const originalName = req.file.originalname;
        const filePath = req.file.path;

        const bucket = storage.bucket(process.env.S3_BUCKET_NAME);
        const blob = bucket.file(`atlas/${atlasDocument._id}/data.h5ad`);
        const blobStream = blob.createWriteStream({
          metadata: {
            contentType: "application/octet-stream",
          },
        });
        blobStream.on("error", (err) => {
          console.error(err);
          res.status(500).send("Failed to upload file to GCP");
        });
        blobStream.on("finish", async () => {
          console.log("File uploaded to GCP");

          // Return the Atlas ID as a response
          res.json({
            atlasId: atlasDocument._id,
            message: `File uploaded to gcp in the path: atlas/${atlasDocument._id}/data.h5ad`,
          });
        });

        const readStream = fs.createReadStream(filePath);
        readStream.pipe(blobStream);
        blobStream.on("close", () => {
          console.log("Response sent");
          // Delete the file from the server
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
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
        res.json({
          atlasId: atlasDocument._id,
          message: `File uploaded to gcp in the path: atlas/${atlasDocument._id}/data.h5ad`,
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
    return true;
  }
  return false;
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


export { get_atlas, get_atlas_visualization, get_allAtlases, upload_atlas, edit_atlas, delete_atlas, get_scvi_atlases };
