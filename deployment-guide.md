# Vercel Deployment Guide

## Using Vercel CLI

1. Login to Vercel:
```
vercel login
```

2. Deploy the project:
```
vercel
```

3. Follow the interactive prompts:
   - Set up and deploy: `y`
   - Which scope: Select your account
   - Link to existing project: `n`
   - Project name: Press Enter for default or type a custom name
   - Directory: Press Enter to use current directory
   - Override settings: `y`
   - Build Command: `npm run vercel-build`
   - Output Directory: `frontend/dist`
   - Development Command: Leave blank, press Enter

4. After deployment, you'll get a URL where your app is accessible.

5. Configure environment variables (required for the app to work):
```
vercel env add MONGO_URI
vercel env add JWT_SECRET
vercel env add PLAID_CLIENT_ID
vercel env add PLAID_SECRET
```

6. After adding all environment variables, redeploy:
```
vercel --prod
```

## Important Notes

- Remember to configure your MongoDB database to accept connections from Vercel's IP addresses
- Make sure you have a proper CORS configuration in your server code
- If you encounter any issues with API calls, check the Vercel logs and Functions tab

## Monitoring and Maintenance

- You can monitor your deployment in the Vercel dashboard
- Set up Vercel Analytics to track performance
- Enable Vercel's GitHub integration for automatic deployments on push 