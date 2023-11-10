import express from "express";
import {
  CompleteMultipartUploadOutput,
  CompleteMultipartUploadRequest,
  PutObjectRequest,
} from "aws-sdk/clients/s3";
import { AWSError, S3 } from "aws-sdk";

import check_auth from "../../middleware/check_auth";
import { ExtRequest } from "../../../../definitions/ext_request";
import ProjectService from "../../../../database/services/project.service";
import { UpdateProjectDTO } from "../../../../database/dtos/project.dto";
import s3, { try_delete_object_from_s3 } from "../../../../util/s3";
import { GoogleAuth } from "google-auth-library";
import { request as gaxiosRequest } from "gaxios";
import { ProjectStatus } from "../../../../database/models/project";
import AtlasService from "../../../../database/services/atlas.service";
import ModelService from "../../../../database/services/model.service";

import { validationMdw } from "../../middleware/validation";
import ProjectUpdateTokenService from "../../../../database/services/project_update_token.service";
import { query_path, result_model_path, result_path } from "./bucket_filepaths";

const MAX_EPOCH_QUERY = 2;

export default function upload_complete_upload_route() {
  let router = express.Router();
  router.post(
    "/file_upload/complete_upload",
    validationMdw,
    check_auth(),
    async (req: ExtRequest, res) => {
      let { parts, uploadId } = req.body;
      if (!process.env.S3_BUCKET_NAME)
        return res.status(500).send("Server was not set up correctly");

      try {
        let project = await ProjectService.getProjectByUploadId(String(uploadId), req.user_id);

        if (!project) return res.status(400).send("Project could not be found");

        //Complete multipart upload
        let params: CompleteMultipartUploadRequest = {
          Bucket: process.env.S3_BUCKET_NAME,
          Key: query_path(project._id),
          MultipartUpload: { Parts: parts },
          UploadId: String(uploadId),
        };
        let data;
        try {
          data = await s3.completeMultipartUpload(params).promise();
          console.log("data from completeMultipart ", data)
        } catch (err: any) {
          console.error(err, err.stack || "Error when completing multipart upload");
          return res.status(500).send(err);
        }
        if (!data || !data.Key || !data.Bucket || !data.Location) {
          try_delete_object_from_s3(query_path(project._id));
          return res.status(500).send("Error getting Multipart-Upload object data");
        }

        //Query file size and save in project
        try {
          let request: S3.HeadObjectRequest = { Key: data.Key, Bucket: data.Bucket };
          let result = await s3.headObject(request).promise();
          const updateFileAndStatus: UpdateProjectDTO = {
            fileSize: result.ContentLength,
            status: ProjectStatus.PROCESSING_PENDING,
          };

          await ProjectService.updateProjectByUploadId(params.UploadId, updateFileAndStatus);
          if (process.env.CLOUD_RUN_URL) {
            let model, atlas;

            // Archmap core atlases
            if(project.modelId && project.atlasId){
              [model, atlas] = await Promise.all([
                ModelService.getModelById(project.modelId),
                AtlasService.getAtlasById(project.atlasId),
              ]); 
            }

            // Check if the model and atlas exist for the chosen core archmap atlas.
            if ((!model || !atlas) && !project.scviHubId && !project.model_setup_anndata_args) {
              await ProjectService.updateProjectByUploadId(params.UploadId, {
                status: ProjectStatus.PROCESSING_FAILED,
              });

              try_delete_object_from_s3(query_path(project._id))
              console.log("Deleteing the file from s3 with path ", query_path(project._id))
              return res.status(500).send(`Could not find ${!model ? "model" : "atlas"}`);
            }

            // Check if the id and args exist for the chosen scvi hub atlas. 
            if((!project.scviHubId || !project.model_setup_anndata_args) && !model && !atlas){
              console.log(project.scviHubId && project.model_setup_anndata_args);
              await ProjectService.updateProjectByUploadId(params.UploadId, {
                status: ProjectStatus.PROCESSING_FAILED,
              });

              try_delete_object_from_s3(query_path(project._id))
              console.log("Deleteing the file from s3 with path ", query_path(project._id))
              return res.status(500).send(`Could not find ${!project.scviHubId ? "scviHubId" : "model_setup_anndata_args"}`);
            }

            //Create a token, which can be used later to update the projects status
            let { token: updateToken } = await ProjectUpdateTokenService.addToken({
              _projectId: project._id,
            });

            let queryInfo;
            if(model && model.name === "scVI" ){ // QueryInfo for the scVI model for the archmap core atlases
              queryInfo = {
                model: model.name,
                atlas: atlas.name,
                output_type: {
                    csv: false,
                    cxg: true
                },
                query_data: query_path(project.id),
                output_path: result_path(project.id),
                model_path: result_model_path(project.id),
                reference_data: `atlas/${project.atlasId}/data.h5ad`,
                pre_trained_scVI: true,
                ref_path: "model.pt",
                //ref_path: `models/${project.modelId}/model.pt`,
                async: false,
                scvi_max_epochs_query: 1, // TODO: make this a standard parameter
                webhook: `${process.env.API_URL}/projects/updateresults/${updateToken}`,
              };
            }else {
              if(model && model.name === "scANVI"){ // QueryInfo for the scANVI model for the archmap core atlases
                queryInfo = {
                  model: model.name,
                  atlas: atlas.name,
                  output_type: {
                      csv: false,
                      cxg: true
                  },
                  query_data: query_path(project.id),
                  output_path: result_path(project.id),
                  model_path: result_model_path(project.id),
                  reference_data: `atlas/${project.atlasId}/data.h5ad`,
                  pre_trained_scANVI: true,
                  ref_path: "model.pt",
                  //ref_path: `models/${project.modelId}/model.pt`,
                  async: false,
                  scanvi_max_epochs_query: MAX_EPOCH_QUERY, // TODO: make this a standard parameter
                  webhook: `${process.env.API_URL}/projects/updateresults/${updateToken}`,
                };
              }else{ // Query info for scvi hub atlas
                if(project.scviHubId && project.model_setup_anndata_args){ 
                  queryInfo = {
                    scviHubId: project.scviHubId,
                    model_setup_anndata_args: project.model_setup_anndata_args,
                    output_type: {
                        csv: false,
                        cxg: true
                    },
                    query_data: query_path(project.id),
                    output_path: result_path(project.id),
                    async: false,
                    webhook: `${process.env.API_URL}/projects/updateresults/${updateToken}`,
                  };
                }
              }
            }

            console.log("sending: ");
            console.log(queryInfo);
            const url = `${process.env.CLOUD_RUN_URL}/query`;
            const auth = new GoogleAuth();
            const client = await auth.getIdTokenClient(url);
            //Send response before processing
            res.status(200).send("Processing started");
            //Processing is synchronous, response is sent by ML only after the result is produced, might take some time
            let result;

            try {
              result = await client.request({
                url,
                method: "POST",
                timeout: 60*60*1000, // 60 min timeout
                body: JSON.stringify(queryInfo),
              });
            } catch (e) {
              console.log("Processing failed:");
              console.log(e);
              result = null;
            }
            console.log('Result object', result);
            if (!result || result.status != 200) {
              await ProjectService.updateProjectByUploadId(params.UploadId, {
                status: ProjectStatus.PROCESSING_FAILED,
              });
              console.log("Status updated to failed")
              try_delete_object_from_s3(query_path(project.id));
              return;
            }
          } else if (process.env.NODE_ENV != "production") {
            console.log(
              "CLOUD_RUN_URL not defined, falling back to dummy result with 10s processing time"
            );
            res.status(200).send("Processing started");

            try {
              let fs = await import("fs");
              let path = await import("path");
              let content: Buffer = await new Promise((resolve, reject) => {
                fs.readFile(
                  path.join(__dirname, "../../../../../dev/test_file1.csv"),
                  function(err, data) {
                    if (err) reject(err);
                    else resolve(data);
                  }
                );
              });
              const params2: PutObjectRequest = {
                Bucket: process.env.S3_BUCKET_NAME!,
                Key: result_path(project.id),
                Body: content,
              };
              await s3.upload(params2).promise();
              let { token: updateToken } = await ProjectUpdateTokenService.addToken({
                _projectId: project._id,
              });
              await new Promise((resolve, reject) => {
                setTimeout(resolve, 10000);
              });
              await gaxiosRequest({
                method: "POST",
                url: `http://127.0.0.1:${process.env.PORT}/projects/updateresults/${updateToken}`,
              });
            } catch (e) {
              console.error(e);
              await ProjectService.updateProjectByUploadId(params.UploadId, {
                status: ProjectStatus.PROCESSING_FAILED,
              });
              try_delete_object_from_s3(query_path(project._id));
              return;
            }
          } else {
            const updateStatus: UpdateProjectDTO = { status: ProjectStatus.PROCESSING_FAILED };
            console.log("Status updated to failed")
            await ProjectService.updateProjectByUploadId(params.UploadId, updateStatus);
            console.log("Status updated to failed")
            try_delete_object_from_s3(query_path(project._id));
            console.log("Deleting the file from s3 with path ", query_path(project._id) )
            return res.status(500).send("Processing failed!");
          }
        } catch (err) {
          console.log(err);
          try {
            res.status(500).send(`Error persisting Multipart-Upload object data: ${err}`);
          } catch { }
        }
      } catch (err) {
        console.log(err);
        res.status(500).send(err);
      }
    }
  );
  return router;
}
