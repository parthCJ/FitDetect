# FitDetect Deployment Guide

This guide covers deploying FitDetect to production environments.

## 🌐 Deployment Architecture

- **Frontend**: Vercel
- **Backend**: Render or Railway
- **Database**: MongoDB Atlas
- **Domain**: fitdetect.site

## 📋 Pre-Deployment Checklist

### Backend
- [ ] Set up MongoDB Atlas cluster
- [ ] Configure Google OAuth credentials
- [ ] Set environment variables
- [ ] Test API endpoints locally
- [ ] Configure CORS settings

### Frontend
- [ ] Update API URLs to production
- [ ] Configure OAuth redirect URIs
- [ ] Test build locally
- [ ] Optimize images and assets
- [ ] Set up environment variables

## 🗄️ MongoDB Atlas Setup

1. Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster (Free tier available)
3. Create a database user with password
4. Whitelist IP addresses (0.0.0.0/0 for development, specific IPs for production)
5. Get connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/fitdetect?retryWrites=true&w=majority
   ```

## 🔐 Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - Local: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://fitdetect.site/api/auth/callback/google`
6. Copy Client ID and Client Secret

## 🚀 Backend Deployment (Render)

### Step 1: Prepare Backend

Create `render.yaml` in root:
```yaml
services:
  - type: web
    name: fitdetect-backend
    env: python
    buildCommand: "pip install -r backend/requirements.txt"
    startCommand: "uvicorn app.main:app --host 0.0.0.0 --port $PORT"
    envVars:
      - key: MONGODB_URI
        sync: false
      - key: GOOGLE_CLIENT_ID
        sync: false
      - key: GOOGLE_CLIENT_SECRET
        sync: false
      - key: SECRET_KEY
        generateValue: true
      - key: PYTHON_VERSION
        value: 3.9.16
```

### Step 2: Deploy to Render

1. Push code to GitHub
2. Sign up at [Render](https://render.com/)
3. Create new Web Service
4. Connect GitHub repository
5. Configure:
   - **Build Command**: `cd backend && pip install -r requirements.txt`
   - **Start Command**: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add environment variables
7. Click "Create Web Service"

### Environment Variables (Render)
```
MONGODB_URI=<your-mongodb-uri>
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
SECRET_KEY=<random-secret-key>
FRONTEND_URL=https://fitdetect.site
```

## 🎨 Frontend Deployment (Vercel)

### Step 1: Prepare Frontend

Ensure `next.config.js` has:
```javascript
module.exports = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
}
```

### Step 2: Deploy to Vercel

1. Sign up at [Vercel](https://vercel.com/)
2. Install Vercel CLI: `npm i -g vercel`
3. From frontend directory: `vercel`
4. Follow prompts to deploy

Or use Vercel Dashboard:
1. Import GitHub repository
2. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: frontend
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
3. Add environment variables
4. Click "Deploy"

### Environment Variables (Vercel)
```
NEXT_PUBLIC_API_URL=https://fitdetect-backend.onrender.com
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<your-google-client-id>
NEXTAUTH_SECRET=<random-secret>
NEXTAUTH_URL=https://fitdetect.site
```

## 🔧 Post-Deployment Configuration

### Update CORS Settings

In `backend/app/main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://fitdetect.site",
        "https://www.fitdetect.site"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Update OAuth Redirect URIs

Add production URLs to Google Cloud Console:
- `https://fitdetect.site/api/auth/callback/google`
- `https://www.fitdetect.site/api/auth/callback/google`

## 🌍 Domain Configuration

### Configure Custom Domain (Vercel)

1. Go to Vercel project settings
2. Navigate to "Domains"
3. Add `fitdetect.site` and `www.fitdetect.site`
4. Update DNS records at your domain registrar:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

## 🧪 Testing Production Deployment

1. Test OAuth login flow
2. Test webcam access (requires HTTPS)
3. Test exercise detection
4. Verify MongoDB connections
5. Check API response times
6. Test on multiple devices/browsers

## 📊 Monitoring & Logging

### Render
- View logs in Render dashboard
- Set up health checks

### Vercel
- Analytics available in dashboard
- Real-time function logs

### MongoDB Atlas
- Monitor database performance
- Set up alerts for connection issues

## 🔄 CI/CD Pipeline

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy FitDetect

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Render
        run: echo "Render auto-deploys on push"

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        run: echo "Vercel auto-deploys on push"
```

## 🚨 Troubleshooting

### Webcam Not Working
- Ensure site is served over HTTPS
- Check browser permissions
- Verify camera access in browser settings

### OAuth Errors
- Verify redirect URIs match exactly
- Check client ID and secret
- Ensure cookies are enabled

### MongoDB Connection Issues
- Verify connection string
- Check IP whitelist settings
- Confirm database user permissions

### API Errors
- Check CORS configuration
- Verify environment variables
- Review backend logs

## 📈 Performance Optimization

1. **Backend**:
   - Enable response caching
   - Optimize Mediapipe models
   - Use frame skipping for detection

2. **Frontend**:
   - Implement code splitting
   - Optimize images with Next.js Image
   - Enable static site generation where possible

3. **Database**:
   - Create indexes on frequently queried fields
   - Implement connection pooling

## 🔐 Security Checklist

- [ ] Use HTTPS everywhere
- [ ] Secure environment variables
- [ ] Implement rate limiting
- [ ] Sanitize user inputs
- [ ] Regular dependency updates
- [ ] Enable MongoDB authentication
- [ ] Use secure session management

## 📞 Support

For deployment issues:
- Check logs in Render/Vercel dashboards
- Review MongoDB Atlas metrics
- Contact support@fitdetect.site

---

Last updated: October 16, 2025
