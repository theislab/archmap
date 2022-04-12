import express from "express";
import {ExtRequest} from "../../../definitions/ext_request";
import {projectJobModel} from "../../../database/models/projectJob";
import check_auth from "../middleware/check_auth";

export default function get_job_route() {
  let router = express.Router();

  router
    .get("/job/:id", check_auth(), async (req: ExtRequest, res: any) => {
      const jobId = req.params.id;
      const job = await projectJobModel.findById(jobId);

      if (!job)
        return res.status(404).send(`Job ${jobId} not found`);

      return res.status(200).json(job);
    });
  return router;
}
