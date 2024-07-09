import { Document, model, Schema } from "mongoose";

//TODO: 
// create file size field in atlas, classifier, encoder, and model
// create status for atlas, classifier, encoder, model
export interface IAtlas extends Document {
  name: string;
  previewPictureURL: string;
  modalities: Array<string>;
  numberOfCells: number;
  species: Array<string>;
  compatibleModels: string[]; // Array of strings;
  uploadedBy: string;
  atlasUrl: string;
  atlasUploadId: string;
  classifierUploadId: string;
  encoderUploadId: string;
  atlasFilesize: number;
  classifierFilesize: number;
  encoderFilesize: number;
  atlasUploadStatus: string;
  classifierUploadStatus: string;
  encoderUploadStatus: string;
  status: string;
  atlasUploadPath: string;
  classifierUploadPath: string;
  encoderUploadPath: string;
  vars: string;
  inRevision: boolean;
  
}

const atlasSchema = new Schema<IAtlas>(
  {
    name: {
      type: String,
      required: true,
    },

    previewPictureURL: {
      type: String,
      required: false,
    },

    modalities: [
      {
        type: String,
        required: true,
      },
    ],

    numberOfCells: {
      type: Number,
      required: true,
    },

    species: [
      {
        type: String,
        required: true,
      },
    ],

    compatibleModels: [
      {
        type: String,
        required: true,
      },
    ],
    uploadedBy: { type: String, required: false },
    atlasUrl: { type: String, required: false },
    atlasUploadId: { type: String, required: false },
    classifierUploadId: { type: String, required: false },
    encoderUploadId: { type: String, required: false },
    status: { type: String, required: false },
    atlasUploadPath: { type: String, required: false },
    classifierUploadPath: { type: String, required: false },
    encoderUploadPath: { type: String, required: false },
    atlasFilesize: { type: Number, required: false },
    classifierFilesize: { type: Number, required: false },
    encoderFilesize: { type: Number, required: false },
    atlasUploadStatus: { type: String, required: false },
    classifierUploadStatus: { type: String, required: false, default: 'NOT_AVAILABLE' },
    encoderUploadStatus: { type: String, required: false, default: 'NOT_AVAILABLE' },
    vars: { type: String, required: false, default: 'VAR_NAMES_NOT_AVAILABLE' },
    inRevision: { type: Boolean, required: false, default: false },


  },
  {
    timestamps: true,
  }
);

export const atlasModel = model<IAtlas>("Atlas", atlasSchema);
