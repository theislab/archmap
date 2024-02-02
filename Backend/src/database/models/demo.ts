import { Document, model, Schema } from "mongoose";

export interface IDemo extends Document {
    name: string;
    modelName: string; 
    atlasName: string;
    dataURL: string;
}

const demoSchema = new Schema<IDemo>({
    name: { type: String, required: true},
    modelName: { type: String, required: true, alias: "model"},
    atlasName: { type: String, required: true, alias: "atlas"},
    dataURL: { type: String, required: true},
})

export const demoModel = model<IDemo>("Demo", demoSchema);