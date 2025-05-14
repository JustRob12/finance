/**
 * Test script to verify port binding for Render deployment
 * Run this with: NODE_ENV=production PORT=10000 node test-render.js
 */

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Simple response handler
app.get('/', (req, res) => {
  res.send('Port binding test successful!');
});

// Critical for Render deployment: Use the correct binding format
console.log(`Attempting to listen on port ${PORT}`);
const server = app.listen(PORT, '0.0.0.0', () => {
  const address = server.address();
  console.log(`Server running on ${address.address}:${address.port}`);
  console.log('If you see this message, port binding is working correctly!');
});

// Handle errors
server.on('error', (error) => {
  console.error('Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Try a different port.`);
  }
}); 