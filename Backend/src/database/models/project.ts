import { Document, model, Schema, Types, ObjectId } from "mongoose";

export enum ProjectStatus {
  UPLOAD_PENDING = "UPLOAD_PENDING",
  UPLOAD_COMPLETE = "UPLOAD_COMPLETE",
  PROCESSING_PENDING = "PROCESSING_PENDING",
  PROCESSING_FAILED = "PROCESSING_FAILED",
  ABORTED = "ABORTED",
  DONE = "DONE",
  DOWNLOAD_READY = "DOWNLOAD_READY"
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

  atlasId: ObjectId | string; // Allow multiple types: String or object id.
  modelId: ObjectId | string; // Allow multiple types: String or object id. 
  classifierId?: Schema.Types.ObjectId; 
  model_setup_anndata_args?: object;
  scviHubId?: string;
  outputFileWithCounts?: string;

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
  ratio: String;
  clust_pres_score: number;
  query_with_anchor: number;
  percentage_unknown: number | string;

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

  modelId: {
    type: Schema.Types.Mixed,
    validate: {
      validator: function (value: any) {
        if (!this.model_setup_anndata_args && !this.scviHubId) {
          console.log('It is an instance of the object id: ', value instanceof Schema.Types.ObjectId);
          return Types.ObjectId.isValid(value);
        } else {
          return typeof value === 'string';; // Allow string type for scvi hub atlases.
        }
      },
      message: 'modelId must be either a String for an scvi hub atlas or an ObjectId.',
    },
    required: true,
  },

  atlasId: {
    type: Schema.Types.Mixed, // Allows multiple types
    validate: {
      validator: function (value: any) {
        if (!this.model_setup_anndata_args && !this.scviHubId) {
          console.log('It is an instance of the object id: ', value instanceof Schema.Types.ObjectId);
          return Types.ObjectId.isValid(value);
        } else {
          return typeof value === 'string'; // Allow string type for scvi hub atlases.
        }
      },
      message: "atlasId must be either a String for an scvi hub atlas or an ObjectId",
    },
    required: true,
  },
  // Set 2
  model_setup_anndata_args: {type: Object, require: false},
  scviHubId: {type: String, require: false},
  classifierId: { type: Schema.Types.ObjectId, require: false },
  outputFileWithCounts: { type: String, require: false },

  // file
  uploadId: { type: String, require: false },
  fileName: { type: String, require: false },
  location: { type: String, require: false },
  fileSize: { type: Schema.Types.Number, require: false, default: -1 },
  uploadDate: { type: Schema.Types.Date, require: true },

  // project
  status: { type: String, require: true, enum: ProjectStatus },

  // ratio
  ratio: {type: String, require: false},

  //metrics
  clust_pres_score: { type: Schema.Types.Number, require: false},
  query_with_anchor: { type: Schema.Types.Number, require: false},
  percentage_unknown: { type: Schema.Types.Number, require: false},

  resultName: { type: String, require: false },
  resultSize: { type: Schema.Types.Number, require: false, default: -1 },

  //error Message
  errorMessage: { type: String, require: false },
});

export const projectModel = model<IProject>("Project", projectSchema);
