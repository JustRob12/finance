# Finance App - Vercel Deployment Guide

This guide will help you fix 404 errors and deploy your frontend correctly on Vercel.

## 1. Environment Variables

Add these environment variables in your Vercel project settings:

```
VITE_API_URL=https://finance-fndz.onrender.com
```

## 2. Build Settings

In your Vercel project settings, make sure:
- Framework Preset: Vite
- Build Command: npm run build
- Output Directory: dist
- Install Command: npm install

## 3. Troubleshooting 404 Errors

If you still see 404 errors:

1. **Check Vercel's build logs** to make sure the build completed successfully

2. **Redeploy with the Override option**:
   - Go to your Vercel project
   - Click on "Deployments"
   - Select the latest deployment
   - Click "..." (three dots) and choose "Redeploy"
   - Check "Override existing build settings"
   - Make sure all settings match what's described above

3. **Try manual deployment using Vercel CLI**:
   ```
   npm install -g vercel
   cd frontend
   vercel --prod
   ```
   
   Follow the prompts, and when asked about build settings, use:
   - Build Command: npm run build
   - Output Directory: dist
   - Development Command: npm run dev

## 4. Check API Connectivity

To verify your frontend can connect to the backend:

1. Open your Vercel URL in the browser
2. Open the browser's Developer Tools (F12)
3. Go to the Network tab
4. Try to login or interact with the app
5. Look for API requests to https://finance-fndz.onrender.com
6. Check for any CORS or connection errors

## 5. Common Issues & Solutions

### CORS Issues
If you see CORS errors, check:
- The Render backend has the correct CORS configuration for your Vercel domain
- The Render service is running (check status at https://dashboard.render.com)

### SPA Routing Issues
If routes like /login or /dashboard show 404:
- Vercel might not be handling SPA routes correctly
- Make sure your `vercel.json` has the correct "rewrites" configuration

### Authentication Issues
If you can't log in:
- Check if the token is being stored correctly
- Verify the API is responding correctly
- Look for errors in the browser console 