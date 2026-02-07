# Vercel Deploy

## Build Settings
- Framework: Vite
- Root Directory: client
- Build Command: npm run build
- Output Directory: dist

## Env Vars
Set these in Vercel:
- VITE_GOOGLE_MAPS_API_KEY
- VITE_GOOGLE_CLIENT_ID (if still used)

## Rewrites
Update /vercel.json with your Cloud Run URL.
