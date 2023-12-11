import { ObjectId } from "mongoose";

export interface AddDeletedProjectDTO {
  _id: ObjectId;
  owner: ObjectId;
  teamId: ObjectId;
  name: string;

  atlasId?: ObjectId | string;
  modelId?: ObjectId | string;
  scviHubId?: string,
  model_setup_anndata_args?: object,
  classifierId?: ObjectId, 

  uploadId?: string;
  location?: string;
  fileName?: string;
  fileSize?: number;
  uploadDate?: Date;

  status?: string;
  resultName?: string;
  resultSize?: number;

  deletedAt: Date;
}