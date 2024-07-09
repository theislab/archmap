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

            let { name, previewPictureURL, modalities, numberOfCells, species, uploadedBy, atlasUrl } = req.body;


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
                    previewPictureURL: previewPictureURL,
                    modalities: modalities,
                    numberOfCells: numberOfCells,
                    species: species,
                    compatibleModels: compatibleModels,
                    uploadedBy: uploadedBy,
                    atlasUrl: atlasUrl,
                    inRevision: true
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

                    if (modelName=="scPoli") {
                        const pathName1 = `models/${modelMongoId._id}/model_params.pt`;
                        const pathName2 = `models/${modelMongoId._id}/attr.pkl`;
                        const pathName3 = `models/${modelMongoId._id}/var_names.csv`;

                        let params1: S3.CreateMultipartUploadRequest = {
                            Bucket: process.env.S3_BUCKET_NAME,
                            Key: pathName1,
                        };
                        const uploadData1 = await createMultipartUploadAsync(params1);
    
                        if (uploadData1.UploadId !== undefined) {
                            await AtlasModelAssociationService.updateModelByModelUploadId(modelMongoId._id, uploadData1.UploadId);
                            await AtlasModelAssociationService.updateModelPathByModelUploadId(modelMongoId._id, pathName1);
                            return await AtlasModelAssociationService.getAssociationById(modelMongoId._id);
                        }
    
                        let params2: S3.CreateMultipartUploadRequest = {
                            Bucket: process.env.S3_BUCKET_NAME,
                            Key: pathName2,
                        };
                        const uploadData2 = await createMultipartUploadAsync(params2);
    
                        if (uploadData2.UploadId !== undefined) {
                            await AtlasModelAssociationService.updateModelByModelUploadId(modelMongoId._id, uploadData2.UploadId);
                            await AtlasModelAssociationService.updateModelPathByModelUploadId(modelMongoId._id, pathName2);
                            return await AtlasModelAssociationService.getAssociationById(modelMongoId._id);
                        }
    
                        let params3: S3.CreateMultipartUploadRequest = {
                            Bucket: process.env.S3_BUCKET_NAME,
                            Key: pathName3,
                        };
                        const uploadData3 = await createMultipartUploadAsync(params3);
    
                        if (uploadData3.UploadId !== undefined) {
                            await AtlasModelAssociationService.updateModelByModelUploadId(modelMongoId._id, uploadData3.UploadId);
                            await AtlasModelAssociationService.updateModelPathByModelUploadId(modelMongoId._id, pathName3);
                            return await AtlasModelAssociationService.getAssociationById(modelMongoId._id);
                        }


                    } else {
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
