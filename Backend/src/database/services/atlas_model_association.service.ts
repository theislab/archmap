
import { ObjectId } from "mongoose";
import { AtlasModelAssociation, IAtlasModelAssociation } from "../models/atlas_model_association";

export default class AtlasModelAssociationService {
  /**
   * Get all atlas-model associations.
   *
   * @returns An array of atlas-model associations
   */
  static async getAllAssociations(): Promise<IAtlasModelAssociation[]> {
    return await AtlasModelAssociation.find().populate('atlas model').exec();
  }

  /**
   * Get an atlas-model association by its ID.
   *
   * @param associationId - The ID of the association to find
   * @returns The matched association or null
   */
  static async getAssociationById(
    associationId: ObjectId | string
  ): Promise<IAtlasModelAssociation | null> {
    return await AtlasModelAssociation.findById(associationId).populate('atlas model').exec();
  }

  /**
   * Get all associations for a specific atlas ID.
   *
   * @param atlasId - The ID of the atlas
   * @returns An array of associations for the given atlas
   */
  static async getAllByAtlasId(
    atlasId: ObjectId | string
  ): Promise<IAtlasModelAssociation[]> {
    return await AtlasModelAssociation.find({ atlas: atlasId }).populate('atlas model').exec();
  }

  /**
   * Get all associations for a specific model ID.
   *
   * @param modelId - The ID of the model
   * @returns An array of associations for the given model
   */
  static async getAllByModelId(
    modelId: ObjectId | string
  ): Promise<IAtlasModelAssociation[]> {
    return await AtlasModelAssociation.find({ model: modelId }).populate('atlas model').exec();
  }

    /**
     * Create an atlas-model association.
     *
     * @param atlasId - The ID of the atlas
     * @param modelId - The ID of the model
     * @returns The created association
     */
    static async createAssociation(
        atlasId: ObjectId | string,
        modelId: ObjectId | string
    ): Promise<IAtlasModelAssociation> {
        const association = new AtlasModelAssociation({
        atlas: atlasId,
        model: modelId
        });
        return await association.save();
    }
  

  /**
   * Get a specific atlas-model association by atlas ID and model ID.
   *
   * @param atlasId - The ID of the atlas
   * @param modelId - The ID of the model
   * @returns The matched association or null
   */
  static async getOneByAtlasAndModelId(
    atlasId: ObjectId | string,
    modelId: ObjectId | string
  ): Promise<IAtlasModelAssociation | null> {
    return await AtlasModelAssociation.findOne({ atlas: atlasId, model: modelId }).populate('atlas model').exec();
  }

  /**
   * Update modelUploadID by id of atlas_model_association
   * 
   * @param atlasModelID
   * @param modelUploadId
   * 
   */
  static async updateModelByModelUploadId(
    atlasModelID: ObjectId | string,
    modelUploadId: string
  ) {
    // await atlasModel.updateOne({ atlasID }, { encoderUploadPath: encoderUploadPath }).exec();
    await  AtlasModelAssociation.updateOne({ _id: atlasModelID }, { modelUploadId: modelUploadId }).exec();
  }

  /**
   * Update model path by id of atlas_model_association
   * 
   * @param _id
   * @param modelUploadPath
   * 
   */
  static async updateModelPathByModelUploadId(
    _id: ObjectId | string,
    modelUploadPath: string
  ) {
    
    await  AtlasModelAssociation.updateOne({ _id }, { modelUploadPath: modelUploadPath }).exec();
  }

}
