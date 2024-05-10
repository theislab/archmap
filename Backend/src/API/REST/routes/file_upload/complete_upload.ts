import express from "express";
import {
  CompleteMultipartUploadOutput,
  CompleteMultipartUploadRequest,
  PutObjectRequest,
} from "aws-sdk/clients/s3";
import { AWSError, S3 } from "aws-sdk";
import { CloudTasksClient, protos } from "@google-cloud/tasks";

import check_auth from "../../middleware/check_auth.js";
import { ExtRequest } from "../../../../definitions/ext_request.js";
import ProjectService from "../../../../database/services/project.service.js";
import { UpdateProjectDTO } from "../../../../database/dtos/project.dto.js";
import s3, { try_delete_object_from_s3 } from "../../../../util/s3.js";
import { GoogleAuth } from "google-auth-library";
import { request as gaxiosRequest } from "gaxios";
import { ProjectStatus } from "../../../../database/models/project.js";
import AtlasService from "../../../../database/services/atlas.service.js";
import ModelService from "../../../../database/services/model.service.js";

import { validationMdw } from "../../middleware/validation.js";
import ProjectUpdateTokenService from "../../../../database/services/project_update_token.service.js";

import ClassifierService from "../../../../database/services/classifier.service.js";
import {
  get_classifier_path,
  get_encoder_path,
  model_path,
  model_path_scpoli,
  query_path,
  result_model_path,
  result_path,
} from "./bucket_filepaths.js";
import AtlasModelAssociationService from "../../../../database/services/atlas_model_association.service.js";

const MAX_EPOCH_QUERY = 10;

export default function upload_complete_upload_route() {
  let router = express.Router();
  router.post(
    "/file_upload/complete_upload",
    validationMdw,
    check_auth(),
    async (req: ExtRequest, res) => {
      let { parts, uploadId } = req.body;
      console.log("req.body is ", req.body);
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
          console.log("data from completeMultipart ", data);
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
            let model, atlas, classifier;

            // Archmap core atlases
            if (!project?.scviHubId) {
              [model, atlas, classifier] = await Promise.all([
                ModelService.getModelById(project.modelId),
                AtlasService.getAtlasById(project.atlasId),
                project.classifierId
                  ? ClassifierService.getClassifierById(project.classifierId)
                  : Promise.resolve(undefined),
              ]);
            }

            // Check if the model and atlas exist for the chosen core archmap atlas.
            if ((!model || !atlas) && !project.scviHubId && !project.model_setup_anndata_args) {
              await ProjectService.updateProjectByUploadId(params.UploadId, {
                status: ProjectStatus.PROCESSING_FAILED,
              });

              try_delete_object_from_s3(query_path(project._id));
              console.log("Deleteing the file from s3 with path ", query_path(project._id));
              return res.status(500).send(`Could not find ${!model ? "model" : "atlas"}`);
            }

            // Check if the id and args exist for the chosen scvi hub atlas.
            if ((!project.scviHubId || !project.model_setup_anndata_args) && !model && !atlas) {
              console.log(project.scviHubId && project.model_setup_anndata_args);
              await ProjectService.updateProjectByUploadId(params.UploadId, {
                status: ProjectStatus.PROCESSING_FAILED,
              });

              try_delete_object_from_s3(query_path(project._id));
              console.log("Deleteing the file from s3 with path ", query_path(project._id));
              return res
                .status(500)
                .send(
                  `Could not find ${!project.scviHubId ? "scviHubId" : "model_setup_anndata_args"}`
                );
            }

            //Create a token, which can be used later to update the projects status
            let { token: updateToken } = await ProjectUpdateTokenService.addToken({
              _projectId: project._id,
            });

            let queryInfo;

            let classifier_type = {
              XGBoost: false,
              kNN: false,
              Native: false,
            };
            let encoder_path;
            let classifier_path;
            // Optional classifier choice
            if (classifier) {
              switch (classifier?.name) {
                case "XGBoost":
                  classifier_type.XGBoost = true;
                  break;
                case "KNN":
                  classifier_type.kNN = true;
                  break;
                //TODO: scpoli have to be added
                // case "scPoli":
                case "scANVI":
                  classifier_type.Native = true;
                  break;
                default:
                  return res
                    .status(500)
                    .send(
                      `Unknown classifier: classifier: ${JSON.stringify(classifier)}, name:${
                        classifier?.name
                      }`
                    );
              }
              //TODO: classifier_path and encoder_path have to be adjusted for scpoli
              classifier_path = await get_classifier_path(classifier_type, atlas._id, model._id);
              encoder_path = await get_encoder_path(classifier_type, atlas._id, model._id);
              console.log("classifier_path is ", classifier_path);
              console.log("encoder_path is ", encoder_path);
              console.log("classifier_type is ", classifier_type);
            }

            if (model && model.name == "scVI") {
              const modelAssociatedWithAtlas =
                await AtlasModelAssociationService.getOneByAtlasAndModelId(atlas._id, model._id);
              queryInfo = {
                model: model.name,
                atlas: atlas.name,

                output_type: {
                  csv: false,
                  cxg: true,
                },
                classifier_type: classifier_type,
                classifier_path: classifier_path,
                encoder_path: encoder_path,
                query_data: query_path(project.id),
                output_path: result_path(project.id),
                model_path: model_path(modelAssociatedWithAtlas?._id),
                reference_data: `atlas/${project.atlasId}/data.h5ad`,
                pre_trained_scVI: true,
                ref_path: "model.pt",
                async: false,
                scvi_max_epochs_query: MAX_EPOCH_QUERY, // TODO: make this a standard parameter
                webhook: `${process.env.API_URL}/projects/updateresults/${updateToken}`,
                webhook_ratio: `${process.env.API_URL}/projects/ratio/${updateToken}`,
              };
            } else if (model && model.name == "scANVI") {
              const modelAssociatedWithAtlas =
                await AtlasModelAssociationService.getOneByAtlasAndModelId(atlas._id, model._id);
              queryInfo = {
                model: model.name,
                atlas: atlas.name,

                output_type: {
                  csv: false,
                  cxg: true,
                },
                classifier_type: classifier_type,
                classifier_path: classifier_path,
                query_data: query_path(project.id),
                output_path: result_path(project.id),
                encoder_path: encoder_path,
                model_path: model_path(modelAssociatedWithAtlas?._id),
                reference_data: `atlas/${project.atlasId}/data.h5ad`,
                pre_trained_scANVI: true,
                ref_path: "model.pt",
                //ref_path: `models/${project.modelId}/model.pt`,
                async: false,
                scanvi_max_epochs_query: MAX_EPOCH_QUERY, // TODO: make this a standard parameter
                webhook: `${process.env.API_URL}/projects/updateresults/${updateToken}`,
                webhook_ratio: `${process.env.API_URL}/projects/ratio/${updateToken}`,
              };
            } else if (model && model.name == "scPoli") {
              const modelAssociatedWithAtlas =
                await AtlasModelAssociationService.getOneByAtlasAndModelId(atlas._id, model._id);
              const { scpoli_attr, scpoli_model_params, scpoli_var_names } = model_path_scpoli(
                modelAssociatedWithAtlas?._id
              );

              queryInfo = {
                model: model.name,
                atlas: atlas.name,

                output_type: {
                  csv: false,
                  cxg: true,
                },
                classifier_type: classifier_type,
                classifier_path: classifier_path,
                query_data: query_path(project.id),
                output_path: result_path(project.id),
                encoder_path: encoder_path,

                scpoli_attr: scpoli_attr,
                scpoli_model_params: scpoli_model_params,
                scpoli_var_names: scpoli_var_names,

                reference_data: `atlas/${project.atlasId}/data.h5ad`,
                // pre_trained_scANVI: true,
                // ref_path: "model.pt",
                //ref_path: `models/${project.modelId}/model.pt`,
                async: false,
                scpoli_max_epochs: MAX_EPOCH_QUERY, // TODO: make this a standard parameter
                webhook: `${process.env.API_URL}/projects/updateresults/${updateToken}`,
              };
            
            } else {
              // Query info for scvi hub atlas
              if (project.scviHubId && project.model_setup_anndata_args) {
                queryInfo = {
                  scviHubId: project.scviHubId,
                  model_setup_anndata_args: project.model_setup_anndata_args,
                  output_type: {
                    csv: false,
                    cxg: true,
                  },
                  query_data: query_path(project.id),
                  output_path: result_path(project.id),
                  async: false,
                  webhook: `${process.env.API_URL}/projects/updateresults/${updateToken}`,
                  webhook_ratio: `${process.env.API_URL}/projects/ratio/${updateToken}`,
                };
              }
            }

            console.log("queryInfo: ");
            console.log(queryInfo);
            const url = `${process.env.CLOUD_RUN_URL}/query`;
            const auth = new GoogleAuth();
            const client = await auth.getIdTokenClient(url);
            //Send response before processing
            res.status(200).send("Processing started");
            //Processing is synchronous, response is sent by ML only after the result is produced, might take some time
            let result;

            // call liveness for debugging
            try {
              // this leads to ECONNRESET
              const liveness_url = `${process.env.CLOUD_RUN_URL}/liveness`;
              result = await client.request({
                url: liveness_url,
                method: "GET",
              });
              console.log(result);
            } catch (e) {
              console.log("Could not send a ping to the processing container.");
              console.log(e);
              result = null;
            }

            // Creating a queue task
            const project_id_gcp = process.env.GCP_PROJECT_ID;
            const queue = process.env.TASK_QUEUE_NAME;
            const location = "europe-west3";
            const serviceAccountEmail = process.env.TASK_QUEUE_EMAIL_ID;

            const tasks = new CloudTasksClient({
              projectId: project_id_gcp,
              credentials: {
                client_email: process.env.TASK_QUEUE_EMAIL_ID,
                private_key: process.env.TASK_QUEUE_PRIVATE_KEY,
              },
              fallback: true,
            });

            const payload = queryInfo;
            // Construct the fully qualified queue name.
            const parent = tasks.queuePath(project_id_gcp, location, queue);

            const task = {
              httpRequest: {
                headers: {
                  "Content-Type": "application/json",
                },
                httpMethod: "POST" as const,
                url,
                body: "", // or null
                oidcToken: {
                  serviceAccountEmail,
                },
              },
              dispatchDeadline: {
                // Timeout
                seconds: 30 * 60,
              },
            };

            if (payload) {
              task.httpRequest.body = Buffer.from(JSON.stringify(payload)).toString("base64");
            }
            const call_options = {
              // 60 minutes in millis
              timeout: 60 * 60 * 1000,
            };
            console.log("Sending task:");
            console.log(task);
            const request = { parent: parent, task: task };

            const [response] = await tasks.createTask(request, call_options);
            console.log(`Created task ${response.name}`);
            console.log("The task details are: ", JSON.stringify(response, null, 2));
            if (!response || !response.name) {
              await ProjectService.updateProjectByUploadId(params.UploadId, {
                status: ProjectStatus.PROCESSING_FAILED,
              });
              console.log("Status updated to failed! Queue task failed");
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
                  function (err, data) {
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
            await ProjectService.updateProjectByUploadId(params.UploadId, updateStatus);
            console.log("Status updated to failed");
            try_delete_object_from_s3(query_path(project._id));
            console.log("Deleting the file from s3 with path ", query_path(project._id));
            return res.status(500).send("Processing failed!");
          }
        } catch (err) {
          console.log(err);
          try {
            res.status(500).send(`Error persisting Multipart-Upload object data: ${err}`);
          } catch {}
        }
      } catch (err) {
        console.log(err);
        res.status(500).send(err);
      }
    }
  );
  return router;
}
