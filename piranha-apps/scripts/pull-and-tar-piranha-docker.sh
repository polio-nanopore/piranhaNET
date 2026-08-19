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

echo "TESTING docker inspect"
docker image inspect $PIRANHA_TAG

echo "Saving image"
docker save $PIRANHA_TAG -o $TARGET_FILE

echo "Zipping image. Note that this step is not required when running on a machine whose docker engine"
echo "compresses on save - this is not the case on the GHA agents. Check your docker Storage Driver "
echo "(with 'docker info'). overlayfs compresses, overlay2 does not. If you do remove this step, e.g. "
echo "for local installer build, remember to update the File reference in the installer scripts (e.g."
echo "electron-installer-win.nsh) to the original .tar file, not .tar.gz"
gzip $TARGET_FILE

echo "Successfully saved image to $TARGET_FILE.gz"
