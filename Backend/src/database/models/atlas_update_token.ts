import { Document, Schema, model } from "mongoose";
import * as crypto from "crypto";

export interface IAtlasUpdateToken extends Document {
  _atlasId: Schema.Types.ObjectId;
  token: string;
}

const atlasUpdateTokenSchema = new Schema<IAtlasUpdateToken>({
  _atlasId: { type: Schema.Types.ObjectId, required: true, ref: "Atlas" },
  token: { type: String, required: true, default: () => crypto.randomBytes(32).toString("hex") },
});

export const atlasUpdateTokenModel = model<IAtlasUpdateToken>(
  "AtlasUpdateToken",
  atlasUpdateTokenSchema,
);