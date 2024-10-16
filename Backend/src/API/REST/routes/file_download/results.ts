import check_auth from "../../middleware/check_auth";
import { ExtRequest } from "../../../../definitions/ext_request";
import { ProjectStatus } from "../../../../database/models/project";
import ProjectService from "../../../../database/services/project.service";
import s3 from "../../../../util/s3";
import express from "express";
import { validationMdw } from "../../middleware/validation";
import { result_path } from "../file_upload/bucket_filepaths";

export default function download_results_route() {
  let router = express.Router();
  router.post("/file_download/results", validationMdw, async (req: ExtRequest, res) => {
    console.log("POST /file_download/results");
    let { id } = req.body;
    try {
      if (!process.env.S3_BUCKET_NAME) {
        return res.status(500).send("S3-BucketName is not set");
      }
      const project = await ProjectService.getProjectById(id);
      console.log("Project: ", project)
      if (!project) {
        return res.status(404).send("Project not found.");
      }
      if (project.status != ProjectStatus[ProjectStatus.DOWNLOAD_READY]) {
        return res.status(400).send("File not download ready.");
      }
      if(!project.outputFileWithCounts) {
        return res.status(400).send("Project has no output file with counts.");
      }
      let params: any = {
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: project.outputFileWithCounts,
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

