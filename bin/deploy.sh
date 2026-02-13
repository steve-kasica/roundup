#!/bin/bash

# Deploy script - rsync build directory to remote server

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

REMOTE_USER="kasica"
REMOTE_HOST="remote.cs.ubc.ca"
REMOTE_PATH="~/public_html/roundup"
LOCAL_BUILD_DIR="build/"

echo -e "${YELLOW}Syncing build directory to ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}${NC}"

rsync -avz --delete \
  --exclude '.DS_Store' \
  "$LOCAL_BUILD_DIR" \
  "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}"

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Deployment successful!${NC}"
else
  echo "✗ Deployment failed"
  exit 1
fi
