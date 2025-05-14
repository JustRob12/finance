# Vercel Deployment Troubleshooting

If your deployment fails on Vercel, try these steps:

## Manual Deployment Steps

1. In your Vercel dashboard, go to Project Settings.

2. Update these settings:
   - **Framework Preset**: Other
   - **Build Command**: npm run build
   - **Output Directory**: dist
   - **Install Command**: npm install

3. Set Environment Variables:
   - Add `VITE_API_URL` with value `https://finance-fndz.onrender.com`

4. Under Git settings, disable "Include source files outside of the Root Directory"

5. Override the default vercel.json by using a simpler config:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

6. Redeploy with these settings.

## Troubleshooting Steps

If you're still having issues:

1. Check the build logs in Vercel for specific errors
2. Try deploying with the Vercel CLI
3. Remove any unused dependencies
4. Make sure all imports in your code are valid
5. If TypeScript errors occur, try disabling TypeScript for build (remove the `tsc -b &&` part from build command)

## Common Fixes

- **404 errors on routes**: Make sure the rewrite rule is working
- **API connection issues**: Check your CORS settings in both frontend and backend
- **Build failures**: Try downgrading any very recent dependencies like React 19 