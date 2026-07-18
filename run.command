#!/bin/bash
cd "$(dirname "$0")" || exit 1

if [ ! -d node_modules ]; then
  echo "Installing dependencies..."
  npm install || exit 1
fi

npm run start-local
