#!/bin/bash
set -eo pipefail;

# Create mount directory for service
mkdir -p $MNT_DIR;
echo "Listing directory."
ls -l;
pwd;
echo "Mounting GCS Fuse.";
gcsfuse --debug_gcs --debug_fuse $BUCKET $MNT_DIR 
echo "Mounting completed."


# cd into ${MNT_DIR}/${FULL_PATH}/ 
echo "changing directory to ${MNT_DIR}/${FULL_PATH}/"
cd ${MNT_DIR}/${FULL_PATH}/

echo "the pwd is now: "
pwd; 

# mkdir -p ${USER_GENERATED_DATA_DIR} && chmod 777 ${USER_GENERATED_DATA_DIR};





# Run cellxgene
cellxgene launch --host 0.0.0.0 --port 8080   --annotations-file ${ANNOTATION_FILE}  ${GCS_FILE_LOCATION} 

wait -n
