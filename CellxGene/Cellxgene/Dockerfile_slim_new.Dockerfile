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
    && pip install cellxgene \
    && pip install gcsfs \
    && apt-get clean 

ENV CLOUD_SDK_REPO cloud-sdk-jessie
ENV GCSFUSE_REPO gcsfuse-jessie
ENV APP_HOME /app/myuser
ENV MNT_DIR ${APP_HOME}/bucket


# Add a new user
RUN useradd --create-home --shell /bin/bash myuser

RUN echo "deb http://packages.cloud.google.com/apt $CLOUD_SDK_REPO main" | tee -a /etc/apt/sources.list.d/google-cloud-sdk.list && \
    echo "deb http://packages.cloud.google.com/apt $GCSFUSE_REPO main" | tee /etc/apt/sources.list.d/gcsfuse.list && \
    curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key add - && \
    apt-get update && apt-get install -y gcsfuse google-cloud-sdk google-cloud-sdk-gke-gcloud-auth-plugin

# Add these lines to install fsspec
RUN pip install --upgrade pip && \
    pip install fsspec

ENV googleStorageBucket walking-suggestions-data
ENV GOOGLE_APPLICATION_CREDENTIALS ${APP_HOME}/service_account_key/custom-helix-329116-fd2cd11e3ebb.json
ENV SERVICE_ACCOUNT_EMAIL="archmap-ml-runner@custom-helix-329116.iam.gserviceaccount.com"
ENV PROJECT_ID="custom-helix-329116"


WORKDIR $APP_HOME
COPY --chown=myuser:myuser . $APP_HOME
EXPOSE ${PORT}

COPY fuse.conf /etc/fuse.conf


RUN groupadd fuse && \
    usermod -aG fuse myuser


RUN chmod a+x /bin/fusermount

RUN mkdir -p ${MNT_DIR}
RUN ls -a

RUN chown -R myuser:myuser ${APP_HOME}
RUN chown -R myuser:myuser ${MNT_DIR}

RUN chmod +x ${APP_HOME}/gcsfuse_run.sh


USER myuser:myuser
# Use tini to manage zombie processes and signal forwarding
# https://github.com/krallin/tini
ENTRYPOINT ["/usr/bin/tini", "--"]

CMD ["./gcsfuse_run.sh"]

# CMD gcloud auth activate-service-account ${SERVICE_ACCOUNT_EMAIL} --project=${PROJECT_ID} --key-file=${GOOGLE_APPLICATION_CREDENTIALS} && \
#     gcsfuse --foreground --only-dir demos ${BUCKET} ./data; \
#     mkdir -p ${USER_GENERATED_DATA_DIR} && chmod 777 ${USER_GENERATED_DATA_DIR} && \
#     cellxgene launch --host 0.0.0.0 --annotations-dir ./data/${FULL_PATH}/annotations ${GCS_FILE_LOCATION} --user-generated-data-dir ${USER_GENERATED_DATA_DIR}


