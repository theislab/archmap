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

  export {get_cellxgene_instance};