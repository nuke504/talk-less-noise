#!/bin/bash
# Load environment variables
source .env.prod

# Build Docker image with build arguments
docker build \
  -f Dockerfile.local \
  --build-arg REACT_APP_API_ADDRESS="$REACT_APP_API_ADDRESS" \
  --build-arg REACT_APP_NAME="$REACT_APP_NAME" \
  --build-arg REACT_APP_APPINSIGHTS_CONNECTION_STRING="$REACT_APP_APPINSIGHTS_CONNECTION_STRING" \
  -t talk-less-noise-frontend:local .