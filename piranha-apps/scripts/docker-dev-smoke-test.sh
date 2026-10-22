#!/bin/bash
set -ex

URL=http://localhost:5137/about
SEARCH_STRING="About PiranhaNET"

if curl -s "$URL" | grep -q "$SEARCH_STRING"; then
    echo "$SEARCH_STRING found at $URL"
    exit 0
else
    echo "Error: $SEARCH_STRING not found at $URL"
    exit 1
fi
