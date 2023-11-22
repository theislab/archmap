import { ObjectId } from "mongoose";

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

export function get_classifier_path(xgboost:boolean, knn:boolean, encoder: boolean, atlasId: ObjectId | string){
  
  if (xgboost){
    return classifier_path_xgboost(atlasId);
  }
  else if (knn){
    return classifier_path_knn(atlasId);
  }
  else if (encoder){
    return classifier_path_encoder(atlasId);
  }
  else{
    return "";
  }
}

export function classifier_path_xgboost(atlasId: ObjectId | string): string {
  return `classifiers/${atlasId}/classifier_xgb.ubj`;
}

export function classifier_path_knn(atlasId: ObjectId | string): string {
  return `classifiers/${atlasId}/classifier_knn.pickle`;
}

export function classifier_path_encoder(atlasId: ObjectId | string): string {
  return `classifiers/${atlasId}/classifier_encoding.pickle`;
}