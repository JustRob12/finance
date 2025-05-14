# Finance Application

A full-stack financial tracking application with wallet management and transaction tracking.

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

## Build and Deploy Guide

### Prerequisites
- Node.js (v14 or higher)
- npm
- MongoDB account
- Vercel account
- Firebase account (for Google Sign-In)

### Local Development

1. Clone the repository:
```
git clone https://github.com/JustRob12/finance.git
cd finance
```

2. Install server dependencies:
```
npm install
```

3. Install frontend dependencies:
```
cd frontend
npm install
cd ..
```

4. Create a `.env` file in the root directory based on the `env.example` file:
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
NODE_ENV=development
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_secret
PLAID_ENV=sandbox
```

5. Run the development server:
```
cd frontend
npm run dev
```

6. In a separate terminal, start the backend:
```
npm start
```

### Building for Production

1. Build the frontend application:
```
cd frontend
npm run build
```
This will compile TypeScript and bundle the React app into the `dist` folder.

2. Test the production build locally:
```
npm run preview
```

### Deploying to Vercel

1. Install Vercel CLI:
```
npm install -g vercel
```

2. Login to Vercel:
```
vercel login
```

3. Deploy the project:
```
vercel
```

4. Follow the interactive prompts:
   - Set up and deploy: `y`
   - Which scope: Select your account
   - Link to existing project: `n`
   - Project name: Press Enter for default or type a custom name
   - Directory: Press Enter to use current directory
   - Override settings: `y`
   - Build Command: `npm run vercel-build`
   - Output Directory: `frontend/dist`
   - Development Command: Leave blank, press Enter

5. Configure environment variables:
```
vercel env add MONGO_URI
vercel env add JWT_SECRET
vercel env add PLAID_CLIENT_ID
vercel env add PLAID_SECRET
```

6. After adding all environment variables, deploy to production:
```
vercel --prod
```

## Project Structure

- `/server` - Backend Node.js server with Express and MongoDB
- `/frontend` - React+TypeScript frontend application
- `vercel.json` - Vercel deployment configuration

## Technologies Used

- **Backend**: Node.js, Express, MongoDB, Mongoose, JWT
- **Frontend**: React, TypeScript, React Router, Axios
- **Authentication**: JWT, Firebase Authentication
- **Styling**: CSS, Responsive Design

## Render Deployment

### Port Binding for Render

Render requires your application to bind to the port provided by Render via the `PORT` environment variable. The correct binding format is:

```javascript
const server = app.listen(PORT, '0.0.0.0', () => {
  const address = server.address();
  console.log(`Server running on ${address.address}:${address.port}`);
});
```

If you see errors about "No open ports detected" in your Render logs, make sure:

1. You're binding to `0.0.0.0` (not localhost or 127.0.0.1)
2. You're using the port from the `PORT` environment variable
3. Your server is actually starting without errors

You can test port binding locally with:

```
PORT=10000 NODE_ENV=production node test-render.js
```

### Deployment Steps

1. Push all changes to your GitHub repository
2. In Render dashboard, create a new Web Service
3. Connect to your GitHub repository
4. Set Build Command: `npm install && npm run build`
5. Set Start Command: `npm start`
6. Add all required environment variables
7. Deploy