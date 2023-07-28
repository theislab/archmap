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
let gCloudRunDeploy = (name, file_location, bucket_name) => {
  // Give parameters to the gcloud command. If there is no name
  if (!name) name = `cellxgene-${file_location}`;
  // convert URL to URI used by gsutils
  const gcs_file_location = getGSURI(file_location);
  if (!gcs_file_location) return -1;

  // gcloud run deploy cellxgene-mounted-testing --port 8080 --source . --execution-environment
  //  gen2 --allow-unauthenticated --service-account cellxgene
  //  --update-env-vars BUCKET=jst-2021-bucket-2022-dev,GCS_FILE_LOCATION=results/64ba7ef41cdf2e0829d355e3/query_cxg.h5ad,DISABLE_CUSTOM_COLORS=1

  let gcloudCommand = `gcloud run deploy ${name} --image=${process.env.CXG_IMAGE_LOCATION} --region=${process.env.REGION}`;
  gcloudCommand += ` --allow-unauthenticated  --execution-environment gen2 --service-account cellxgene --port=${process.env.CELLXGENE_PORT} --no-cpu-throttling --cpu-boost`;
  gcloudCommand += ` --platform=${process.env.PLATFORM} --update-env-vars GCS_FILE_LOCATION=${gcs_file_location},BUCKET=${bucket_name}`;

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
    let currentTime = Date.now() / 1000;
    elapsedTime = currentTime - createTime["seconds"];
    let timeout = process.env.TIMEOUT;
    // Delete the service if the elapsed time is greater than the timeout
    if (
      service["name"].includes("cellxgene-annotate") &&
      elapsedTime > timeout
    ) {
      deletedServices.push({ name: service["name"], createTime, elapsedTime });
      let serviceName = service["name"].split("/").pop();
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
  // location is  "https://storage.googleapis.com/jst-2021-bucket-2022-dev/results/64ba7ef41cdf2e0829d355e3/query_cxg.h5ad?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=GOOG1EZSIBCPIY5SKUXITJNJJAUSZWZJHUHPAUJLUVBF3KXMGU6VPBY33J5BI%2F20230721%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20230721T125100Z&X-Amz-Expires=604799&X-Amz-Signature=ba2f6f10b18df97e29edba219ca827a923b051d195b02142f212c65ec65d7cfc&X-Amz-SignedHeaders=host"
  // remove the query string from the location
  const url = new URL(publicURL);
  const secondSlashIndex = url.pathname.indexOf("/", 1); // Find the second occurrence of '/'
  const path = url.pathname.slice(secondSlashIndex + 1); // Get the rest of the path
  return path;
}

module.exports = {
  gCloudRunDeploy,
  gCloudSetIAM,
  getAllServices,
  getService,
  deleteAllCellxgeneServices,
};
