#!/bin/bash

# Print versions
echo "Node version: $(node -v)"
echo "npm version: $(npm -v)"

# Install dependencies
npm install

# Build the app
npm run build

echo "Build completed successfully" 