import React, { useState } from 'react';
import { MULTIPART_UPLOAD_STATUS } from 'shared/utils/common/constants';

const UploadProgressContext = React.createContext();
UploadProgressContext.displayName = 'UploadProgressContext';

const initUploadProgress = (uploadId, keyPath, uploadFileType, fileName) => {

  return {
    status: MULTIPART_UPLOAD_STATUS.IDLE,
    uploadId,
    chunks: 0,
    uploaded: 0,
    remaining: [],
    uploadedParts: [],
    keyPath,
    uploadFileType,
    fileName,
  };
}

function UploadProgressProvider(props) {
  const [uploadProgress, setUploadProgress] = useState({});
 

  const value = [ uploadProgress, setUploadProgress ];

  return <UploadProgressContext.Provider value={value} {...props} />;
}

export function useUploadProgress() {
  const context = React.useContext(UploadProgressContext);
  if (context === undefined) {
    console.log('context Error:: ', context);
    throw new Error('useUploadProgress must be used within an UploadProgressProvider');
  }
  return context;
}

export { UploadProgressProvider, initUploadProgress };
