import { ObjectId } from "mongoose";

/**
 *  Stores the raw data needed to create a project update token.
 */
export interface AddAtlasUpdateTokenDTO {
  _atlasId: ObjectId;
}