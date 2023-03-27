FROM continuumio/miniconda3:latest

RUN apt-get -y update && \
apt-get -y install gcc && \
apt-get clean

ENV APP_HOME /app
WORKDIR $APP_HOME


COPY conda_environment.yml .
RUN conda env create -f conda_environment.yml

COPY . .

SHELL ["conda", "run", "-n", "myenv", "/bin/bash", "-c"]
ENV WORKERS 1
ENV THREADS 1
ENV PORT 8080
CMD exec gunicorn --bind :$PORT --workers $WORKERS --threads $THREADS --timeout 0 api:app
