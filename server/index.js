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

// Enhanced CORS for Vercel frontend and Render backend
const corsOptions = {
  origin: ['https://finance-pink.vercel.app', 'https://finance-72ra.vercel.app', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
  credentials: true
};

// Middleware
app.use(express.json());
app.use(cors(corsOptions));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
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

// Simple welcome message for the API
app.get('/', (req, res) => {
  res.json({
    message: 'Finance API is running',
    documentation: 'API available at /api routes',
    frontendUrl: 'https://finance-72ra.vercel.app'
  });
});

// Log the port we're using
console.log(`Starting server on port ${PORT}`);

// Bind to all interfaces (0.0.0.0) for Render
const server = app.listen(PORT, '0.0.0.0', () => {
  const address = server.address();
  console.log(`Server running on ${address.address}:${address.port}`);
});

module.exports = app; 