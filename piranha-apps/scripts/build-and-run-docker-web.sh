#!/bin/bash
set -ex

IMAGE_NAME=piranhaNET/piranha-web-dev

docker build -t $IMAGE_NAME .

docker run -d --name piranha-web \
  -p 5173:5173  \
  $IMAGE_NAME

