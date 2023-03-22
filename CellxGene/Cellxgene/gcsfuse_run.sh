#!/bin/bash

gcloud auth activate-service-account ${SERVICE_ACCOUNT_EMAIL} --project=${PROJECT_ID} --key-file=${GOOGLE_APPLICATION_CREDENTIALS};
gcsfuse -o rw,allow_other -file-mode=777 -dir-mode=777 --foreground ${BUCKET} ${MNT_DIR};
mkdir -p ${USER_GENERATED_DATA_DIR} && chmod 777 ${USER_GENERATED_DATA_DIR};
cellxgene launch --host 0.0.0.0 --annotations-dir ./data/${FULL_PATH}/annotations ${GCS_FILE_LOCATION} --user-generated-data-dir ${USER_GENERATED_DATA_DIR}