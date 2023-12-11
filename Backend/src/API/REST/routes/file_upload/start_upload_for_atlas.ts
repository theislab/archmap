import { S3 } from "aws-sdk";
import { AddAtlasDTO } from "../../../../database/dtos/atlas.dto";
import { AddProjectDTO } from "../../../../database/dtos/project.dto";
import AtlasService from "../../../../database/services/atlas.service";
import { ExtRequest } from "../../../../definitions/ext_request";
import check_auth from "../../middleware/check_auth";
import { validationMdw } from "../../middleware/validation";
import s3 from "../../../../util/s3";
import express from "express";
import { AtlasUploadStatus } from "../../../../database/models/project";
import ModelService from "../../../../database/services/model.service";
import AtlasModelAssociationService from "../../../../database/services/atlas_model_association.service";



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
        
            let { name, previewPictureURL, modalities, numberOfCells, species, uploadedBy, atlasUrl} = req.body;
            

            const compatibleModels = req.body.compatibleModels || [];
            
            if (compatibleModels.length === 0) {
                return res.status(400).send("No compatible models specified");
            }
            if (!process.env.S3_BUCKET_NAME) {
                return res.status(500).send("S3-BucketName is not set");
            }
            
            let atlasToAdd: AddAtlasDTO ;

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
                if (req.body.selectedClassifier){

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
                    console.log("modelName: ", modelName);
            
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
                        console.log("updated model upload id and path for model: ", modelName);
                        return await AtlasModelAssociationService.getAssociationById(modelMongoId._id);
                    }
                });

                // Wait for all model upload operations to complete
                let modelsToUpload = await Promise.all(modelsToUploadPromises);
            

            
                let updatedAtlas = await AtlasService.getAtlasById(atlas._id);
                res.status(200).send({atlas: updatedAtlas, models: modelsToUpload});


            } catch (err) {
                console.log(err);
                res.status(500).send(err);
            }
        }
    );
    return router;
    }