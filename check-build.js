/**
 * Simple script to check if the frontend build is in the correct location
 * Run with: node check-build.js
 */

const fs = require('fs');
const path = require('path');

// Paths to check
const distPath = path.join(__dirname, 'frontend/dist');
const indexPath = path.join(distPath, 'index.html');

console.log('Checking frontend build...');
console.log('Current directory:', __dirname);
console.log('Frontend dist path:', distPath);

// Check if dist directory exists
if (fs.existsSync(distPath)) {
  console.log('✅ Frontend dist directory exists');
  
  // Check for index.html
  if (fs.existsSync(indexPath)) {
    console.log('✅ index.html found');
    
    // List files in dist directory
    const files = fs.readdirSync(distPath);
    console.log('Files in dist directory:', files);
    
    // Check for assets directory
    const assetsPath = path.join(distPath, 'assets');
    if (fs.existsSync(assetsPath)) {
      console.log('✅ assets directory found');
      
      // List files in assets directory
      const assetFiles = fs.readdirSync(assetsPath);
      console.log('Files in assets directory:', assetFiles);
    } else {
      console.log('❌ assets directory NOT found');
    }
  } else {
    console.log('❌ index.html NOT found');
  }
} else {
  console.log('❌ Frontend dist directory NOT found');
}

// Check server/index.js to verify static serving code
const serverPath = path.join(__dirname, 'server/index.js');
if (fs.existsSync(serverPath)) {
  console.log('✅ server/index.js exists');
  
  // Read and verify the code contains static file serving
  const serverCode = fs.readFileSync(serverPath, 'utf8');
  if (serverCode.includes('express.static') && serverCode.includes('../frontend/dist')) {
    console.log('✅ Server is configured to serve static files');
  } else {
    console.log('❌ Server might not be properly configured to serve static files');
  }
} else {
  console.log('❌ server/index.js NOT found');
} 