import { BACKEND_ADDRESS, MULTIPART_UPLOAD_STATUS, MULTIPART_UPLOAD_STATUS as Status, UPLOAD_CHUNK_SIZE } from '../utils/common/constants';
import removeItemFromArray from '../utils/common/utils';

export function getSubmissionProgressPercentage(progress) {
  if (progress.chunks === 0) {
    return 0;
  }
  return (progress.uploaded / progress.chunks) * 100;
}

function expectStatus(response, requestName, code) {
  if (response.status !== code) {
    throw new Error(`Invalid status for request "${requestName}" (${response.status})`);
  }
  return response;
}

function getAuthHeader() {
  return {
    auth: localStorage.getItem('jwt'),
  };
}

function getAuthAndJsonHeader() {
  return {
    auth: localStorage.getItem('jwt'),
    'content-type': 'application/json',
  };
}

async function uploadChunks(chunkCount, remaining, selectedFile, uploadId,
  submissionProgress, setSubmissionProgress, promiseArray) {
  for (let index = 1;
    index < chunkCount + 1 && !localStorage.getItem(`cancelUpload_${uploadId}`);
    index += 1) {
    if (!remaining.includes(index)) {
      console.log(`Skipping chunk ${index}`);
      // eslint-disable-next-line no-continue
      continue;
    }
    const start = (index - 1) * UPLOAD_CHUNK_SIZE;
    const end = (index) * UPLOAD_CHUNK_SIZE;
    const blob = (index < chunkCount) ? selectedFile.slice(start, end)
      : selectedFile.slice(start);

    const currentPromise = fetch(`${BACKEND_ADDRESS}/file_upload/get_upload_url?${new URLSearchParams({
      partNumber: index,
      uploadId,
    })}`, { method: 'GET', headers: getAuthHeader() })
      .then((response) => expectStatus(response, 'get_upload_url', 200))
      .then((response) => response.json())
      .then(async ({ presignedUrl }) => fetch(presignedUrl, {
        body: blob,
        method: 'PUT',
        headers: { 'Content-Type': selectedFile.type },
      })
        .then((chunkResponse) => {
          if (chunkResponse.status !== 200) {
            throw new Error(`Invalid status code received for chunk upload (${chunkResponse.status})`);
          }
          const etag = chunkResponse.headers.get('ETag');
          const newRemaining = removeItemFromArray(submissionProgress.remaining, index);
          setSubmissionProgress((prevState) => (
            { ...prevState, uploaded: prevState.uploaded + 1, newRemaining }
          ));
          return { etag, index };
        }));
    promiseArray.push(currentPromise);
    try {
      // sequentializing upload
      // eslint-disable-next-line no-await-in-loop
      await currentPromise;
    } catch (ignored) { /* ignored */ }
  }
}



async function uploadChunksForAtlas(chunkCount, remaining, selectedFile, uploadId, keyPath, updateAndGetLatestProgress, promiseArray, uploadFileType) {
  console.log("promiseArray before push:", promiseArray, Array.isArray(promiseArray));

  for (let index = 1; index <= chunkCount && !localStorage.getItem(`cancelUpload_${uploadId}`); index++) {
    if (!remaining.includes(index)) {
      console.log(`Skipping chunk ${index}`);
      continue;
    }

    const start = (index - 1) * UPLOAD_CHUNK_SIZE;
    const end = index < chunkCount ? start + UPLOAD_CHUNK_SIZE : selectedFile.size;
    const blob = selectedFile.slice(start, end);

    const currentPromise = fetch(`${BACKEND_ADDRESS}/file_upload/get_upload_url`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader()
        },
        body: JSON.stringify({
            partNumber: index,
            uploadId: uploadId,
            keyPath: keyPath
        })
      })
      .then(response => {
        console.log("Response after get_upload_url:", response);
        expectStatus(response, 'get_upload_url', 200)
        return response;
      })
      .then(response => {
        console.log("Response after get_upload_url after:", response);
        return response.json()
      })
      .then(async ({ presignedUrl }) => {
        console.log("presignedUrl:", presignedUrl);
        return fetch(presignedUrl, {
          body: blob,
          method: 'PUT',
          headers: { 'Content-Type': selectedFile.type },
        });
      })
      .then(chunkResponse => {
        console.log("chunkResponse:", chunkResponse);

        if (chunkResponse.status !== 200) {
          throw new Error(`Invalid status code received for chunk upload (${chunkResponse.status})`);
        }
        const etag = chunkResponse.headers.get('ETag');
        console.log("etag:", etag);

        // Get the latest upload progress before updating it
        let latestUploadProgress = updateAndGetLatestProgress({});
        // Log the uploadId and the latestUploadProgress for debugging
        console.log("uploadId:", uploadId, "latestUploadProgress:", latestUploadProgress);

        if (!latestUploadProgress ) {
          throw new Error(`Upload progress not found for uploadId: ${uploadId}`);
        }
        
        let { remaining } = latestUploadProgress;
        console.log("remaining:", remaining);
        const newRemaining = removeItemFromArray(remaining, index);
        console.log("newRemaining:", newRemaining);

        // Update the progress and get the latest state again
        latestUploadProgress = updateAndGetLatestProgress({uploaded: latestUploadProgress.uploaded + 1, remaining: newRemaining});
        return { etag, index, uploadFileType };
      }).catch(error => {
        console.error(`Error uploading chunk, selectedPath ${index}, ${keyPath}:`, error);
        // Handle error (e.g., retry logic, abort, etc.)
      });

    promiseArray.push(currentPromise);

    try {
      await currentPromise; // sequential upload
    } catch (error) {
      console.error(`Error uploading chunk for ${index}:`, error);
      // Handle error (e.g., retry logic, abort, etc.)
    }
  }
}


export function finishAtlasUploads(chunkCount, promiseArray, latestUploadProgress, onProgressUpdate, uploadId, uploadFileType){

  // check for the values if they are not null
  if (!chunkCount || !promiseArray || !latestUploadProgress || !onProgressUpdate || !uploadId || !uploadFileType) {
    console.error("Invalid arguments for finishAtlasUploads");
    throw new Error("Invalid arguments for finishAtlasUploads");
  }
  Promise.all(promiseArray.map((promise) => promise.catch((e) => e)))
    .then(async (promises) => {
      if (localStorage.getItem(`cancelUpload_${uploadId}`)) {
        localStorage.removeItem(`cancelUpload_${uploadId}`);
        return;
      }
      if (latestUploadProgress.remaining.length > 0) {
        onProgressUpdate(uploadId, { status: Status.ERROR_PROGRESS });
        return;
      }
      const uploadPartsArray = latestUploadProgress.uploadedParts;
      promises.forEach(({ etag, index }) => {
        uploadPartsArray.push({
          ETag: etag,
          PartNumber: index,
        });
      });
      onProgressUpdate(uploadId, { uploadedParts: uploadPartsArray, status: Status.UPLOAD_FINISHING });
      console.log("Sending complete upload for atlas")
      console.log("data to be sent:", JSON.stringify({
        parts: uploadPartsArray.sort((a, b) => (a.PartNumber - b.PartNumber)),
        uploadId,
        uploadFileType: uploadFileType
      }));
      fetch(`${BACKEND_ADDRESS}/file_upload/complete_upload_for_atlas`, {
        method: 'POST',
        headers: getAuthAndJsonHeader(),
        body: JSON.stringify({
          parts: uploadPartsArray.sort((a, b) => (a.PartNumber - b.PartNumber)),
          uploadId,
          uploadFileType: uploadFileType
        }),
      })
      .then((response) => {
        console.log('Response received from the backend for uploadId, uploadFileType :', response, uploadId, uploadFileType);
        expectStatus(response, 'complete_upload', 200);
      })
      .then(() => {
        console.log('Upload complete for uploadId, for uploadFileType:', uploadId, uploadFileType);
        onProgressUpdate(uploadId, { status: MULTIPART_UPLOAD_STATUS.COMPLETE });
      })
      .catch((err) => {
        console.log('Error in completing upload for uploadId, for uploadFileType:', uploadId, uploadFileType);
        console.log(err);
        onProgressUpdate(uploadId, { status: MULTIPART_UPLOAD_STATUS.ERROR_FINISH });
      });
      
    }).catch((err) => console.log(err)); 
}




function finishUpload(chunkCount, promiseArray, submissionProgress, setSubmissionProgress,
  selectedFile, uploadId) {
  Promise.all(promiseArray.map((promise) => promise.catch((e) => e)))
    .then(async (promises) => {
      if (localStorage.getItem(`cancelUpload_${uploadId}`)) {
        localStorage.removeItem(`cancelUpload_${uploadId}`);
        return;
      }
      if (submissionProgress.remaining.length > 0) {
        setSubmissionProgress((prevState) => ({
          ...prevState,
          status: Status.ERROR_PROGRESS,
        }));
        return;
      }
      const uploadPartsArray = submissionProgress.uploadedParts;
      promises.forEach(({ etag, index }) => {
        uploadPartsArray.push({
          ETag: etag,
          PartNumber: index,
        });
      });
      setSubmissionProgress((prevState) => ({
        ...prevState, uploadedParts: uploadPartsArray, status: Status.UPLOAD_FINISHING,
      }));

      fetch(`${BACKEND_ADDRESS}/file_upload/complete_upload`, {
        method: 'POST',
        headers: getAuthAndJsonHeader(),
        body: JSON.stringify({
          parts: uploadPartsArray.sort((a, b) => (a.PartNumber - b.PartNumber)),
          uploadId,
        }),
      }).then((response) => expectStatus(response, 'complete_upload', 200))
        .then(() => setSubmissionProgress((prevState) => ({ ...prevState, status: 'complete' })))
        .catch(() => {
          setSubmissionProgress((prevState) => ({
            ...prevState,
            status: 'error_finish',
          }));
        });
    }).catch((err) => console.log(err));
}


// This is how it is called 
// uploadAtlasAndModelFiles(uploadId, file, keyPath, (uploadId, uploadProgress) => {
//   console.log("upload progress", uploadProgress);
//   setProgress(uploadId, uploadProgress);
// });



/**
 * Uploads a file (e.g., atlas, model, classifier) in chunks, tracking the progress and updating the state
 * as the upload progresses.
 *
 * @async
 * @function uploadAtlasAndModelFiles
 * @param {string} uploadId - The unique identifier for this upload.
 * @param {File} selectedFile - The file to be uploaded.
 * @param {string} keyPath - The key path where the file will be stored.
 * @param {ProgressUpdateCallback} onProgressUpdate - A callback function to update the upload progress in the parent component.
 * @param {object} currentUploadProgress - The current upload progress state.
 * @param {string} uploadFileType - The type of the file being uploaded (e.g., ATLAS, MODEL, CLASSIFIER).
 * @returns {Promise<void>} - A promise that resolves when the upload is completed.
 */
export async function uploadAtlasAndModelFiles(uploadId, selectedFile, keyPath, onProgressUpdate, currentUploadProgress, uploadFileType) {
  const chunkCount = Math.floor(selectedFile.size / UPLOAD_CHUNK_SIZE) + 1;
  const promiseArray = [];
  console.log("chunk count for ", keyPath, chunkCount);

  onProgressUpdate(uploadId, { chunks: chunkCount, keyPath: keyPath, uploadFileType: uploadFileType, fileName: selectedFile.name });
  
  // Use the passed currentUploadProgress instead of getLatestUploadProgress
  let latestUploadProgress = currentUploadProgress;
  
  // Check if the state for this uploadId is defined
  if (latestUploadProgress[uploadId]) {
    if (latestUploadProgress[uploadId].status !== Status.ERROR_FINISH) {
      let { remaining } = latestUploadProgress[uploadId];
      console.log("remaining is ", remaining);

      if (!remaining || remaining.length === 0) {
        remaining = Array.from({ length: chunkCount }, (_, i) => i + 1);
        onProgressUpdate(uploadId, { remaining: remaining });
      }

      onProgressUpdate(uploadId, { status: Status.UPLOAD_PROGRESS });
      

      await uploadChunksForAtlas(chunkCount, remaining, selectedFile, uploadId, keyPath,
        (update) => {
          onProgressUpdate(uploadId, update); // Update the state
          return currentUploadProgress[uploadId]; // Return the latest state
        }, promiseArray, uploadFileType);
        onProgressUpdate(uploadId, { status: Status.UPLOAD_FINISHING });
        console.log("latestUploadProgress before finishUploads for the upload id :", uploadId , latestUploadProgress, latestUploadProgress[uploadId]);
        finishAtlasUploads(chunkCount, promiseArray, latestUploadProgress[uploadId], onProgressUpdate, uploadId, uploadFileType);

    }else{
      console.error("Progress state found for uploadId:", uploadId, "but it is in error state");
    }
  } else {
    console.error("No progress state found for uploadId:", uploadId);
  }

}


export async function uploadMultipartFile(uploadId, selectedFile,
  submissionProgress, setSubmissionProgress) {
  const chunkCount = Math.floor(selectedFile.size / UPLOAD_CHUNK_SIZE) + 1;
  const promiseArray = [];

  setSubmissionProgress((prevState) => ({ ...prevState, chunks: chunkCount }));

  if (submissionProgress.status !== Status.ERROR_FINISH) {
    const { remaining } = submissionProgress;
    if (remaining.length === 0) {
      for (let i = 1; i < chunkCount + 1; i += 1) {
        remaining.push(i);
      }
      setSubmissionProgress((prevState) => ({ ...prevState, remaining }));
    }
    setSubmissionProgress((prevState) => ({ ...prevState, status: Status.UPLOAD_PROGRESS }));
    await uploadChunks(chunkCount, remaining, selectedFile,
      uploadId, submissionProgress, setSubmissionProgress, promiseArray);
  }
  finishUpload(chunkCount, promiseArray, submissionProgress,
    setSubmissionProgress, selectedFile, uploadId);
}

const startUpload = (selectedFile,
  submissionProgress,
  setSubmissionProgress,
  projectData = null) => fetch(
  `${BACKEND_ADDRESS}/file_upload/start_upload`,
  {
    method: 'POST',
    headers: getAuthAndJsonHeader(),
    body: JSON.stringify(projectData || { fileName: selectedFile.name }),
  },
)
  .then((response) => expectStatus(response, 'start_upload', 200))
  .then((response) => response.json())
  .then(({ uploadId }) => {
    setSubmissionProgress((prevState) => ({ ...prevState, uploadId }));
    return uploadMultipartFile(uploadId,
      selectedFile, submissionProgress, setSubmissionProgress);
  })
  .catch(() => {
    setSubmissionProgress((prevState) => ({
      ...prevState,
      status: Status.ERROR_START,
    }));
  });

export async function startOrContinueUpload(
  selectedFile,
  submissionProgress,
  setSubmissionProgress,
  projectData = null,
) {
  localStorage.removeItem('cancelUpload');
  const { status, uploadId } = submissionProgress;
  if (status === Status.ERROR_PROGRESS || status === Status.ERROR_FINISH) {
    return uploadMultipartFile(uploadId, selectedFile, submissionProgress, setSubmissionProgress);
  }
  return startUpload(selectedFile, submissionProgress, setSubmissionProgress, projectData);
}
