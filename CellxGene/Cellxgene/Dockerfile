FROM python:3.10-buster
ENV PYTHONUNBUFFERED 1

# gcloud run deploy cellxgene-mounted --port 8080 --source . \
#     --execution-environment gen2 \
#     --allow-unauthenticated \
#     --service-account fs-identity \
#     --update-env-vars BUCKET=jst-2021-bucket-static,GCS_FILE_LOCATION=/mnt/gcs/demos/result_pancreas_scanvi_cxg/result_pancreas_scANVI_cxg.h5ad,FULL_PATH=demos/result_pancreas_scanvi_cxg

# Install system dependencies
RUN set -e; \
    apt-get update -y && apt-get install -y \
    tini \
    lsb-release; \
    gcsFuseRepo=gcsfuse-`lsb_release -c -s`; \
    echo "deb http://packages.cloud.google.com/apt $gcsFuseRepo main" | \
    tee /etc/apt/sources.list.d/gcsfuse.list; \
    curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | \
    apt-key add -; \
    apt-get update; \
    apt-get install -y gcsfuse \
    && apt-get clean 


RUN python -m pip install --upgrade pip

RUN  pip install cellxgene

RUN pip install gcsfs

# werkzeug version 2.2.3 is required for cellxgene to run without error
RUN pip install werkzeug==2.2.3 

# # Set fallback mount directory
ENV MNT_DIR /mnt/gcs
# SET default annotation file; can be overridden at runtime
ENV ANNOTATION_FILE annotation_file 
# ENV SERVICE_ACCOUNT_EMAIL="archmap-ml-runner@custom-helix-329116.iam.gserviceaccount.com"
# ENV GOOGLE_APPLICATION_CREDENTIALS="/app/custom-helix-329116-fd2cd11e3ebb.json"
# ENV PROJECT_ID="custom-helix-329116"

ENV APP_HOME /app/
WORKDIR $APP_HOME
COPY . ./



RUN chmod +x ${APP_HOME}gcsfuse_run.sh

# Use tini to manage zombie processes and signal forwarding
# https://github.com/krallin/tini
ENTRYPOINT ["/usr/bin/tini", "--"]

CMD ["./gcsfuse_run.sh"]

# CMD gcloud auth activate-service-account ${SERVICE_ACCOUNT_EMAIL} --project=${PROJECT_ID} --key-file=${GOOGLE_APPLICATION_CREDENTIALS} && \
#     gcsfuse --foreground --only-dir demos ${BUCKET} ./data; \
#     mkdir -p ${USER_GENERATED_DATA_DIR} && chmod 777 ${USER_GENERATED_DATA_DIR} && \
#     cellxgene launch --host 0.0.0.0 --annotations-dir ./data/${FULL_PATH}/annotations ${GCS_FILE_LOCATION} --user-generated-data-dir ${USER_GENERATED_DATA_DIR}


