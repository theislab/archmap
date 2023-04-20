import check_auth from "../../middleware/check_auth";
import { ExtRequest } from "../../../../definitions/ext_request";
import ProjectService from "../../../../database/services/project.service";
import { AddProjectDTO } from "../../../../database/dtos/project.dto";
import { S3 } from "aws-sdk";
import s3 from "../../../../util/s3";
import express from "express";
import { validationMdw } from "../../middleware/validation";
import { ProjectStatus } from "../../../../database/models/project";



export default function upload_start_upload_route() {
  let router = express.Router();
  router.post(
    "/file_upload/start_upload",
    validationMdw,
    check_auth(),
    async (req: ExtRequest, res) => {
      let { projectName, atlasId, modelId, fileName, fileExtension } = req.body;
      if (!process.env.S3_BUCKET_NAME) {
        return res.status(500).send("S3-BucketName is not set");
      }
      if(req.file != undefined){
        console.log("File uploaded is ", req.file);
      }else{
        console.log("File is undefined");
      }
      let project = null; // declare project variable outside the try-catch block
      try {
        const projectToAdd: AddProjectDTO = {
          owner: req.user_id!,
          name: projectName,
          modelId,
          atlasId,
          fileName: String(fileName),
          uploadDate: new Date(),
          status: ProjectStatus.UPLOAD_PENDING,
          fileExtension: String(fileExtension),
        };
        console.log("Creating project", projectToAdd);
        project = await ProjectService.addProject(projectToAdd);
        console.log("Project added", project);
        let params: S3.CreateMultipartUploadRequest = null;
        if(fileExtension === "h5ad"){
          params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: `projects/${project._id}/query.h5ad`,
          };
        }
        else if (fileExtension === "rds"){
          params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: `projects/${project._id}/query.rds`,
          };
        }
        if(params === null){
          if (project !== null) {
            await ProjectService.deleteProjectById(project._id); // delete project if there's an error
            console.log("Project deleted", project._id);
          }
          return res.status(500).send("File extension not supported");
        }
        console.log("Creating multipart upload", params);
        s3.createMultipartUpload(params, async (err, uploadData) => {
          if (err) {
            console.error("Error while creating multipart upload", err, err.stack || "Error when requesting uploadId");
            if (project !== null) {
              await ProjectService.deleteProjectById(project._id); // delete project if there's an error
              console.log("Project deleted", project._id);
            }
            res.status(500).send(err);
          } else {
            if (!uploadData.UploadId) {
              console.error("No upload file found");
              if (project !== null) {
                await ProjectService.deleteProjectById(project._id); // delete project if there's no upload file
                console.log("Project deleted", project._id);
              }
              res.status(400).send("No upload file found");
            } else if (uploadData.UploadId !== undefined){
              console.log("Updating project with uploadId", uploadData.UploadId);
              await ProjectService.updateUploadId(project._id, uploadData.UploadId);
            }
            let updatedProject = await ProjectService.getProjectById(project._id);
            console.log("Updated project", updatedProject)
            res.status(200).send(updatedProject);
          }
        });
      } catch (err) {
        console.log("Error in uploading", err);
        if (project !== null) {
          await ProjectService.deleteProjectById(project._id); // delete project if there's an error
          console.log("Project deleted", project._id);
        }
        res.status(500).send(err);
      }
    }
  );
  return router;
}
