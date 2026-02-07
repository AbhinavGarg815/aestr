# Cloud Run Deploy (From GitHub Source)

## One-Time Manual Deploy (Source-Based)
From the server folder:
- gcloud run deploy wallofshame-api \
   --source . \
   --platform managed \
   --region YOUR_REGION \
   --allow-unauthenticated \
   --set-env-vars PORT=8080

## GitHub Auto-Deploy (Cloud Build Trigger)
Create a Cloud Build trigger that deploys from your GitHub repo:
1) In Google Cloud Console, go to Cloud Build -> Triggers.
2) Connect your GitHub repo and select the branch.
3) Use the following build config (inline or cloudbuild.yaml):

steps:
- name: gcr.io/google.com/cloudsdktool/cloud-sdk
   entrypoint: gcloud
   args:
      - run
      - deploy
      - wallofshame-api
      - --source
      - server
      - --platform
      - managed
      - --region
      - YOUR_REGION
      - --allow-unauthenticated
      - --set-env-vars
      - PORT=8080

substitutions:
   _REGION: YOUR_REGION

## Required Env Vars
Set these in Cloud Run:
- MONGO_URI
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET
- CLOUDINARY_COMPLAINTS_FOLDER (optional)
- ANALYZE_BASE_URL
- CLIENT_ORIGIN (your Vercel URL)
- GOOGLE_CLIENT_ID (if still used)
