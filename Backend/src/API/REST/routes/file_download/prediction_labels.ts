import express from "express";
import { ExtRequest } from "../../../../definitions/ext_request";
import { validationMdw } from "../../middleware/validation";
import s3 from "../../../../util/s3";
import { result_prediction_labels_path } from "../file_upload/bucket_filepaths";

export default function download_prediction_labels_route() {
  let router = express.Router();

  router.post("/file_download/prediction_labels", validationMdw, async (req: ExtRequest, res) => {
    console.log("POST /file_download/prediction_labels");
    const { projectId } = req.body;

    if (!process.env.S3_BUCKET_NAME) {
      return res.status(500).send("S3 bucket name is not configured.");
    }
    if (!projectId) {
      return res.status(400).send("Missing projectId.");
    }

    const key = result_prediction_labels_path(projectId);
    try {
      await s3.headObject({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: key,
      }).promise();
    } catch (err) {
      console.error("Prediction labels file not found:", err);
      return res.status(404).send("Prediction labels file not found.");
    }

    try {
      const params: any = {
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: key,
        Expires: 60 * 60 * 24 * 7 - 1,
      };
      const presignedUrl = await s3.getSignedUrlPromise("getObject", params);
      return res.status(200).send({ presignedUrl });
    } catch (err) {
      console.error("Error generating prediction labels presigned URL:", err);
      return res.status(500).send("Could not generate download URL.");
    }
  });

  return router;
}
