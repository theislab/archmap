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

  let gcloudCommand = `gcloud run deploy ${name} --image=${process.env.CXG_IMAGE_LOCATION} --region=${process.env.REGION} --allow-unauthenticated --port=${process.env.PORT} --set-env-vars=GATEWAY_PORT=${process.env.PORT},GCS_FILE_LOCATION=${gcs_file_location}`;
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
  // TODO: find a less faulty way to find out the gsutils URI. This could break if the file hierarchy changes.
  // Public URL structure: domain.com/BUCKET/FOLDER/SUBFOLDER/FILE
  let relativePath = publicURL.slice(publicURL.search(".com") + 4);
  let arr = relativePath.split("/");
  const BUCKET = arr[1];
  const FOLDER = arr[2];
  const SUBFOLDER = arr[3];

  if (!BUCKET || !FOLDER || !SUBFOLDER) return null;

  return `gs://${BUCKET}/${FOLDER}/${SUBFOLDER}`;
}

module.exports = { gCloudRunDeploy, getAllServices, getService };
