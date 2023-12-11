import { Document, model, Schema } from "mongoose";
import { IAtlas } from "./atlas"; // Replace with the actual path to your IAtlas
import { IModel } from "./model"; // The path should point to where your IModel is exported

export interface IAtlasModelAssociation extends Document {
  atlas: IAtlas['_id']; // Reference to the Atlas document's _id
  model: IModel['_id']; // Reference to the Model document's _id
  modelUploadId: string;
  modelUploadPath: string;
  status: string;
}

const atlasModelAssociationSchema = new Schema<IAtlasModelAssociation>(
  {
    atlas: {
      type: Schema.Types.ObjectId,
      ref: 'Atlas', // This should match the name you've given your Atlas model
      required: true
    },
    model: {
      type: Schema.Types.ObjectId,
      ref: 'Model', // This should match the name you've given your Model model
      required: true
    },
    modelUploadId: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      required: false,
    },
    modelUploadPath: {
      type: String,
      required: false,
    },


  },
  {
    timestamps: true, // This will add createdAt and updatedAt fields
  }
);

export const AtlasModelAssociation = model<IAtlasModelAssociation>('AtlasModelAssociation', atlasModelAssociationSchema);
