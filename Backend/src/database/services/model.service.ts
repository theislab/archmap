import { IModel, modelModel } from "../models/model";
import { ObjectId } from "mongoose";

export default class ModelService {
  /**
   *  Search for a model with the given model id and return if found.
   *
   *  @param   modelId
   *  @returns model - matched model to modelId or null
   */
  static async getModelById(
    modelId: ObjectId | string
  ): Promise<(IModel & { _id: ObjectId }) | null> {
    return await modelModel.findById(modelId).exec();
  }

  /**
   *  Get all the available models.
   *
   *  @returns model array
   */
  static async getAllModels(): Promise<(IModel & { _id: ObjectId })[]> {
    return await modelModel.find().exec();
  }

  /**
   *  Get model by name.
   *
   *  @param   name
   * @returns model - matched model to name or null
   */
  static async getModelByName( name: string ): Promise<(IModel & { _id: ObjectId }) | null> {

    return await modelModel.findOne({name: name}).exec();
  }

}
