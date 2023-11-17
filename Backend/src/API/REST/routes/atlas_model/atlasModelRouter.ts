import express, { Router } from 'express';
import AtlasService from '../../../../database/services/atlas.service'; 
import ModelService from '../../../../database/services/model.service';
import AtlasModelAssociationService from '../../../../database/services/atlas_model_association.service'; 
import { Storage } from '@google-cloud/storage';



/**
 * Creates a router for handling the creation of all compatible atlas-model associations.
 * It creates an association only if the model is listed in the atlas's compatibleModels.
 * Additionally, for each created association, a file is created in the GCP cloud bucket.
 * 
 * @returns {Router} - Express router instance for the create associations route.
 */
const createAllAssociations = (): Router => {
    const router = express.Router();
    const storage = new Storage({
      projectId: process.env.GCP_PROJECT_ID,
      credentials: {
        client_email: process.env.GCP_CLIENT_EMAIL,
        private_key: process.env.GCP_PRIVATE_KEY,
        client_id: process.env.GCP_CLIENT_ID,
      },
    });
    const bucketName = process.env.S3_BUCKET_NAME;
  
    router.post("/create-all-associations", async (req, res) => {
      try {
        const atlases = await AtlasService.getAllAtlases();
        const models = await ModelService.getAllModels();
  
        const associations = [];
        for (const atlas of atlases) {
          for (const model of models) {
            // Check if the model is compatible with the atlas
            if (atlas.compatibleModels.includes(model.name)) {
              // Check if association already exists to avoid duplicates
              let existingAssociation = await AtlasModelAssociationService.getOneByAtlasAndModelId(atlas._id, model._id);
              if (!existingAssociation) {
                // Create new association if it does not exist
                const association = await AtlasModelAssociationService.createAssociation(atlas._id, model._id);
                associations.push(association);
  
                // Create file in GCP bucket
                const fileName = `${atlas.name}-${model.name}.txt`;
                const file = storage.bucket(bucketName).file(fileName);
                await file.save(''); // Creates an empty file
              }
            }
          }
        }
  
        return res.status(201).json({
          message: "All compatible associations created successfully",
          associations: associations
        });
      } catch (err) {
        console.error("Error creating all associations!");
        console.error(err);
        return res.status(500).send("Unable to create the associations.");
      }
    });
  
    return router;
  };
  
  export default createAllAssociations;