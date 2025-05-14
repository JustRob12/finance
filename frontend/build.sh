#!/bin/bash

# Install dependencies with legacy-peer-deps flag
npm install --legacy-peer-deps

# Build the project
npm run build

# Copy vercel.json to dist
cp vercel.json dist/ 