FROM gcr.io/google.com/cloudsdktool/google-cloud-cli:latest

RUN apt-get update \
    && apt-get install sudo\
    && apt install curl\ 
    && curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -\
    && sudo apt install nodejs\
    && apt-get update

#ENV vars for GCloud
ENV SERVICE_ACCOUNT_EMAIL="google-cloud-run-service-local@custom-helix-329116.iam.gserviceaccount.com"
ENV GOOGLE_APPLICATION_CREDENTIALS="/service_account_key/custom-helix-329116-fb3fb8908455.json"
ENV PROJECT_ID="custom-helix-329116"
ENV CXG_IMAGE_LOCATION="eu.gcr.io/custom-helix-329116/cellxgene@sha256:721950437f85a91399ef96e17dad26d83089980b18e2bbfccf2ed674da75a889"
ENV REGION="europe-west3"
# The port that cellxgene will be running on
ENV CELLXGENE_PORT="5005"

#Cellxgene container timeout, set to one hour by default
ENV TIMEOUT=3600

COPY . . 

# gcloud-specific configuration
RUN gcloud auth activate-service-account ${SERVICE_ACCOUNT_EMAIL} --project=${PROJECT_ID} --key-file=${GOOGLE_APPLICATION_CREDENTIALS}

CMD node app.js



# The command to run inside the container:
# gcloud run deploy test-if-dockerfile --image=eu.gcr.io/custom-helix-329116/cellxgene@sha256:5221aed3dd4174f3869e11db6f3342e7913ce2261acff0062b32a87ae40c8d2c --region=europe-west3 --allow-unauthenticated --port=8080 --set-env-vars=GATEWAY_PORT=8080 --project custom-helix-329116

# to set the gcloud project to work in:
# gcloud config set project custom-helix-329116


