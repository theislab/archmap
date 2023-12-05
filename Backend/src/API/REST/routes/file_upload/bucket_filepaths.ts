import { ObjectId } from "mongoose";
import AtlasModelAssociationService from "../../../../database/services/atlas_model_association.service";

export function query_path(projectid: ObjectId | string): string {
  return `projects/${projectid}/query.h5ad`;
}

export function result_path(projectid: ObjectId | string): string {
  return `results/${projectid}/query_cxg.h5ad`;
}
export function result_model_path(projectid: ObjectId | string): string {
  return `results/${projectid}/model.pt`;
}

export function model_path(modelId: ObjectId | string): string {
  return `models/${modelId}/model.pt`;
}


// the argument will of the form 
// let classifier_type = {
//   XGBoost : false,
//   kNN : false,
//   Native: false
// };
export async function get_classifier_path(classifier_type: { XGBoost: boolean, kNN: boolean, Native: boolean }, atlasId: ObjectId | string, modelId: ObjectId | string) {
  if (classifier_type.XGBoost) {
    return classifier_path_xgboost(atlasId);
  } else if (classifier_type.kNN) {
    return classifier_path_knn(atlasId);
  } else if (classifier_type.Native) {
    const modelAssociatedWithAtlas = await AtlasModelAssociationService.getOneByAtlasAndModelId(
      atlasId,
      modelId
    );
    return model_path(modelAssociatedWithAtlas._id);
  }
  else {
    return null;
  }

}

export function classifier_path_xgboost(atlasId: ObjectId | string): string {
  return `classifiers/${atlasId}/classifier_xgb.ubj`;
}

export function classifier_path_knn(atlasId: ObjectId | string): string {
  return `classifiers/${atlasId}/classifier_knn.pickle`;
}

function _encoder_path(atlasId: ObjectId | string) {
  return `classifiers/${atlasId}/classifier_encoding.pickle`;
}

export async function get_encoder_path(classifier_type: { XGBoost: boolean, kNN: boolean, Native: boolean }, atlasId: ObjectId | string, modelId: ObjectId | string) {
  if (classifier_type.XGBoost || classifier_type.kNN) {
    return _encoder_path(atlasId);
  } else if (classifier_type.Native) {
    const modelAssociatedWithAtlas = await AtlasModelAssociationService.getOneByAtlasAndModelId(
      atlasId,
      modelId
    );
    return model_path(modelAssociatedWithAtlas._id);
  }
  else {
    return null;
  }

}