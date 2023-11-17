import express, { Router } from "express";
import ClassifierService from "../../../../database/services/classifier.service";

/**
 *  Get details about a classifier.
 */
const get_classifier = (): Router => {
  let router = express.Router();

  router.get("/classifier/:id", async (req: any, res) => {
    const classifierId: string = req.params.id;
    if (!classifierId) return res.status(400).send("Missing classifier id");
    try {
      const classifier = await ClassifierService.getClassifierById(classifierId);
      return res.status(200).json(classifier);
    } catch (err) {
      console.error("Error getting information about the classifier!");
      console.error(JSON.stringify(err));
      console.error(err);
      return res.status(500).send("Unable to retrieve information about the classifier.");
    }
  });
  return router;
};

/**
 *  Get all available classifiers.
 */
const get_classifiers = (): Router => {
  let router = express.Router();

  router.get("/classifiers", async (req: any, res) => {
    try {
      const classifiers = await ClassifierService.getAllClassifiers();
      return res.status(200).json(classifiers);
    } catch (err) {
      console.error("Error accessing the classifiers!");
      console.error(JSON.stringify(err));
      console.error(err);
      return res.status(500).send("Unable to access the classifiers.");
    }
  });
  return router;
};

export { get_classifier, get_classifiers };
