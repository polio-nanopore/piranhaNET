#!/bin/bash
set -ex

IMAGE_NAME=piranhanet-web-dev

docker build -t $IMAGE_NAME .

docker run -d --name piranhanet-web \
  -p 5173:5173  \
  $IMAGE_NAME

