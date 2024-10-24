import { ObjectId } from "mongoose";

/**
 *  Stores the raw data to update a project.
 */
export interface UpdateProjectDTO {
  fileSize?: number;
  status?: string;
  location?: string;
  errorMessage?: string;
  outputFileWithCounts?: string;
}

/**
 * Stores the raw data needed to create a project.
 */
export interface AddProjectDTO {
  owner: ObjectId;
  name: string;
  fileName: string;
  uploadDate: Date;
  status: string;
  modelId: ObjectId;
  atlasId: ObjectId;
  classifierId?: ObjectId;
}

/**
 * Stores the raw data needed to create a project using an scvi-hub atlas.
 */
export interface AddScviProjectDTO {
  owner: ObjectId,
  name: string,
  fileName: string,
  uploadDate: Date,
  status: string,
  modelId: string, 
  atlasId: string,
  scviHubId: string,
  model_setup_anndata_args: object,
  classifierId?: ObjectId,
}
