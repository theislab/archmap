import { Document, model, Schema } from "mongoose";

export interface ICLASSIFIER extends Document {
  name: string;
  description: string;
  classiferUrl: string;
}

const classifierSchema = new Schema<ICLASSIFIER>(
  {
    name: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: false,
      default: "",
    },
    classiferUrl: { type: String, required: false },
  },
  {
    timestamps: true,
  }
);

export const classifierModel = model<ICLASSIFIER>("Classifier", classifierSchema);
