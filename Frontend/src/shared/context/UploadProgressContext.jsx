import React, { useState } from 'react';
import { MULTIPART_UPLOAD_STATUS } from 'shared/utils/common/constants';

const UploadProgressContext = React.createContext();
UploadProgressContext.displayName = 'UploadProgressContext';

const initUploadProgress = (uploadId) => {

  return {
    status: MULTIPART_UPLOAD_STATUS.IDLE,
    uploadId,
    chunks: 0,
    uploaded: 0,
    remaining: [],
    uploadedParts: [],
  };
}

function UploadProgressProvider(props) {
  const [uploadProgress, setUploadProgress] = useState({});
 

  // create a documentation for it
  const setProgress = (uploadId, progress) => {
    console.log('setting progress', uploadId, progress);
    
    setUploadProgress(prev => {
      // Check if the uploadId already exists in the state
      const currentProgressForUploadId = prev[uploadId] ?? {};
      
  
      // Log the old progress for this uploadId
      console.log('old progress for ' + uploadId, currentProgressForUploadId);
  
      return {
        ...prev,
        [uploadId]: { ...currentProgressForUploadId, ...progress },
      };
    });
  
    // Note: Logging 'new progress' immediately after setUploadProgress won't reflect the updated state
  };

  const value = { uploadProgress, setProgress };

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
