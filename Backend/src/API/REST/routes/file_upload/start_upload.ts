import check_auth from "../../middleware/check_auth";
import { ExtRequest } from "../../../../definitions/ext_request";
import ProjectService from "../../../../database/services/project.service";
import { AddProjectDTO, AddScviProjectDTO } from "../../../../database/dtos/project.dto";

import { S3 } from "aws-sdk";
import axios from "axios";
import s3 from "../../../../util/s3";
import express from "express";
import { validationMdw } from "../../middleware/validation";
import { ProjectStatus } from "../../../../database/models/project";

export default function upload_start_upload_route() {
  let router = express.Router();
  router.post(
    "/file_upload/start_upload",
    validationMdw,
    check_auth(),
    async (req: ExtRequest, res) => {
      let { projectName, atlasId, modelId, fileName } = req.body;
      let scviHubId = req.body?.scviHubId;
      if (!process.env.S3_BUCKET_NAME) {
        return res.status(500).send("S3-BucketName is not set");
      }

      let projectToAdd: AddProjectDTO | AddScviProjectDTO;
      try {
        let model_setup_anndata_args;
        // Check if the atlas is from scvi hub
        if(scviHubId){
          const endpoint = "https://europe-west3-custom-helix-329116.cloudfunctions.net/scvi-atlas-anndata-args";
          // Data for post
          const postData = {
            scviHubId: scviHubId
          };

          try {
            const response = await axios.post(endpoint, postData);

            const atlas = response.data;
            // The updated atlas
            model_setup_anndata_args = atlas[0].model_setup_anndata_args;
            // scvi atlas
            projectToAdd = {
              owner: req.user_id!,
              name: projectName,
              fileName: String(fileName),
              uploadDate: new Date(),
              status: ProjectStatus.UPLOAD_PENDING,
              model_setup_anndata_args: model_setup_anndata_args,
              scviHubId: scviHubId
            };
          } catch (error) {
            console.error("Error sending POST request:", error);
          }
        }else{ // Archmap core atlas is chosen
          projectToAdd = {
            owner: req.user_id!,
            name: projectName,
            modelId,
            atlasId,
            fileName: String(fileName),
            uploadDate: new Date(),
            status: ProjectStatus.UPLOAD_PENDING,
          };
        }

        const project = await ProjectService.addProject(projectToAdd);
        let params: S3.CreateMultipartUploadRequest = {
          Bucket: process.env.S3_BUCKET_NAME,
          Key: `projects/${project._id}/query.h5ad`,
        };
        s3.createMultipartUpload(params, async (err, uploadData) => {
          if (err) {
            console.error(err, err.stack || "Error when requesting uploadId");
            res.status(500).send(err);
          } else {
            if (uploadData.UploadId !== undefined)
              await ProjectService.updateUploadId(project._id, uploadData.UploadId);
            let updatedProject = await ProjectService.getProjectById(project._id);
            res.status(200).send(updatedProject);
          }
        });
      } catch (err) {
        console.log(err);
        res.status(500).send(err);
      }
    }
  );
  return router;
}
