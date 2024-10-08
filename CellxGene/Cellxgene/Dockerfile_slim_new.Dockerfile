FROM python:3.7.7-buster
ENV PYTHONUNBUFFERED 1


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
    && apt-get clean \
    && pip install gcsfs \
    && pip install cellxgene

# Set fallback mount directory
ENV MNT_DIR /mnt/gcs

ENV APP_HOME /app/
WORKDIR $APP_HOME
COPY . ./





RUN chmod +x ${APP_HOME}/gcsfuse_run.sh

# Use tini to manage zombie processes and signal forwarding
# https://github.com/krallin/tini
ENTRYPOINT ["/usr/bin/tini", "--"]

CMD [${APP_HOME}"/gcsfuse_run.sh"]

# CMD gcloud auth activate-service-account ${SERVICE_ACCOUNT_EMAIL} --project=${PROJECT_ID} --key-file=${GOOGLE_APPLICATION_CREDENTIALS} && \
#     gcsfuse --foreground --only-dir demos ${BUCKET} ./data; \
#     mkdir -p ${USER_GENERATED_DATA_DIR} && chmod 777 ${USER_GENERATED_DATA_DIR} && \
#     cellxgene launch --host 0.0.0.0 --annotations-dir ./data/${FULL_PATH}/annotations ${GCS_FILE_LOCATION} --user-generated-data-dir ${USER_GENERATED_DATA_DIR}


