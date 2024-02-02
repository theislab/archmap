import { AddAtlasDTO } from "../dtos/atlas.dto";
import { IAtlas, atlasModel } from "../models/atlas";
import { ObjectId } from "mongoose";

export default class AtlasService {
  /**
   *  Search for an atlas with the given atlas id and return if found.
   *
   *  @param   atlasId
   *  @returns atlas - matched atlas to atlasId or null
   */
  static async getAtlasById(
    atlasId: ObjectId | string
  ): Promise<(IAtlas & { _id: ObjectId }) | null> {
    return await atlasModel.findById(atlasId).exec();
  }

  /**
   *  Get all the available atlases.
   *
   *  @returns atlas array
   */
  static async getAllAtlases(): Promise<(IAtlas & { _id: ObjectId })[]> {
    return await atlasModel.find().exec();
  }

  /**
   *  Create a new atlas.
   *
   *  param atlas - the atlas to create
   * @returns atlas - newly created atlas
   */
  static async createAtlas(
    atlas: AddAtlasDTO
  ): Promise<IAtlas & { _id: ObjectId }> {
    return await atlasModel.create(atlas);
  }


  /**
   *  Delete an atlas.
   *
   *  param atlasId - the atlas to delete
   * @returns atlas - deleted atlas
   */

  static async deleteAtlasById(
    atlasId: ObjectId | string
  ): Promise<(IAtlas & { _id: ObjectId }) | null> {
    return await atlasModel.findByIdAndDelete(atlasId).exec();
  }

  /**
   *  update atlas by atlasUploadId
   *
   *  @param   atlasID
   *  @param atlasUploadId
   */
  static async updateAtlasByAtlasUploadId(
    atlasID: ObjectId | string,
    atlasUploadId: string
  ) {
    await atlasModel.updateOne({ _id: atlasID }, { atlasUploadId: atlasUploadId }).exec();
  }



  /**
   *  update atlas by classifierUploadId
   *
   *  @param   atlasID
   *  @param classifierUploadId
   */
  static async updateAtlasByClassifierUploadId(
    atlasID: ObjectId | string,
    classifierUploadId: string
  ) {
    await atlasModel.updateOne({_id: atlasID }, { classifierUploadId: classifierUploadId }).exec();
  }

  /**
   *  update atlas by encoderUploadId
   *
   *  @param   atlasID
   *  @param encoderUploadId
   */
  static async updateAtlasByEncoderUploadId(
    atlasID: ObjectId | string,
    encoderUploadId: string
  ) {
    await atlasModel.updateOne({ _id:atlasID }, { encoderUploadId: encoderUploadId }).exec();
  }

  /**
   *  update atlas by modelUploadId
   *
   *  @param   atlasID
   *  @param modelUploadId
   */

  static async updateAtlasByModelUploadId(
    atlasID: ObjectId | string,
    modelUploadId: string
  ) {
    await atlasModel.updateOne({ _id: atlasID }, { modelUploadId: modelUploadId }).exec();
  }

  /**
   *  update atlas by atlasUploadPath
   *
   *  @param   atlasID
   *  @param atlasUploadPath
   */
  static async updateAtlasByAtlasUploadPath(
    atlasID: ObjectId | string,
    atlasUploadPath: string
  ) {
    await atlasModel.updateOne({ _id: atlasID }, { atlasUploadPath: atlasUploadPath }).exec();
  }

  /**
   *  update atlas by classifierUploadPath
   *
   *  @param   atlasID
   *  @param classifierUploadPath
   */
  static async updateAtlasByClassifierUploadPath(
    atlasID: ObjectId | string,
    classifierUploadPath: string
  ) {
    await atlasModel.updateOne({ _id: atlasID }, { classifierUploadPath: classifierUploadPath }).exec();
  }

  /**
   *  update atlas by encoderUploadPath
   *
   *  @param   atlasID
   *  @param encoderUploadPath
   */
  static async updateAtlasByEncoderUploadPath(
    atlasID: ObjectId | string,
    encoderUploadPath: string
  ) {
    await atlasModel.updateOne({ _id:atlasID }, { encoderUploadPath: encoderUploadPath }).exec();
  }

  
  
  /**
   *  update atlas by status
   *
   *  @param   atlasID
   *  @param status
   */

  static async updateAtlasByStatus(
    atlasID: ObjectId | string,
    status: string
  ) {
    await atlasModel.updateOne({ _id:atlasID }, { status: status }).exec();
  }

  /**
   *  get atlas by atlasUploadId
   *
   *  @param   atlasUploadId
   *  
   */
  static async getAtlasByAtlasUploadId(
    atlasUploadId: string
  ): Promise<(IAtlas & { _id: ObjectId }) | null> {
    return await atlasModel.findOne({ atlasUploadId: atlasUploadId }).exec();
  }

  
  /**
   * get atlas by classifierUploadId
   * 
   * @param classifierUploadId
   *  
   *  
    */
  static async getAtlasByClassifierUploadId(
    classifierUploadId: string
  ): Promise<(IAtlas & { _id: ObjectId }) | null> {
    return await atlasModel.findOne({ classifierUploadId: classifierUploadId }).exec();
  }

  
  /**
   * get atlas by encoderUploadId
   * 
   * @param encoderUploadId
   *  
   *  
    */
  static async getAtlasByEncoderUploadId(
    encoderUploadId: string
  ): Promise<(IAtlas & { _id: ObjectId }) | null> {
    return await atlasModel.findOne({ encoderUploadId: encoderUploadId }).exec();
  }

  /**
   * 
   * update atlas by atlasFilesize
   * 
   * @param atlasID
   * @param atlasFilesize
   * 
   */
  static async updateAtlasByAtlasFilesize(
    atlasID: ObjectId | string,
    atlasFilesize: number
  ) {
    await atlasModel.updateOne({ _id: atlasID }, { atlasFilesize: atlasFilesize }).exec();
  }

  /**
   * 
   * update atlas by classifierFilesize
   * 
   * @param atlasID
   * @param classifierFilesize
   * 
   */

  static async updateAtlasByClassifierFilesize(
    atlasID: ObjectId | string,
    classifierFilesize: number
  ) {
    await atlasModel.updateOne({ _id: atlasID }, { classifierFilesize: classifierFilesize }).exec();
  }

  /**
   * 
   * update atlas by encoderFilesize
   * 
   * @param atlasID
   * @param encoderFilesize
   * 
   */

  static async updateAtlasByEncoderFilesize(
    atlasID: ObjectId | string,
    encoderFilesize: number
  ) {
    await atlasModel.updateOne({ _id: atlasID }, { encoderFilesize: encoderFilesize }).exec();
  }

  /**
   * 
   * update atlas by atlasUploadStatus
   * 
   * @param atlasID
   * @param atlasUploadStatus
   * 
   */

  static async updateAtlasByAtlasUploadStatus(
    atlasID: ObjectId | string,
    atlasUploadStatus: string
  ) {
    await atlasModel.updateOne({ _id: atlasID }, { atlasUploadStatus: atlasUploadStatus }).exec();
  }

  /**
   * 
   * update atlas by classifierUploadStatus
   * 
   * @param atlasID
   * @param classifierUploadStatus
   * 
   */

  static async updateAtlasByClassifierUploadStatus(
    atlasID: ObjectId | string,
    classifierUploadStatus: string
  ) {
    await atlasModel.updateOne({ _id: atlasID }, { classifierUploadStatus: classifierUploadStatus }).exec();
  }

  /**
   * 
   * update atlas by encoderUploadStatus
   * 
   * @param atlasID
   * @param encoderUploadStatus
   * 
   */

  static async updateAtlasByEncoderUploadStatus(
    atlasID: ObjectId | string,
    encoderUploadStatus: string
  ) {
    await atlasModel.updateOne({ _id: atlasID }, { encoderUploadStatus: encoderUploadStatus }).exec();
  }



}
