# PWA Icons Instructions

This folder should contain icon files for your Progressive Web App.

## Required Icon Sizes

You need the following icon sizes for a complete PWA experience:

- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

## How to Generate Icons

1. Start with a high-resolution square logo (at least 512x512 pixels)
2. Use a tool like [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator) to create all the required sizes
3. Place all the generated icons in the `public/icons` directory

Example command:
```bash
npx pwa-asset-generator logo.png icons/
```

## Testing Icons

Until you generate proper icons, the PWA will still work but may not have the optimal visual experience on all devices. Make sure to generate proper icons before deploying to production. 