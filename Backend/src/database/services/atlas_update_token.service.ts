import { ObjectId } from "mongoose";
import { AddAtlasUpdateTokenDTO } from "../dtos/atlas_update_token.dto";
import { IAtlasUpdateToken, atlasUpdateTokenModel } from "../models/atlas_update_token";

/**
 *  @class AtlasUpdateTokenService
 *
 *  Provides useful methods to access the database and modify
 *  atlas-update-token, which can be used by the route-controllers.
 */
export default class AtlasUpdateTokenService {
  /**
   *  Creates atlas-update-token for the given userId.
   *
   *  @param    adddto - DTO with atlasId field
   *  @returns  newly created atlas-update-token document
   */
  static async addToken(adddto: AddAtlasUpdateTokenDTO): Promise<IAtlasUpdateToken> {
    return await atlasUpdateTokenModel.create({ _atlasId: adddto._atlasId });
  }

  /**
   *  Search atlas-update-token by the given token.
   *
   *  @param    token
   *  @returns  atalas-update-token or null
   */
  static async getTokenByToken(
    token: string
  ): Promise<(IAtlasUpdateToken & { _id: ObjectId }) | null> {
    return await atlasUpdateTokenModel.findOne({ token });
  }
}