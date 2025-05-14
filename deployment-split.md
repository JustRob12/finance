# Split Deployment Guide: Vercel (Frontend) + Render (Backend)

This guide will help you set up your project with the frontend on Vercel and the backend on Render.

## Backend Deployment (Render)

1. Push your code to GitHub

2. Go to Render dashboard: https://dashboard.render.com/

3. Create a new Web Service:
   - Connect your GitHub repository
   - Select the branch to deploy
   - Give your service a name (e.g., `finance-api`)
   
4. Configure the build:
   - Build Command: `npm install`
   - Start Command: `npm start`

5. Add environment variables:
   ```
   NODE_ENV=production
   MONGO_URI=mongodb+srv://robertoprisoris12:OLneh0TjFNm0Ht8e@cluster0.h3vbul4.mongodb.net/finance
   JWT_SECRET=jwtSecretKey
   PLAID_CLIENT_ID=6822e1fce7c0ba00230a1447
   PLAID_SECRET=ee659abfc85b20ea6bf0c9595e4486
   PLAID_ENV=sandbox
   ```

6. Deploy the service
   - After deployment, note the URL (e.g., https://finance-fndz.onrender.com)

## Frontend Deployment (Vercel)

1. Make sure your frontend is updated to use the API client:
   - This allows you to use the Render backend URL in production
   - In development, API requests will be proxied to localhost

2. Create a `.env` file in your `frontend` directory:
   ```
   VITE_API_URL=https://finance-fndz.onrender.com
   ```

3. Go to Vercel dashboard: https://vercel.com/dashboard

4. Import your GitHub repository:
   - Connect to GitHub if not already connected
   - Select the repository

5. Configure the project:
   - Framework Preset: `Vite`
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

6. Add environment variable:
   - Add VITE_API_URL with value: https://finance-fndz.onrender.com

7. Deploy the project

## Testing the Split Deployment

1. Open your Vercel frontend URL (e.g., https://finance-pink.vercel.app)
2. Ensure you can log in and use the application
3. Check browser console for any CORS or API connection errors

## Notes

1. CORS is configured on both sides:
   - Backend allows requests from the Vercel frontend
   - Frontend includes CORS headers in its Vercel configuration

2. API URLs:
   - API client handles the correct URL based on environment
   - In development, Vite proxies API requests to localhost
   - In production, API requests go to the Render backend URL 