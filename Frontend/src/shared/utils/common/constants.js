import { red, green, yellow, grey, blue } from "@mui/material/colors";

const DEV_BACKEND_ADDRESS =
  "https://devversion-dot-custom-helix-329116.ey.r.appspot.com/v1";
const DEV_BACKEND_ADDRESS_LOCAL = "http://localhost:8050/v1";
const PRODUCTION_BACKEND_ADDRESS =
  "https://custom-helix-329116.ey.r.appspot.com/v1";
export const BACKEND_ADDRESS = PRODUCTION_BACKEND_ADDRESS;

// const names for indexed DB variables
// const names for indexed DB variables
export const INDEXED_DB_NAME = "indexedDB-archmap-projects";
export const DB_VERSION = 1;

// const variables for emails to send contact forms to
// EmailJS Variables for: ronald.skorobogat@helmholtz-muenchen.de
export const SERVICE_ID = "service_iv3tvs5";
export const TEMPLATE_ID = "template_3336nfq";
export const PUBLIC_KEY = "FVrX1Wu4qZfbJBQ5u";

export const JOB_QUEUE_UPDATE_INTERVAL = 5000;
export const PROJECTS_UPDATE_INTERVAL = 5000;

export const UPLOAD_CHUNK_SIZE = 25000000; // 50MB
export const MULTIPART_UPLOAD_STATUS = {
  IDLE: "idle",
  SELECTED: "selected",
  UPLOAD_STARTING: "upload_starting",
  ERROR_START: "error_start",
  UPLOAD_PROGRESS: "upload_progress",
  UPLOAD_FINISHING: "upload_finishing",
  UPLOAD_PENDING: "UPLOAD_PENDING",
  UPLOAD_COMPLETE: "UPLOAD_COMPLETE",
  ERROR_PROGRESS: "error_progress",
  UPLOAD_FINISHING: "upload_finishing",
  ERROR_FINISH: "error_finish",
  COMPLETE: "complete",
  CANCELING: "canceling",
};

export const UPLOAD_FILE_TYPE = {
  ATLAS: "atlas",
  CLASSIFIER: "classifier",
  MODEL: "model",
  ENCODER: "encoder",
};
export const statusIsUpload = (status) => status.startsWith("upload_");
export const statusIsError = (status) => status.startsWith("error_");

export const jobStatusColors = {
  UPLOAD_PENDING: yellow[600],
  PROCESSING_PENDING: blue[300],
  ABORTED: red[300],
  DONE: green[300],
  unknown: grey[500],
};

export const jobStatusTitles = {
  UPLOAD_PENDING: "UPLOADING",
  UPLOAD_COMPLETE: "UPLOADED",
  PROCESSING_PENDING: "PROCESSING",
  ABORTED: "CANCELLED",
  DONE: "COMPLETED",
  unknown: "UNKNOWN",
};

export const PROJECT_STATUS = {
  UPLOAD_PENDING: "UPLOAD_PENDING",
  UPLOAD_COMPLETE: "UPLOAD_COMPLETE",
  PROCESSING_PENDING: "PROCESSING_PENDING",
  PROCESSING_FAILED: "PROCESSING_FAILED",
  ABORTED: "ABORTED",
  DONE: "DONE",
  DOWNLOAD_READY: "DOWNLOAD_READY",
};

export const getUploadStatusMessage = (status) => {
  const statusMessages = {
    idle: "Idle",
    selected: "File Selected",
    upload_starting: "Starting Upload",
    error_start: "Error at Start",
    upload_progress: "Upload in Progress",
    upload_finishing: "Finishing Upload",
    UPLOAD_PENDING: "Upload Pending",
    UPLOAD_COMPLETE: "Upload Complete",
    error_progress: "Error during Upload",
    error_finish: "Error at Finish",
    complete: "Complete",
    canceling: "Canceling",
  };

  return statusMessages[status] || "Unknown Status";
};
