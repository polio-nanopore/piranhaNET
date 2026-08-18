#!/bin/bash
set -ex

PIRANHA_IMAGE="polionanopore/piranha"
PIRANHA_VERSION=$(jq -r '.piranhaVersion' package.json)
PIRANHA_TAG="$PIRANHA_IMAGE:$PIRANHA_VERSION"
TARGET_DIR="./installer-resources"
TARGET_FILE="$TARGET_DIR/piranha-docker-image.tar"

echo "Making target dir if required"
mkdir -p "$TARGET_DIR"
echo "Pulling image"
docker pull --platform linux/amd64 $PIRANHA_TAG

echo "TESTING docker info
docker image inspect $PIRANHA_TAG

echo "Saving image"
docker save $PIRANHA_TAG -o $TARGET_FILE

echo "Successfully saved image to $TARGET_FILE"
