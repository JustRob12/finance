# Finance App Server

This is the backend server for the Finance application.

## Setup

1. Install dependencies:
```
cd server
npm install
```

2. Make sure the .env file is set up correctly with:
```
PORT=5000
MONGO_URI=mongodb+srv://robertoprisoris12:OLneh0TjFNm0Ht8e@cluster0.h3vbul4.mongodb.net/finance
JWT_SECRET=jwtSecretKey
```

3. Start the server:
```
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user

### Dashboard
- `GET /api/dashboard` - Get user dashboard data (protected route)

## Authentication

For protected routes, include the token in the request header:
```
x-auth-token: YOUR_JWT_TOKEN
``` 