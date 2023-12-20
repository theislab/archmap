import { Document, model, Schema } from "mongoose";

export interface IAtlas extends Document {
  name: string;
  previewPictureURL: string;
  modalities: Array<string>;
  numberOfCells: number;
  species: Array<string>;
  compatibleModels: string[]; // Array of strings;
  uploadedBy: string;
  atlasUrl: string;
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
  },
  {
    timestamps: true,
  }
);

export const atlasModel = model<IAtlas>("Atlas", atlasSchema);
