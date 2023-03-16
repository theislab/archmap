FROM gcr.io/google.com/cloudsdktool/google-cloud-cli:slim

RUN apt-get update \
    && apt-get install sudo\
    && apt-get install curl\ 
    && curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -\
    && sudo apt-get install -y nodejs

#ENV vars for GCloud
ENV SERVICE_ACCOUNT_EMAIL="cellxgene@custom-helix-329116.iam.gserviceaccount.com"
ENV GOOGLE_APPLICATION_CREDENTIALS="/service_account_key/custom-helix-329116-9428b8c55b7f.json"
ENV PROJECT_ID="custom-helix-329116"
ENV CXG_IMAGE_LOCATION="eu.gcr.io/custom-helix-329116/cellxgene:latest"
ENV REGION="europe-west3"
# For faster cold starts, use the first version of cloud run. 
ENV PLATFORM="managed"
# The port that cellxgene will be running on
ENV CELLXGENE_PORT="5005"

#Cellxgene container timeout, set to one hour by default
ENV TIMEOUT=3600

COPY . .
RUN npm install

# gcloud-specific configuration
RUN gcloud auth activate-service-account ${SERVICE_ACCOUNT_EMAIL} --project=${PROJECT_ID} --key-file=${GOOGLE_APPLICATION_CREDENTIALS}

CMD node app.js





# The command to run inside the container:
# gcloud run deploy test-if-dockerfile --image=eu.gcr.io/custom-helix-329116/cellxgene@sha256:5221aed3dd4174f3869e11db6f3342e7913ce2261acff0062b32a87ae40c8d2c --region=europe-west3 --allow-unauthenticated --port=8080 --set-env-vars=GATEWAY_PORT=8080 --project custom-helix-329116

# to set the gcloud project to work in:
# gcloud config set project custom-helix-329116


