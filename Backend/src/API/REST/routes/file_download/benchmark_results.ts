
import { ExtRequest } from "../../../../definitions/ext_request";
import s3 from "../../../../util/s3";
import express from "express";
import { validationMdw } from "../../middleware/validation";


export default function download_benchmark_results_route() {
    let router = express.Router();
    router.post("/file_download/benchmark_results", validationMdw, async (req: ExtRequest, res) => {
      console.log("POST /file_download/benchmark_results");
      let {benchmarkResultsFile} = req.body;
  
      try {
        if (!process.env.S3_BUCKET_NAME) {
          return res.status(500).send("S3-BucketName is not set");
        }
  
        console.log("benchmarkResultsFile: ", benchmarkResultsFile)
  
        if(!benchmarkResultsFile) {
          return res.status(400).send("Atlas has no output benhcmark results.");
        }
        let params: any = {
          Bucket: process.env.S3_BUCKET_NAME!,
          Key: benchmarkResultsFile,
          Expires: 60 * 60 * 24 * 7 - 1, // one week minus one second
        };
        let presignedUrl = await s3.getSignedUrlPromise("getObject", params);
        return res.status(200).send({ presignedUrl });
      } catch (err) {
        console.log(err);
        return res.status(500).send(err);
      }
    })
    return router;
  }