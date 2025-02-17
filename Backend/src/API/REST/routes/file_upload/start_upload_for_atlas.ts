import { S3 } from "aws-sdk";
import { AddAtlasDTO } from "../../../../database/dtos/atlas.dto";
import { AddProjectDTO } from "../../../../database/dtos/project.dto";
import AtlasService from "../../../../database/services/atlas.service";
import { ExtRequest } from "../../../../definitions/ext_request";
import check_auth from "../../middleware/check_auth";
import { validationMdw } from "../../middleware/validation";
import s3, { try_delete_object_from_s3 } from "../../../../util/s3";
import express from "express";
import { AtlasUploadStatus, ProjectStatus } from "../../../../database/models/project";
import ModelService from "../../../../database/services/model.service";
import AtlasModelAssociationService from "../../../../database/services/atlas_model_association.service";
import { CompleteMultipartUploadRequest } from "aws-sdk/clients/s3";
import axios from "axios";
import { GoogleAuth } from "google-auth-library";
import { CloudTasksClient } from "@google-cloud/tasks"
import { getTypeParameterOwner } from "typescript";
const { v4: uuidv4 } = require('uuid');



const createMultipartUploadAsync = async (params: S3.CreateMultipartUploadRequest): Promise<S3.CreateMultipartUploadOutput> => {
    return new Promise((resolve, reject) => {
        s3.createMultipartUpload(params, (err, uploadData) => {
            if (err) {
                reject(err);
            } else {
                resolve(uploadData);
            }
        });
    });
};


export default function upload_start_upload_for_atlas_route() {
    let router = express.Router();
    router.post(
        "/file_upload/start_upload_for_atlas",
        validationMdw,
        check_auth(),
        async (req: ExtRequest, res) => {

            let { name, batchKey, cellTypeKey, previewPictureURL, classifierLabels, modalities, numberOfCells, species, uploadedBy, atlasUrl, inrevision, isPrivate, benchmarked } = req.body;


            const compatibleModels = req.body.compatibleModels || [];

            if (compatibleModels.length === 0) {
                return res.status(400).send("No compatible models specified");
            }
            if (!process.env.S3_BUCKET_NAME) {
                return res.status(500).send("S3-BucketName is not set");
            }

            let atlasToAdd: AddAtlasDTO;

            try {
                atlasToAdd = {
                    name: name,
                    batchKey: batchKey,
                    cellTypeKey: cellTypeKey,
                    previewPictureURL: previewPictureURL,
                    classifierLabels: classifierLabels,
                    modalities: modalities,
                    numberOfCells: numberOfCells,
                    species: species,
                    compatibleModels: compatibleModels,
                    uploadedBy: uploadedBy,
                    atlasUrl: atlasUrl,
                    inrevision: inrevision,
                    isPrivate: isPrivate,
                    benchmarked: benchmarked
                    
                };

                const atlas = await AtlasService.createAtlas(atlasToAdd);
                AtlasService.updateAtlasByStatus(atlas._id, AtlasUploadStatus.UPLOAD_PENDING);
                console.log("atlas status updated: ", atlas);

                const keyPath = `atlas/${atlas._id}/data.h5ad`;
                let params: S3.CreateMultipartUploadRequest = {
                    Bucket: process.env.S3_BUCKET_NAME,
                    Key: keyPath,
                };
                const uploadData = await createMultipartUploadAsync(params);
                if (uploadData.UploadId !== undefined) {
                    await AtlasService.updateAtlasByAtlasUploadId(atlas._id, uploadData.UploadId);
                    await AtlasService.updateAtlasByAtlasUploadPath(atlas._id, keyPath);
                    console.log("updated atlas upload id and path")
                }
                if (req.body.selectedClassifier) {

                    let classifierFilePathInBucket = `classifiers/${atlas._id}/`;
                    switch (req.body.selectedClassifier) {
                        case "KNN":
                            classifierFilePathInBucket += "classifier_knn.pickle";
                            break;
                        case "XGBoost":
                            classifierFilePathInBucket += "classifier_xgb.ubj";
                            break;
                        default:
                            return res.status(400).send("Invalid classifier selected");

                    }
                    let params: S3.CreateMultipartUploadRequest = {
                        Bucket: process.env.S3_BUCKET_NAME,
                        Key: classifierFilePathInBucket,
                    };
                    const uploadData = await createMultipartUploadAsync(params);
                    if (uploadData.UploadId !== undefined) {
                        await AtlasService.updateAtlasByClassifierUploadId(atlas._id, uploadData.UploadId);
                        await AtlasService.updateAtlasByClassifierUploadPath(atlas._id, classifierFilePathInBucket);
                        console.log("updated atlas classifier upload id and path")
                    }


                    let encoderFilePathInBucket = `classifiers/${atlas._id}/classifier_encoding.pickle`;
                    let params2: S3.CreateMultipartUploadRequest = {
                        Bucket: process.env.S3_BUCKET_NAME,
                        Key: encoderFilePathInBucket,
                    };

                    const uploadData2 = await createMultipartUploadAsync(params2);

                    if (uploadData2.UploadId !== undefined) {
                        await AtlasService.updateAtlasByEncoderUploadId(atlas._id, uploadData2.UploadId);
                        await AtlasService.updateAtlasByEncoderUploadPath(atlas._id, encoderFilePathInBucket);
                        console.log("updated atlas encoder upload id and path")
                    }

                }


                const modelsToUploadPromises = compatibleModels.map(async (modelName: string) => {

                    const model = await ModelService.getModelByName(modelName);
                    const modelMongoId = await AtlasModelAssociationService.createAssociation(atlas._id, model._id);
                    const pathName = `models/${modelMongoId._id}/model.pt`;

                    let params: S3.CreateMultipartUploadRequest = {
                        Bucket: process.env.S3_BUCKET_NAME,
                        Key: pathName,
                    };
                    const uploadData = await createMultipartUploadAsync(params);

                    if (uploadData.UploadId !== undefined) {
                        await AtlasModelAssociationService.updateModelByModelUploadId(modelMongoId._id, uploadData.UploadId);
                        await AtlasModelAssociationService.updateModelPathByModelUploadId(modelMongoId._id, pathName);
                        return await AtlasModelAssociationService.getAssociationById(modelMongoId._id);
                    }
                });

                // Wait for all model upload operations to complete
                let modelsToUpload = await Promise.all(modelsToUploadPromises);



                let updatedAtlas = await AtlasService.getAtlasById(atlas._id);
                res.status(200).send({ atlas: updatedAtlas, models: modelsToUpload });


            } catch (err) {
                console.log(err);
                res.status(500).send(err);
            }
        }
    );
    return router;
}

// "required": ["parts", "uploadId"],
export const complete_upload_for_atlas = () => {
    let router = express.Router();
    router.post(
        "/file_upload/complete_upload_for_atlas",
        validationMdw,
        check_auth(),
        async (req: ExtRequest, res) => {
            let { parts, uploadId, uploadFileType } = req.body;


            if (!process.env.S3_BUCKET_NAME)
                return res.status(500).send("Server was not set up correctly");
            // get atlas or model here
            let instance;
            let query_path;
            if (uploadFileType === "atlas") {
                instance = await AtlasService.getAtlasByAtlasUploadId(uploadId);
                query_path = instance.atlasUploadPath;
            } else if (uploadFileType === "model") {
                instance = await AtlasModelAssociationService.getAssociationByModelUploadId(uploadId);

                query_path = instance[0].modelUploadPath;
            } else if (uploadFileType == "classifier") {
                instance = await AtlasService.getAtlasByClassifierUploadId(uploadId);
                if (instance === null) {
                    query_path = undefined;
                } else {
                    query_path = instance.classifierUploadPath;
                }

            } else if (uploadFileType == "encoder") {
                instance = await AtlasService.getAtlasByEncoderUploadId(uploadId);
                query_path = instance.encoderUploadPath;
            } else {
                return res.status(400).send("Invalid uploadFileType");
            }
            if (query_path === undefined) {
                // "Invalid uploadFileType;query path is undefined for " uploadid and uploadFileType
                return res.status(400).send("Invalid uploadFileType;query path is undefined for " + uploadId + " and " + uploadFileType);

            }

            if (!instance) return res.status(400).send("Instance " + uploadFileType + " could not be found");

            //Complete multipart upload

            let params: CompleteMultipartUploadRequest = {
                Bucket: process.env.S3_BUCKET_NAME,
                Key: query_path,
                MultipartUpload: { Parts: parts },
                UploadId: String(uploadId),
            };

            let data;
            try {
                data = await s3.completeMultipartUpload(params).promise();

            } catch (err: any) {
                console.error(err, err.stack || "Error when completing multipart upload");
                return res.status(500).send(err);
            }
            if (!data || !data.Key || !data.Bucket || !data.Location) {
                try_delete_object_from_s3(query_path);
                return res.status(500).send("Error getting Multipart-Upload object data");
            }

            //TODO: 
            // create file size field in atlas, classifier, encoder, and model
            // create status for atlas, classifier, encoder, model
            // update status for atlas, classifier, encoder, model
            // update file size for atlas and model


            //Query file size and save in project
            try {
                let request: S3.HeadObjectRequest = { Key: data.Key, Bucket: data.Bucket };
                let result = await s3.headObject(request).promise();
                if (uploadFileType === "atlas") {
                    await AtlasService.updateAtlasByAtlasFilesize(instance._id, result.ContentLength);
                    await AtlasService.updateAtlasByStatus(instance._id, AtlasUploadStatus.UPLOAD_COMPLETE);
                    console.log("updated atlas upload status and filesize")
                } else if (uploadFileType === "model") {
                    await AtlasModelAssociationService.updateModelFilesizeByModelId(instance._id, result.ContentLength);
                    await AtlasModelAssociationService.updateModelUploadStatusByModelId(instance._id, AtlasUploadStatus.UPLOAD_COMPLETE);
                    console.log("updated model upload status and filesize")
                } else if (uploadFileType == "classifier") {
                    await AtlasService.updateAtlasByClassifierFilesize(instance._id, result.ContentLength);
                    await AtlasService.updateAtlasByClassifierUploadStatus(instance._id, AtlasUploadStatus.UPLOAD_COMPLETE);
                    console.log("updated classifier upload status and filesize")
                } else if (uploadFileType == "encoder") {
                    await AtlasService.updateAtlasByEncoderFilesize(instance._id, result.ContentLength);
                    await AtlasService.updateAtlasByEncoderUploadStatus(instance._id, AtlasUploadStatus.UPLOAD_COMPLETE);
                    console.log("updated encoder upload status and filesize")
                } else {
                    return res.status(400).send("Invalid uploadFileType");
                }
            }
            catch (err) {
                console.error(err, err.stack || "Error when getting file size");
            }
            return res.status(200).send(data);

        });
    return router;
}

// export const trigger_cloud_run_job = () => {
//     let router = express.Router();
//     router.post(
//         "/file_upload/trigger_cloud_run_job",
//         validationMdw,
//         check_auth(),
//         async (req: ExtRequest, res) => {
//             console.log("run trigger")
//             let { modelPath, atlasPath  } = req.body;
//             console.log("request body: ", modelPath, atlasPath )

//             try {

//                 const url = `${process.env.CLOUD_RUN_JOB}`;
//                 const auth = new GoogleAuth({
//                     scopes: 'https://www.googleapis.com/auth/cloud-platform',
//                 });

                
//                 // Get an OAuth token
//                 const oauthToken = await auth.getAccessToken();

//                 // const client = new CloudTasksClient()

//                 const project = `${process.env.GCP_PROJECT_ID}`;
//                 const location = "europe-west3"
//                 const queueName = `${process.env.TASK_QUEUE_NAME}`;
//                 const uniqueTaskId = uuidv4(); // Generate a unique ID for the task
//                 const taskId = `task-${uniqueTaskId}`; // Prefix the ID for clarity

//                 const jobId = 'my-job-id';
//                 const parent = `projects/${project}/locations/${location}`;




//                 // const url = "https://run.googleapis.com/v2/projects/my-project-id/locations/us-west1/jobs/process-item:run"

//                 await client.createTask({
//                     parent: client.queuePath(project, location, queueName),
//                     task: {
//                         name: client.taskPath(project, location, queueName, taskId),
//                         httpRequest: {
//                             httpMethod: "POST" as const,
//                             url: url,
//                             oidcToken: {
//                                 serviceAccountEmail: process.env.TASK_QUEUE_EMAIL_ID,
//                                 audience: url,
//                             },
//                             headers: {
//                                 "Authorization": `Bearer ${oauthToken}`,
//                                 "Content-Type": "application/json",
//                             },
//                             body: Buffer.from(JSON.stringify({ overrides: { containerOverrides: [{ args: [`--model-path=${modelPath}`, `--atlas-path=${atlasPath}`] }]}})).toString("base64"),
//                         },
//                     },
//                 })
//                 res.status(202).json({ message: "Task creation initiated successfully." });
//             } catch (error) {
//             console.error("Error creating Cloud Task:", error);
//             res.status(500).json({ error: "Failed to trigger Cloud Run job." });
//         }
//     }
// );

// return router;


// export const trigger_cloud_run_job = () => {
//         let router = express.Router();
//         router.post(
//             "/file_upload/trigger_cloud_run_job",
//             validationMdw,
//             check_auth(),
//             async (req: ExtRequest, res) => {
//                 console.log("run trigger")
//                 let { modelPath, atlasPath  } = req.body;
//                 console.log("request body: ", modelPath, atlasPath )
    
//                 try {
    
//                     const url = `${process.env.CLOUD_RUN_JOB}`;
//                     const auth = new GoogleAuth({
//                         scopes: 'https://www.googleapis.com/auth/cloud-platform',
//                     });

                    
//                     // Get an OAuth token
//                     const oauthToken = await auth.getAccessToken();

//                     // const client = new CloudTasksClient()

//                     const project = `${process.env.GCP_PROJECT_ID}`;
//                     const location = "europe-west3"
//                     const queueName = `${process.env.TASK_QUEUE_NAME}`;
//                     const uniqueTaskId = uuidv4(); // Generate a unique ID for the task
//                     const taskId = `task-${uniqueTaskId}`; // Prefix the ID for clarity

//                     const client = new CloudTasksClient({
//                         projectId: project,
//                         credentials: {
//                           client_email: process.env.TASK_QUEUE_EMAIL_ID,
//                           private_key: process.env.TASK_QUEUE_PRIVATE_KEY,
//                         },
//                         fallback: true,
//                       });



//                     // const url = "https://run.googleapis.com/v2/projects/my-project-id/locations/us-west1/jobs/process-item:run"

//                     await client.createTask({
//                         parent: client.queuePath(project, location, queueName),
//                         task: {
//                             name: client.taskPath(project, location, queueName, taskId),
//                             httpRequest: {
//                                 httpMethod: "POST" as const,
//                                 url: url,
//                                 oidcToken: {
//                                     serviceAccountEmail: process.env.TASK_QUEUE_EMAIL_ID,
//                                     audience: url,
//                                 },
//                                 headers: {
//                                     "Authorization": `Bearer ${oauthToken}`,
//                                     "Content-Type": "application/json",
//                                 },
//                                 body: Buffer.from(JSON.stringify({ overrides: { containerOverrides: [{ args: [`--model-path=${modelPath}`, `--atlas-path=${atlasPath}`] }]}})).toString("base64"),
//                             },
//                         },
//                     })
//                     res.status(202).json({ message: "Task creation initiated successfully." });
//                 } catch (error) {
//                 console.error("Error creating Cloud Task:", error);
//                 res.status(500).json({ error: "Failed to trigger Cloud Run job." });
//             }
//         }
//     );

//     return router;
// };

// export const trigger_cloud_run_job = () => {
//     let router = express.Router();
//     router.post(
//         "/file_upload/trigger_cloud_run_job",
//         validationMdw,
//         check_auth(),
//         async (req: ExtRequest, res) => {
//             console.log("run trigger")
//             let { modelPath, atlasPath  } = req.body;
//             console.log("request body: ", modelPath, atlasPath )

//             const { exec } = require('child_process');

//             const projectId = `${process.env.GCP_PROJECT_ID}`;
//             const region = 'europe-west3';
//             const jobName = 'benchmark-atlas';

//             const command = `
//                 gcloud run jobs describe ${jobName} \
//                 --region=${region} \
//                 --project=${projectId}
//             `;

//             exec(command, (error, stdout, stderr) => {
//                 if (error) {
//                 console.error('Error executing gcloud command:', error);
//                 res.status(500).send(`Error: ${error.message}`);
//                 return;
//                 }

//                 if (stderr) {
//                 console.error('gcloud stderr:', stderr);
//                 res.status(500).send(`gcloud error: ${stderr}`);
//                 return;
//                 }

//                 console.log('gcloud stdout:', stdout);
//                 res.status(200).send(`Job Description: ${stdout}`);
//             });
//         });


//     return router;
// };



// export const trigger_cloud_run_job = () => {
//     let router = express.Router();
//     router.post(
//         "/file_upload/trigger_cloud_run_job",
//         validationMdw,
//         check_auth(),
//         async (req: ExtRequest, res) => {
//             console.log("run trigger")
//             let { modelPath, atlasPath  } = req.body;
//             console.log("request body: ", modelPath, atlasPath )

//             try {

//                 const project = `${process.env.GCP_PROJECT_ID}`;
//                 const location = "europe-west3"

//                 const jobId = 'benchmark-atlas';
//                 const parent = `projects/${project}/locations/${location}`;


//                 // const url = `${process.env.CLOUD_RUN_JOB}`;
//                 // const auth = new GoogleAuth({
//                 //     scopes: 'https://www.googleapis.com/auth/cloud-platform',
//                 // });
                
//                 const {JobsClient} = require('@google-cloud/run').v2;
//                 const runClient = new JobsClient();

//                 // the job struct
//                 const job = {
//                     template: {
//                     // parallelism: 0,
//                     template: {
//                         containers: [{
//                         image: process.env.IMAGE_URL,
//                         resources: {
//                             limits: {
//                             cpu: "1000m",
//                             memory: "512Mi"
//                             },
//                             cpuIdle: false,
//                             startupCpuBoost: false
//                         },
//                         env: [
//                             {
//                             name: "modelPath",
//                             values: modelPath
//                             },
//                             {
//                             name: "atlasPath",
//                             values: atlasPath
//                             }
//                         ],
//                         }],
//                         timeout: {
//                         seconds: "1800",
//                         nanos: 0
//                         },
//                         maxRetries: 3,
//                         // serviceAccount: process.env.JOB_SERVICE_ACCOUNT,
//                         retries: "maxRetries"
//                     }
//                     }
//                 };

//                 // const request = {
//                 //     name,
//                 //   }

//                 const request = {
//                     parent,
//                     job,
//                     jobId,
//                   };

//                 // const request = {
//                 //     name: url,
//                 //     overrides: {
//                 //       containerOverrides: {
//                 //         env: [
//                 //             { name: 'modelPath', value: modelPath },
//                 //             { name: 'atlasPath', value: atlasPath }],
//                 //       },
//                 //     },
//                 //   };

//                 // Run request
//                 // const [operation] = await runClient.runJob(request);
//                 // const [response] = await operation.promise();
//                 // console.log(response);

//                 // Run request
//                 try {
//                     const [operation] = await runClient.createJob(request);
//                     const [response] = await operation.promise();
//                     console.log(response);
//                 } catch (error) {
//                     if (error.code === 6) {
//                       console.log('Job already exists. Skipping creation.');
//                     } else {
//                       throw error;
//                     }
//                 }

                
                

                // const [execution] = await runClient.runJob(request);
                // console.log(`Job started successfully: ${execution.name}`);

                // res.status(200).send({
                // message: 'Cloud Run Job created and started successfully.',
                // executionName: execution.name,
                // });
//             } catch (error) {
//                 console.error('Error creating or running Cloud Run Job:', error);
//                 res.status(500).send({error: error.message});
//             }
//         });


//     return router;
// };
    



            // // Authenticate with Google Cloud
            // const client = await auth.getClient();
            // const accessToken = await client.getAccessToken();  // Get the access token

            // const envVars = {
            //     modelPath: modelPath,
            //     atlasPath: atlasPath,
            //   };

            // // Trigger the job asynchronously with environment variables passed in the request
            // const response = await axios.post(
            //     url,
            //     {
            //     overrides: {
            //         containerOverrides: [
            //         {
            //             name: 'benchmark-atlas',
            //             env: Object.entries(envVars).map(([key, value]) => ({ name: key, value })),
            //         },
            //         ],
            //     },
            //     },
            //     {
            //     headers: {
            //         Authorization: `Bearer ${accessToken.token}`,
            //         'Content-Type': 'application/json',
            //     },
            //     }
            // );

//             // Respond with success
//             res.status(200).send(`Job triggered successfully: ${response.data.name}`);
//             } catch (error) {
//             console.error('Error triggering job:', error.response ? error.response.data : error.message);
//             res.status(500).send('Failed to trigger job');
//             }
//         });

//     return router;
// };


