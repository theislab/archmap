import express, { Router } from 'express';
import AtlasModelAssociationService from '../../../../database/services/atlas_model_association.service'; 


const getAllAssociations = (): Router => {
  const router = express.Router();
  router.post("/get-all-associations", async (req, res) => {
    try {
      
      const models = await AtlasModelAssociationService.getAllAssociations();
        return res.status(200).json(models);
    }
    catch (err) {
      console.error("Error getting all associations!");
      console.error(err);
      return res.status(500).send("Unable to get the associations.");
    }
  })
  return router;
};
  
  export default getAllAssociations;
