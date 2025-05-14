const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const walletRoutes = require('./routes/wallet');
const transactionRoutes = require('./routes/transaction');
const plaidRoutes = require('./routes/plaid');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enhanced CORS configuration for deployment
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [/\.render\.com$/, /localhost:\d+$/]  // Allow Render domains and localhost
    : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
  credentials: true
};

// Middleware
app.use(express.json());
app.use(cors(corsOptions));

// Connect to MongoDB with additional options
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000,  // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000,          // Close sockets after 45s of inactivity
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// API health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', environment: process.env.NODE_ENV });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/transaction', transactionRoutes);
app.use('/api/plaid', plaidRoutes);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  // Any routes that don't match the API routes will serve the React app
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/dist/index.html'));
  });
} else {
  // Main API info endpoint for development
  app.get('/', (req, res) => {
    res.send('Financial Tracker API is running');
  });
}

// Critical for Render deployment: Log the port we're trying to use
console.log(`Attempting to listen on port ${PORT}`);

// Start the server - IMPORTANT: Render requires this exact port binding format
const server = app.listen(PORT, '0.0.0.0', () => {
  const address = server.address();
  console.log(`Server running on ${address.address}:${address.port}`);
});

// Export app for potential serverless use
module.exports = app; 