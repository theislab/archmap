import { Document, model, Schema } from "mongoose";

export enum ProjectStatus {
  UPLOAD_PENDING = "UPLOAD_PENDING",
  UPLOAD_COMPLETE = "UPLOAD_COMPLETE",
  PROCESSING_PENDING = "PROCESSING_PENDING",
  PROCESSING_FAILED = "PROCESSING_FAILED",
  ABORTED = "ABORTED",
  DONE = "DONE",
}

export enum AtlasUploadStatus {
  UPLOAD_PENDING = "UPLOAD_PENDING",
  UPLOAD_COMPLETE = "UPLOAD_COMPLETE",
  UPLOAD_FAILED = "UPLOAD_FAILED",
}

export interface IProject extends Document {
  owner: Schema.Types.ObjectId;
  teamId: Schema.Types.ObjectId;
  name: string;

  atlasId?: Schema.Types.ObjectId;
  modelId?: Schema.Types.ObjectId;
  classifierId: Schema.Types.ObjectId; 
  model_setup_anndata_args?: object;
  scviHubId?: string;

  // file
  uploadId: string;
  location: string;
  fileName: string;
  fileSize: number; // (of bytes)
  uploadDate: Date;

  // project
  status: string;
  resultName: string;
  resultSize: number;

  //error Message
  errorMessage: string;
}

const projectSchema = new Schema<IProject>({
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    require: true,
  },
  teamId: {
    type: Schema.Types.ObjectId,
    ref: "Team",
    required: false,
  },
  name: { type: String, require: true },

  // one of the following set of fields is required
  // Set 1
  modelId: { type: Schema.Types.ObjectId, require: function() { return !this.model_setup_anndata_args && !this.scviHubId; } },
  atlasId: { type: Schema.Types.ObjectId, require: function() { return !this.model_setup_anndata_args && !this.scviHubId; } },
  // Set 2
  model_setup_anndata_args: {type: Object, require: function() { return !this.modelId && !this.atlasId; }},
  scviHubId: {type: String, require: function() { return !this.modelId && !this.atlasId; }},
  classifierId: { type: Schema.Types.ObjectId, required: false },

  // file
  uploadId: { type: String, require: false },
  fileName: { type: String, require: false },
  location: { type: String, require: false },
  fileSize: { type: Schema.Types.Number, require: false, default: -1 },
  uploadDate: { type: Schema.Types.Date, require: true },

  // project
  status: { type: String, require: true, enum: ProjectStatus },

  resultName: { type: String, require: false },
  resultSize: { type: Schema.Types.Number, require: false, default: -1 },

  //error Message
  errorMessage: { type: String, require: false },
});

export const projectModel = model<IProject>("Project", projectSchema);
