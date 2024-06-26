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

export function model_path_scpoli(modelId: ObjectId | string): {
  scpoli_attr: string;
  scpoli_model_params: string;
  scpoli_var_names: string;
} {
  return {
    scpoli_attr: `models/${modelId}/attr.pkl`,
    scpoli_model_params: `models/${modelId}/model_params.pt`,
    scpoli_var_names: `models/${modelId}/var_names.csv`,
  };
}

// the argument will of the form
// let classifier_type = {
//   XGBoost : false,
//   kNN : false,
//   Native: false
// };
export async function get_classifier_path(
  atlasId: ObjectId | string,
  modelId: ObjectId | string
) {
  const modelAssociatedWithAtlas = await AtlasModelAssociationService.getOneByAtlasAndModelId(
      atlasId,
      modelId
    );
    return `models/${modelAssociatedWithAtlas._id}/`;
  } 

export function classifier_path_xgboost(modelAssociatedWithAtlas: ObjectId | string): string {
  return `models/${modelAssociatedWithAtlas}/`;
}

export function classifier_path_knn(modelAssociatedWithAtlas: ObjectId | string): string {
  return `models/${modelAssociatedWithAtlas}/`;
}

function _encoder_path(modelAssociatedWithAtlas: ObjectId | string) {
  return `models/${modelAssociatedWithAtlas}/`;
}

export async function get_encoder_path(
  classifier_type: { XGBoost: boolean; kNN: boolean; Native: boolean },
  atlasId: ObjectId | string,
  modelId: ObjectId | string
) {
  if (classifier_type.XGBoost || classifier_type.kNN) {
    return _encoder_path(atlasId);
  } else if (classifier_type.Native) {
    const modelAssociatedWithAtlas = await AtlasModelAssociationService.getOneByAtlasAndModelId(
      atlasId,
      modelId
    );
    return model_path(modelAssociatedWithAtlas._id);
  } else {
    return null;
  }
}
