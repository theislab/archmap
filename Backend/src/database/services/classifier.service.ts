import { ObjectId } from "mongoose";
import { ICLASSIFIER, classifierModel } from "../models/classifier";

export default class ClassifierService {
  /**
   *  Search for a classifier with the given classifier id and return if found.
   *
   *  @param   classifierId
   *  @returns classifier - matched classifier to classifierId or null
   */
  static async getClassifierById(
    classifier: ObjectId | string
  ): Promise<(ICLASSIFIER & { _id: ObjectId }) | null> {
    return await classifierModel.findById(classifier).exec();
  }

  /**
   *  Get all the available classifiers.
   *
   *  @returns classifier array
   */
  static async getAllClassifiers(): Promise<(ICLASSIFIER & { _id: ObjectId })[]> {
    return await classifierModel.find().exec();
  }
}
