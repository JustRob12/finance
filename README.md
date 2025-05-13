# Finance Tracker Application

A full-stack finance management application built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

- **User Authentication**
  - JWT-based authentication
  - Google OAuth integration using Firebase
  - Secure password handling

- **Wallet Management**
  - Create and manage multiple wallets
  - Track wallet balances
  - View wallet statistics

- **Transaction Tracking**
  - Record income and expenses
  - Automatic balance updates
  - Transaction history and filtering

- **Responsive Design**
  - Mobile and desktop friendly interface
  - Clean blue and white color scheme

## Architecture

### Backend

- **Models**:
  - User: Email & password authentication
  - GoogleUser: Store Google account information
  - Wallet: Manage user wallets
  - Transaction: Track financial transactions

- **API Endpoints**:
  - Authentication: `/api/auth/*`
  - Wallet operations: `/api/wallets/*`
  - Transaction management: `/api/transactions/*`

### Frontend

- React with TypeScript
- Component-based architecture
- JWT handling for authentication
- Firebase integration for Google Sign-In

## Getting Started

### Prerequisites

- Node.js
- MongoDB
- Firebase project (for Google authentication)

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   cd backend && npm install
   cd frontend && npm install
   ```
3. Set up environment variables:
   - Create `.env` files in both frontend and backend directories
   - Configure MongoDB connection string, JWT secret, and Firebase credentials

4. Start the application:
   ```
   # Start backend
   cd backend && npm start
   
   # Start frontend
   cd frontend && npm start
   ```

## Technologies Used

- **Backend**: Node.js, Express, MongoDB, Mongoose, JWT
- **Frontend**: React, TypeScript, React Router, Axios
- **Authentication**: JWT, Firebase Authentication
- **Styling**: CSS, Responsive Design