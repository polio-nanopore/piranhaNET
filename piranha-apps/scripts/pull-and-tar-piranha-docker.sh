#!/bin/bash
set -ex

STORAGE_DRIVER=$(docker info | grep -i "storage driver" | cut -d: -f2 | xargs)
if [ "$STORAGE_DRIVER" != "overlay2" ]; then
  echo "ERROR: Expected storage driver 'overlay2' but found '$STORAGE_DRIVER'"
  echo "This script assumes overlay2, and performs an additional gzip step on saved docker image because overlay2 saves without compression."
  echo "If you run this script with another storage driver which does perform compression, the gzip step will be unnecessary and the installer may fail."
  echo "Overlay2 is the storage driver used by the github action agent for windows-latest. If this changes, please update these scripts accordingly."
  exit 1
fi

PIRANHA_IMAGE="polionanopore/piranha"
PIRANHA_VERSION=$(jq -r '.piranhaVersion' package.json)
PIRANHA_TAG="$PIRANHA_IMAGE:$PIRANHA_VERSION"
TARGET_DIR="./installer-resources"
TARGET_FILE="$TARGET_DIR/piranha-docker-image.tar"

echo "Making target dir if required"
mkdir -p "$TARGET_DIR"
echo "Pulling image"
docker pull --platform linux/amd64 $PIRANHA_TAG

echo "Saving image"
docker save $PIRANHA_TAG -o $TARGET_FILE

echo "Zipping image."
gzip $TARGET_FILE

echo "Successfully saved image to $TARGET_FILE.gz"
