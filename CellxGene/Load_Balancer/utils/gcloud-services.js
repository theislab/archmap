const { exec } = require("child_process");
const { env } = require("process");
const { ServicesClient } = require("@google-cloud/run").v2;

/**
 * This file provides functions to execute gcloud commands to create services and information about them.

 *
 * GCloud(gcloud) Section
 */

/**
 * Executes "gcloud run deploy" with additional arguments
 * @param {*} name - the name of the service to be created.
 * @param {*} file_location - the location of the file to mount.
 * @returns the service URL or -1 if the service could not be created successfully.
 */
let gCloudRunDeploy = (name, file_location) => {
  // Give parameters to the gcloud command. If there is no name
  if (!name) name = `cellxgene-${file_location}`;
  // convert URL to URI used by gsutils
  const gcs_file_location = getGSURI(file_location);
  if (!gcs_file_location) return -1;

  let gcloudCommand = `gcloud beta run deploy ${name} --image=${process.env.CXG_IMAGE_LOCATION} --region=${process.env.REGION}`;
  gcloudCommand += ` --allow-unauthenticated --privileged --port=${process.env.CELLXGENE_PORT} --no-cpu-throttling --cpu-boost`;
  gcloudCommand += ` --platform=${process.env.PLATFORM} --set-env-vars GCS_FILE_LOCATION=${gcs_file_location}`;

  console.log(`Executing command: \n${gcloudCommand}\n`);

  // execute gcloud command in the shell
  // docs: https://nodejs.org/api/child_process.html#child_processexeccommand-options-callback
  return new Promise((resolve) => {
    exec(gcloudCommand, (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`);
        resolve(-1);
      }
      // stdout contains the deployment steps
      console.log(stdout);

      // stderr contains the final status
      console.log(`stderr: ${stderr}`);

      // return the service URL
      resolve(getServiceURL(stderr));
    });
  });
};

/**
 * Set the IAM policy to allow all traffic for the service.
 * @param {*} service_name - The name of the service.
 */
let gCloudSetIAM = (service_name) => {
  let gcloudCommand = `gcloud beta run services add-iam-policy-binding --region=${process.env.REGION} --member=allUsers --role=roles/run.invoker ${service_name}`;
  console.log(`Executing command: \n${gcloudCommand}\n`);

  return new Promise((resolve) => {
    exec(gcloudCommand, (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`);
        resolve(-1);
      }
      // stdout contains the deployment steps
      console.log(stdout);
      // stderr contains the final status
      console.log(`stderr: ${stderr}`);

      // return the service URL
      resolve(getServiceURL(stderr));
    });
  });
};

// the GCR URL begins with "https://" and ends with .app domain
let getServiceURL = (str) => {
  // get the URL by taking the substring from "https:" to ".app"
  let url = str.substring(str.search("https://"), str.search(".app") + 4);
  return url;
};

/**
 * Cloud RUN API Section
 */

// constants for the cloud run API
// The env variables project id is archmap's id and the region is "europe-west3".
const parent = `projects/${env.PROJECT_ID}/locations/${process.env.REGION}`;

// Instantiates a client
const runClient = new ServicesClient();

/**
 * A function that returns an array of all services of a specified project and region.
 * @returns array of services.
 */
async function getAllServices() {
  // Construct request
  const request = {
    parent,
  };
  // Run request
  const iterable = await runClient.listServicesAsync(request);
  let services = [];

  for await (const service of iterable) {
    let serviceObj,
      { uid, name, uri } = service;

    serviceObj = { uid, name, url: uri };
    services.push(serviceObj);
  }

  return services;
}

/**
 * A function to delete all Cellxgene Annotate services with the specified project and region.
 * @return number of deleted services. 
 */
async function deleteAllCellxgeneServices() {
  // Construct request
  const request = {
    parent,
  };
  // Run request
  const iterable = await runClient.listServicesAsync(request);
  let deletedServices = [];

  for await (const service of iterable) {
    let createTime = service["createTime"];
    // Get the current time in seconds
    let currentTime = Date.now()/1000;
    elapsedTime = currentTime - createTime["seconds"];
    let timeout = process.env.TIMEOUT;
    // Delete the service if the elapsed time is greater than the timeout
    if(service["name"].includes("cellxgene-annotate") && elapsedTime>timeout){
      deletedServices.push({name: service["name"], createTime, elapsedTime});
      let serviceName = service["name"].split('/').pop();
      // Delete command
      let gcloudDelete = `gcloud run services delete --region=${process.env.REGION} ${serviceName} --quiet`;
      // Execute gcloud delete command
      exec(gcloudDelete, (error, stdout, stderr) => {
        if (error) {
          console.log(`error: ${error.message}`);
        }
        console.log(stdout);
        console.log(`stderr: ${stderr}`);
      });
    }
  }

  return deletedServices;
}

/**
 * Get service details corresponding to the service name.
 * The service details are: uid, name, uri.
 */
async function getService(name) {
  const namePath = `projects/${process.env.PROJECT_ID}/locations/${process.env.REGION}/services/`;
  const fullName = namePath + name;

  const request = {
    name: fullName,
  };
  // run request
  const response = await runClient.getService(request);

  // return a service object with the below variabless
  return {
    uid: response[0].uid,
    name,
    full_name: response[0].name,
    uri: response[0].uri,
  };
}

/**
 * A function to convert a public URL to a URI needed for gsutils.
 * @param {*} publicURL - Public URL of the returned file.
 * returns gsutil URI.
 */
function getGSURI(publicURL) {
  // Public URL structure: domain.com/BUCKET/FOLDER/SUBFOLDER/FILE
  let relativePath = publicURL.slice(publicURL.search(".com") + 5);
  return `gs://${relativePath}`;
}

module.exports = { gCloudRunDeploy, gCloudSetIAM, getAllServices, getService, deleteAllCellxgeneServices };
