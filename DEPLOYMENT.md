# 🚀 Complete FitDetect Deployment Guide

Deploy your full-stack fitness tracking application to production!

## 📋 Overview

This guide covers deploying:
- **Frontend** → Vercel (Next.js)
- **Backend** → Railway (FastAPI)
- **Database** → MongoDB Atlas (Cloud)

## � Deployment Order

**IMPORTANT**: Follow this exact sequence:

```
1️⃣ MongoDB Atlas (Database)
    ↓
2️⃣ Railway (Backend API)
    ↓
3️⃣ Vercel (Frontend)
    ↓
4️⃣ Update Cross-References
    ↓
5️⃣ Configure OAuth
```

## 📚 Detailed Deployment Guides

### **📖 [Railway Backend Deployment](./RAILWAY_DEPLOYMENT.md)**
Complete guide for deploying FastAPI backend to Railway with:
- MongoDB connection setup
- Environment variables configuration
- Google OAuth integration
- CORS configuration
- Monitoring and troubleshooting

### **📖 [Vercel Frontend Deployment](./VERCEL_DEPLOYMENT.md)**
Complete guide for deploying Next.js frontend to Vercel with:
- NextAuth configuration
- API URL setup
- OAuth callback configuration
- Build optimization
- Custom domain setup

## ✅ Quick Deployment Checklist

### **Phase 1: MongoDB Atlas**
- [ ] Create MongoDB Atlas account
- [ ] Create M0 FREE cluster
- [ ] Create database user with strong password
- [ ] Configure Network Access (0.0.0.0/0)
- [ ] Get connection string
- [ ] Test connection locally

### **Phase 2: Railway Backend**
- [ ] Connect GitHub repository to Railway
- [ ] Set root directory to `backend`
- [ ] Add all environment variables
- [ ] Generate and set `SECRET_KEY`
- [ ] Wait for successful deployment
- [ ] Generate public domain
- [ ] Test `/docs` endpoint
- [ ] Verify MongoDB connection in logs

### **Phase 3: Vercel Frontend**
- [ ] Connect GitHub repository to Vercel
- [ ] Set root directory to `frontend`
- [ ] Add all environment variables
- [ ] Generate and set `NEXTAUTH_SECRET`
- [ ] Wait for successful deployment
- [ ] Get production domain
- [ ] Test homepage loads

### **Phase 4: Cross-Reference Updates**
- [ ] Update Railway `FRONTEND_URL` with Vercel URL
- [ ] Update Vercel `NEXT_PUBLIC_API_URL` with Railway URL
- [ ] Update Vercel `NEXTAUTH_URL` with production domain
- [ ] Redeploy both services

### **Phase 5: OAuth Configuration**
- [ ] Add Vercel domain to Google OAuth authorized origins
- [ ] Add callback URL to authorized redirect URIs
- [ ] Save Google Cloud Console changes
- [ ] Test Google Sign-In

### **Phase 6: Testing**
- [ ] Visit production frontend URL
- [ ] Click "Sign in with Google"
- [ ] Complete OAuth flow
- [ ] Verify redirect to dashboard
- [ ] Create a test exercise session
- [ ] Set a test goal
- [ ] Check goal calendar
- [ ] Verify data persists after refresh

## 🔑 Environment Variables Quick Reference

### **Railway (Backend)**:
```bash
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/fitdetect?retryWrites=true&w=majority
DATABASE_NAME=fitdetect
GOOGLE_CLIENT_ID=123-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx
SECRET_KEY=your-generated-secret-key-min-32-characters
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
FRONTEND_URL=https://your-app.vercel.app
ENVIRONMENT=production
```

### **Vercel (Frontend)**:
```bash
NEXT_PUBLIC_API_URL=https://fitdetect-backend.up.railway.app
NEXT_PUBLIC_GOOGLE_CLIENT_ID=123-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx
NEXTAUTH_SECRET=your-generated-secret-min-32-characters
NEXTAUTH_URL=https://your-app.vercel.app
```

### **Generate Secrets**:
```bash
# Windows PowerShell or Command Prompt
openssl rand -base64 32

# Or use Python
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

## 🗄️ MongoDB Atlas Setup

1. Create MongoDB Atlas account: https://www.mongodb.com/cloud/atlas
2. Create M0 FREE cluster (512MB storage)
3. Create database user: `fitdetect-admin` with strong password
4. Configure Network Access: Allow `0.0.0.0/0` (all IPs for Railway/Vercel)
5. Get connection string:
   ```
   mongodb+srv://fitdetect-admin:password@cluster.mongodb.net/fitdetect?retryWrites=true&w=majority
   ```
6. Test connection locally before deployment

**Time**: ~10 minutes | **Cost**: FREE ✅

## 🔐 Google OAuth Setup - IMPORTANT

After deploying to Vercel, update your Google Cloud Console:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to "APIs & Services" → "Credentials"
4. Click on your OAuth 2.0 Client ID
5. Add to **Authorized JavaScript origins**:
   ```
   https://your-app.vercel.app
   https://your-backend.up.railway.app
   ```
6. Add to **Authorized redirect URIs**:
   ```
   https://your-app.vercel.app/api/auth/callback/google
   ```
7. Click "Save"

## 🚨 Common Issues & Solutions

### **Issue: "Failed to fetch" in frontend**

**Solutions**:
1. Check `NEXT_PUBLIC_API_URL` is set correctly in Vercel
2. Verify Railway backend is running (check logs)
3. Test Railway URL directly: `https://your-backend.up.railway.app/docs`
4. Check Railway `FRONTEND_URL` allows your Vercel domain (CORS)

### **Issue: "MongoDB connection failed"**

**Solutions**:
1. Verify `MONGODB_URI` format is correct
2. Check password has no special characters (or URL encode them)
3. Verify MongoDB Atlas Network Access allows `0.0.0.0/0`
4. Check database user exists with correct permissions

### **Issue: Google OAuth redirect fails**

**Solutions**:
1. Check Google Cloud Console authorized redirect URIs
2. Verify `NEXTAUTH_URL` in Vercel matches your domain
3. Check `GOOGLE_CLIENT_ID` matches in both frontend and backend
4. Clear browser cookies and try again

### **Issue: "Unauthorized" (401) errors**

**Solutions**:
1. Check JWT `SECRET_KEY` in Railway is set
2. Verify `ACCESS_TOKEN_EXPIRE_MINUTES=30` in Railway
3. Check backend logs for token verification errors
4. Try signing out and back in

### **Issue: CORS errors**

**Solutions**:
1. Verify Railway `FRONTEND_URL` matches Vercel domain exactly
2. Check `main.py` has CORS middleware configured
3. Redeploy Railway after updating `FRONTEND_URL`
4. Clear browser cache

## 🧪 Testing Production Deployment

### **1. Test Backend (Railway)**
```bash
# Health check - should return Swagger docs HTML
curl https://your-backend.up.railway.app/docs
```

### **2. Test Frontend (Vercel)**
Visit: `https://your-app.vercel.app`
- Should see landing page with "Sign in with Google"

### **3. Test Authentication Flow**
1. Click "Sign in with Google"
2. Select your Google account
3. Should redirect to `/dashboard`
4. Should see your email/name in dashboard

### **4. Test API Integration**
1. Click "Start Workout"
2. Select exercise type
3. Perform a few reps
4. Stop and save session
5. Check dashboard shows new session

### **5. Test Goal Calendar**
1. Go to dashboard
2. Click on a day in calendar
3. Set goals for exercises
4. Click "Save Goals"
5. Verify goals appear in calendar
6. Complete a workout
7. Check goal progress updates

## 📊 Monitoring & Logs

### **Railway (Backend)**:
- View logs: Railway dashboard → "Logs" tab
- Metrics: "Metrics" tab shows CPU, memory, network
- Deployments: See deployment history and status

### **Vercel (Frontend)**:
- View logs: Vercel dashboard → "Deployments" → Click deployment → "Logs"
- Runtime logs: "Logs" tab shows function execution

### **MongoDB Atlas**:
- Metrics: Atlas dashboard → "Metrics" tab
- See operations, connections, query performance
- Set up email alerts for issues

## 💰 Cost Breakdown

| Service | Tier | Cost | Features |
|---------|------|------|----------|
| **MongoDB Atlas** | M0 FREE | $0/month | 512MB storage, shared cluster |
| **Railway** | Free | $5 credits/month | ~100 hours runtime |
| **Vercel** | Hobby | $0/month | Unlimited deployments, 100GB bandwidth |
| **Google OAuth** | Free | $0/month | Unlimited authentications |
| **TOTAL** | | **$0/month** ✅ | Perfect for personal projects! |

## 🔄 Updating Your Deployment

### **Backend Changes**:
1. Push code to GitHub main branch
2. Railway auto-deploys
3. Check logs for successful deployment
4. Test changes in production

### **Frontend Changes**:
1. Push code to GitHub main branch
2. Vercel auto-deploys
3. Preview deployment first
4. Production auto-updates

### **Environment Variable Changes**:
1. Update in Railway/Vercel dashboard
2. Trigger manual redeploy
3. Wait for deployment to complete
4. Test changes

## 🎯 Post-Deployment Best Practices

1. **Monitor Logs**: Check Railway and Vercel logs regularly
2. **Set Up Alerts**: Configure MongoDB Atlas alerts
3. **Update Dependencies**: Keep packages updated for security
4. **Review Metrics**: Check CPU/memory usage
5. **Test Regularly**: Do full user flow tests weekly
6. **Document Issues**: Track problems and solutions

## 🆘 Getting Help

### **Railway**:
- Documentation: https://docs.railway.app
- Discord: https://discord.gg/railway

### **Vercel**:
- Documentation: https://vercel.com/docs
- Discord: https://vercel.com/discord

### **MongoDB Atlas**:
- Documentation: https://docs.atlas.mongodb.com
- Support: https://support.mongodb.com

## 🎊 Success!

Your FitDetect application is now live! 🎉

**Production URLs**:
- 🌐 **Frontend**: `https://your-app.vercel.app`
- 🔧 **Backend API**: `https://your-backend.up.railway.app`
- 📚 **API Docs**: `https://your-backend.up.railway.app/docs`

## 📖 Related Documentation

- [Railway Backend Deployment](./RAILWAY_DEPLOYMENT.md) - Detailed Railway guide
- [Vercel Frontend Deployment](./VERCEL_DEPLOYMENT.md) - Detailed Vercel guide
- [Google OAuth Setup](./OAUTH_SETUP.md) - OAuth configuration
- [API Documentation](./API_DOCUMENTATION.md) - API endpoints reference
- [User Storage Guide](./USER_STORAGE_GUIDE.md) - How user data is stored
- [Calorie Calculation](./CALORIE_CALCULATION.md) - Calorie mechanism
- [Completion Rate](./COMPLETION_RATE_MECHANISM.md) - Goal tracking

---

**OLD RENDER DEPLOYMENT (DEPRECATED)**

The following sections are kept for reference but Railway is now recommended:

### Step 1: Prepare Backend (Old)

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
