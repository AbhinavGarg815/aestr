# Unified Civic Issue Detection & Grievance Redressal Platform

## Overview
- Home page shows the complaint form.
- Sign up uses Google OAuth with role selection (user or contractor).
- Admin role is assigned manually in MongoDB.
- Complaint images are uploaded to Cloudinary.

## Setup

### Server
1. Create .env from the example:
   - Copy server/.env.example to server/.env and update values.
2. Install dependencies in server:
   - npm install
3. Start the API:
   - npm run dev

### Client
1. Install dependencies in client:
   - npm install
2. Start the app:
   - npm run dev

## Notes
- Google OAuth requires `GOOGLE_CLIENT_ID` on the server and `VITE_GOOGLE_CLIENT_ID` on the client.
- Contractors must provide a department category and service area on sign up.
- Assign admin role by updating the user `role` to `admin` in MongoDB.
- Cloudinary credentials are required for image uploads.
