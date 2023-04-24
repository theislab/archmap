FROM continuumio/miniconda3:latest

RUN apt-get -y update && \
    apt-get -y install gcc && \
    apt-get clean

ENV APP_HOME /app
WORKDIR $APP_HOME


COPY conda_environment.yml .
RUN conda env create -f conda_environment.yml

COPY . .

RUN echo "conda activate myenv" >> ~/.bashrc

SHELL ["/bin/bash", "--login", "-c"]

#Set the cran location
# Install the remotes package and use it to install seurat-disk
RUN R -e "if (!requireNamespace('remotes', quietly = TRUE)) install.packages('remotes', repos = 'http://cran.us.r-project.org')" \
    && R -e "remotes::install_github('mojaveazure/seurat-disk')"


ENV WORKERS 1
ENV THREADS 1
ENV PORT 8080
CMD exec gunicorn --bind :$PORT --workers $WORKERS --threads $THREADS --timeout 0 api:app
