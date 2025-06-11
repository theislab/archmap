import express, {Router} from "express";
import check_auth from "../../middleware/check_auth";
import { ExtRequest } from "../../../../definitions/ext_request";
import axios from "axios";

const get_cellxgene_instance = (): Router => {
    let router = express.Router();
    router.post("/cellxgene", check_auth(), async(req: ExtRequest, res: any) => {
      try{
        const endpoint = `${process.env.CXG_LOAD_BALANCER_URL}/service`;
        console.log(`endpoint: ${endpoint}`);
        console.log("req.body: ", req.body)
        // add bucket: bucketName to req.body
        req.body.bucket = process.env.S3_BUCKET_NAME;
        const response = await axios.post(endpoint, req.body);
        console.log(`response: ${response}`);
        res.status(response.status).send(response.data);
      }catch(err){
        res.status(500).send("Something went wrong.");
      }
    });
    return router;
  };

  const delete_old_cxg_services = (): Router => {
    let router = express.Router();
  
    router.get("/delete-old-cxg-services", async(req: any, res) => {
      try{
        const endpoint = "https://europe-west3-custom-helix-329116.cloudfunctions.net/delete-old-cxg-services";
        const deletedServices = (await axios.get(endpoint)).data;
        console.log(deletedServices)
  
  
        return res.status(200).json(deletedServices);
      }catch(err){
        console.error("Error deleting services");
        console.error(JSON.stringify(err));
        console.error(err);
        return res.status(500).send("Error deleting services");
      }
    });
    return router;
  }

  export {get_cellxgene_instance, delete_old_cxg_services};