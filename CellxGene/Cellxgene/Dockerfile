FROM python:3.9 as cellxgene-build

COPY . .

RUN pip install cellxgene\
    gcsfs
    
FROM gcr.io/google.com/cloudsdktool/google-cloud-cli:latest 

# Copy everything from the first layer
COPY --from=cellxgene-build . .

# Cellxgene-gateway-specific environmental variables
ENV CELLXGENE_DATA=/data
# GCS_FILE_LOCATION
ENV GCS_FILE_LOCATION=""
#"gs://jst-2021-bucket-2022-dev/test_cxg_read_from_bucket"
ENV CELLXGENE_LOCATION=/usr/local/bin/cellxgene
ENV GATEWAY_PORT=5005

# Container timeout 
ENV TIMEOUT=600

#GCloud-specific environmental variables
ENV SERVICE_ACCOUNT_EMAIL="google-cloud-run-service-local@custom-helix-329116.iam.gserviceaccount.com"
ENV GOOGLE_APPLICATION_CREDENTIALS="/service_account_key/custom-helix-329116-fb3fb8908455.json"
ENV PROJECT_ID="custom-helix-329116"

# gcloud-specific configuration
RUN gcloud auth activate-service-account ${SERVICE_ACCOUNT_EMAIL} --project=${PROJECT_ID} --key-file=${GOOGLE_APPLICATION_CREDENTIALS}

# CMD gsutil rsync ${GCS_FILE_LOCATION}  data; timeout ${TIMEOUT}
CMD timeout ${TIMEOUT} cellxgene launch --host 0.0.0.0 ${GCS_FILE_LOCATION}

#TODO: use gsutil rsync to sync the annotated data with the google cloud storage. 