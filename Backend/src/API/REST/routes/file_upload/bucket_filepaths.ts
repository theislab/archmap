import { ObjectId } from "mongoose";

export function query_path(projectid: ObjectId | string, fileExtension: String | null): string {
  if(fileExtension === null) {
    return `projects/${projectid}/query.h5ad`;  // This is to prevent a bug where the fileextension is null 
  }
  return `projects/${projectid}/query.${fileExtension}`;
}

export function result_path(projectid: ObjectId | string): string {
  return `results/${projectid}/query.csv`;
}
export function result_model_path(projectid: ObjectId | string): string {
  return `results/${projectid}/model.pt`;
}
