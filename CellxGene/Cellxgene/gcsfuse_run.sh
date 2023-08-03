#!/bin/bash
set -eo pipefail;

# Create mount directory for service
mkdir -p $MNT_DIR;
echo "Listing directory."
ls -l;
pwd;
echo "Mounting GCS Fuse.";
gcsfuse --debug_gcs --implicit-dirs --debug_fuse $BUCKET $MNT_DIR 
echo "Mounting completed."

cd ${MNT_DIR};



# cd into ${MNT_DIR}/${FULL_PATH}/ 
# echo "changing directory to ${MNT_DIR}/${FULL_PATH}/"
# cd ${MNT_DIR}/${FULL_PATH}/

echo "the pwd is now: "
pwd; 
echo "the ls is now: "
ls -l;
#echo the directory ${MNT_DIR}/${GCS_FILE_LOCATION} and its content
#echo the content inside the directory "/mnt/gcs/results/64ba7ef41cdf2e0829d355e3/"

# mkdir -p ${USER_GENERATED_DATA_DIR} && chmod 777 ${USER_GENERATED_DATA_DIR};





# Run cellxgene
cellxgene launch --host 0.0.0.0 --port 8080   --annotations-file ${ANNOTATION_FILE}   ${MNT_DIR}/${GCS_FILE_LOCATION} 

wait -n
