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

ls -l $MNT_DIR;

# mkdir -p ${USER_GENERATED_DATA_DIR} && chmod 777 ${USER_GENERATED_DATA_DIR};





# Run cellxgene
cellxgene launch --host 0.0.0.0 --port 8080  --annotations-dir ${MNT_DIR}/${FULL_PATH}/annotations ${GCS_FILE_LOCATION} 

wait -n