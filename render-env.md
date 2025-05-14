# Environment Variables for Render Deployment

Copy and paste these environment variables into your Render dashboard:

```
# MongoDB Connection String
MONGO_URI=mongodb+srv://robertoprisoris12:OLneh0TjFNm0Ht8e@cluster0.h3vbul4.mongodb.net/finance

# JWT Secret for Authentication
JWT_SECRET=jwtSecretKey

# Port for the Server
PORT=10000

# Node Environment
NODE_ENV=production

# Plaid API Credentials
PLAID_CLIENT_ID=6822e1fce7c0ba00230a1447
PLAID_SECRET=ee659abfc85b20ea6bf0c9595e4486
PLAID_ENV=sandbox

# Firebase Configuration
FIREBASE_API_KEY=AIzaSyDrrzYmb7jgRpzfEWT9edYAy5kDWWiZu6Q
FIREBASE_AUTH_DOMAIN=oauth-4df77.firebaseapp.com
FIREBASE_PROJECT_ID=oauth-4df77
FIREBASE_STORAGE_BUCKET=oauth-4df77.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=917950144788
FIREBASE_APP_ID=1:917950144788:web:5db363233fcbcaf4656201
FIREBASE_MEASUREMENT_ID=G-EHGM3TPBD1
```

## Render Deployment Steps

### Option 1: Using the Render Dashboard

1. Create a new Web Service
2. Connect your GitHub repository
3. Configure the build:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
4. Add all the environment variables above in the "Environment" section
5. Deploy your application

### Option 2: Using render.yaml (Recommended)

1. We've created a `render.yaml` file that configures your deployment
2. Push this file to your GitHub repository
3. In the Render dashboard, click "New" and select "Blueprint"
4. Connect to your GitHub repository
5. Render will automatically detect the render.yaml configuration
6. Add the secret environment variables when prompted
7. Complete the deployment

## Important Notes

- The server has been updated to serve the frontend static files in production mode
- Make sure MongoDB accepts connections from Render's IP addresses
- Your application is already deployed at: https://finance-fndz.onrender.com
- All API requests from the frontend to `/api/` routes will work correctly
- You may need to wait a few minutes after deployment for changes to take effect

## Troubleshooting

If your application doesn't work after deployment:
1. Check the Render logs for any errors
2. Verify all environment variables are set correctly
3. Make sure your MongoDB database is accessible from Render
4. Check browser console for frontend errors 