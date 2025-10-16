# Railway Deployment Guide - FitDetect Backend

## 🚂 Deploy Backend to Railway

Railway is perfect for deploying FastAPI applications with Python.

## 📋 Prerequisites

- ✅ GitHub account with FitDetect repository
- ✅ Railway account (free): https://railway.app
- ✅ MongoDB Atlas account (free): https://www.mongodb.com/cloud/atlas

## 🔧 Step-by-Step Deployment

### **Step 1: Set Up MongoDB Atlas (Free Cloud Database)**

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up / Log in
3. Click **"Create"** to create a new cluster
4. Choose **"M0 FREE"** tier
5. Select a cloud provider & region (choose closest to your users)
6. Cluster Name: `FitDetect`
7. Click **"Create Cluster"**

**Configure Database Access:**
1. Click **"Database Access"** (left sidebar)
2. Click **"Add New Database User"**
3. Username: `fitdetect-admin`
4. Password: Auto-generate (copy it!)
5. Database User Privileges: **"Atlas admin"**
6. Click **"Add User"**

**Configure Network Access:**
1. Click **"Network Access"** (left sidebar)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - This is needed for Railway to connect
4. Click **"Confirm"**

**Get Connection String:**
1. Click **"Database"** (left sidebar)
2. Click **"Connect"** on your cluster
3. Click **"Connect your application"**
4. Select **"Python"** and version **"3.6 or later"**
5. Copy the connection string:
   ```
   mongodb+srv://fitdetect-admin:<password>@fitdetect.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with your actual password
7. Add database name at the end:
   ```
   mongodb+srv://fitdetect-admin:yourpassword@fitdetect.xxxxx.mongodb.net/fitdetect?retryWrites=true&w=majority
   ```

### **Step 2: Prepare Backend for Railway**

Create a configuration file for Railway:

#### **1. Create `railway.json`** (in `backend/` folder)

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "uvicorn app.main:app --host 0.0.0.0 --port $PORT",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

#### **2. Create `runtime.txt`** (in `backend/` folder)

```
python-3.9.18
```

#### **3. Update `requirements.txt`** (verify it has all dependencies)

Your existing `requirements.txt` should have:
```txt
opencv-python==4.8.1.78
mediapipe==0.10.8
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-multipart==0.0.6
pymongo==4.6.0
python-dotenv==1.0.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
pydantic==2.5.0
pydantic-settings==2.1.0
numpy==1.24.3
Pillow==10.1.0
google-auth==2.25.2
google-auth-oauthlib==1.2.0
google-auth-httplib2==0.2.0
motor==3.3.2
aiofiles==23.2.1
```

### **Step 3: Deploy to Railway**

1. Go to https://railway.app
2. Click **"Start a New Project"**
3. Click **"Deploy from GitHub repo"**
4. Select your **FitDetect** repository
5. Railway will detect your backend automatically

**Configure the deployment:**
- Click **"Add variables"** or go to **"Variables"** tab

### **Step 4: Set Environment Variables in Railway**

Click **"Variables"** tab and add these:

#### **Required Variables:**

```bash
# MongoDB Connection
MONGODB_URI=mongodb+srv://fitdetect-admin:yourpassword@fitdetect.xxxxx.mongodb.net/fitdetect?retryWrites=true&w=majority

# Database Name
DATABASE_NAME=fitdetect

# Google OAuth
GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-secret-here

# JWT Configuration
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Frontend URL (update after Vercel deployment)
FRONTEND_URL=https://your-app.vercel.app

# CORS Origins (update after Vercel deployment)
CORS_ORIGINS=["https://your-app.vercel.app"]

# Environment
ENVIRONMENT=production
```

#### **How to Add Variables:**

**Option 1: Raw Editor (Faster)**
1. Click **"RAW Editor"** tab
2. Paste all variables at once:
```
MONGODB_URI=mongodb+srv://fitdetect-admin:password@cluster.mongodb.net/fitdetect?retryWrites=true&w=majority
DATABASE_NAME=fitdetect
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
FRONTEND_URL=https://your-app.vercel.app
ENVIRONMENT=production
```
3. Click **"Update Variables"**

**Option 2: One by One**
1. Click **"New Variable"**
2. Enter **Variable Name** and **Value**
3. Click **"Add"**
4. Repeat for all variables

### **Step 5: Generate SECRET_KEY**

Run this locally to generate a secure secret:

```bash
# Windows PowerShell
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Or use OpenSSL
openssl rand -base64 32
```

Copy the output and use it for `SECRET_KEY` in Railway.

### **Step 6: Configure Root Directory**

Since your backend is in a subfolder:

1. Go to **"Settings"** tab
2. Find **"Root Directory"**
3. Set to: `backend`
4. Click **"Update"**

### **Step 7: Deploy**

1. Railway will automatically start deploying
2. Wait 3-5 minutes for build to complete
3. You'll get a URL like: `https://fitdetect-backend-production.up.railway.app`

### **Step 8: Update CORS Configuration**

After getting your Railway URL, update the backend CORS settings:

1. Go back to Railway **"Variables"** tab
2. Update `FRONTEND_URL` with your actual Vercel URL (once you have it)
3. The backend `main.py` already has CORS configured:

```python
# This is already in your code
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### **Step 9: Enable Public Domain**

1. Go to **"Settings"** tab in Railway
2. Find **"Networking"** section
3. Click **"Generate Domain"**
4. You'll get a public URL like: `fitdetect-backend-production.up.railway.app`
5. Copy this URL - you'll need it for Vercel frontend

## 📝 Complete Environment Variables Reference

```bash
# ========================================
# MongoDB Configuration
# ========================================
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/fitdetect?retryWrites=true&w=majority
DATABASE_NAME=fitdetect

# ========================================
# Google OAuth Credentials
# ========================================
GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxx

# ========================================
# JWT Token Configuration
# ========================================
SECRET_KEY=your-generated-secret-key-min-32-characters
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# ========================================
# Frontend Configuration
# ========================================
FRONTEND_URL=https://fitdetect.vercel.app

# ========================================
# Environment
# ========================================
ENVIRONMENT=production
```

## 🔐 Security Checklist

- [ ] MongoDB URI has strong password
- [ ] `SECRET_KEY` is randomly generated (32+ characters)
- [ ] `GOOGLE_CLIENT_SECRET` is from Google Cloud Console
- [ ] Network access allows Railway IPs (0.0.0.0/0 for simplicity)
- [ ] Database user has appropriate permissions
- [ ] `.env` file is in `.gitignore` (never commit secrets!)

## 🛠️ Troubleshooting

### **Issue: "Module not found" during build**

**Solution**: Make sure `requirements.txt` is complete
```bash
# Test locally first
cd backend
pip install -r requirements.txt
```

### **Issue: "MongoDB connection failed"**

**Solution**:
1. Check `MONGODB_URI` is correct
2. Verify password doesn't have special characters (use URI encoding)
3. Check MongoDB Atlas Network Access allows 0.0.0.0/0
4. Verify database user exists and has correct permissions

### **Issue: "CORS error from frontend"**

**Solution**:
1. Check `FRONTEND_URL` in Railway matches your Vercel domain
2. Make sure CORS is configured in `main.py`:
   ```python
   app.add_middleware(
       CORSMiddleware,
       allow_origins=[settings.FRONTEND_URL],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```
3. Redeploy after updating `FRONTEND_URL`

### **Issue: "Application failed to respond"**

**Solution**:
1. Check Railway logs: Click **"Logs"** tab
2. Verify `PORT` environment variable is used:
   ```python
   # In main.py (you might need to add this)
   import os
   port = int(os.getenv("PORT", 8000))
   ```
3. Start command uses `--port $PORT`:
   ```
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

### **Issue: "Google OAuth not working"**

**Solution**:
1. Update Google Cloud Console redirect URIs
2. Add Railway backend URL to authorized origins:
   ```
   https://your-backend.up.railway.app
   ```

## 📊 View Logs

1. Click **"Logs"** tab in Railway
2. See real-time application logs
3. Filter by service, level, or search

**Check for:**
- ✅ "Connected to MongoDB"
- ✅ "Application startup complete"
- ❌ Any error messages

## 🔄 Redeploy

**Automatic:**
- Railway auto-deploys when you push to GitHub main branch

**Manual:**
1. Go to **"Deployments"** tab
2. Click **"Deploy"** button
3. Or click **"..."** on a deployment → **"Redeploy"**

## 📈 Monitoring

### **View Metrics:**
1. Click **"Metrics"** tab
2. See CPU, Memory, Network usage
3. Monitor response times

### **Health Check:**
Visit: `https://your-backend.up.railway.app/docs`
- You should see FastAPI Swagger documentation
- Test endpoints directly in the browser

## 🎯 Post-Deployment Checklist

- [ ] Backend deployed to Railway
- [ ] MongoDB Atlas cluster created
- [ ] All environment variables set
- [ ] Public domain generated
- [ ] `/docs` endpoint accessible
- [ ] MongoDB connection successful
- [ ] CORS configured for frontend
- [ ] Logs show no errors

## 🔗 Integration with Frontend

After deploying backend to Railway:

1. **Copy your Railway URL**: 
   ```
   https://fitdetect-backend-production.up.railway.app
   ```

2. **Use it in Vercel frontend** as `NEXT_PUBLIC_API_URL`

3. **Update Railway's `FRONTEND_URL`** after deploying frontend to Vercel

## 💰 Railway Pricing

**Free Tier:**
- $5 free credits per month
- No credit card required
- Perfect for development/testing

**Pro Plan ($5/month):**
- $5 credit included
- Pay only for usage beyond that
- Recommended for production

## 🚀 Your Deployment URLs

After deployment:

- **Backend API**: `https://fitdetect-backend.up.railway.app`
- **API Docs**: `https://fitdetect-backend.up.railway.app/docs`
- **Health Check**: `https://fitdetect-backend.up.railway.app/api/exercises`

## 📱 Test Your Deployment

```bash
# Test health
curl https://your-backend.up.railway.app/docs

# Test exercises endpoint (should return list)
curl https://your-backend.up.railway.app/api/exercises

# Test auth endpoint (should return 422 - needs token)
curl -X POST https://your-backend.up.railway.app/api/auth/google
```

## 🎊 Success!

Your FitDetect backend is now live on Railway! 🎉

**Next Steps:**
1. Deploy frontend to Vercel
2. Update `NEXT_PUBLIC_API_URL` in Vercel to your Railway URL
3. Update `FRONTEND_URL` in Railway to your Vercel URL
4. Test the complete application!

---

**Related**: [Deploy Frontend to Vercel](./VERCEL_DEPLOYMENT.md)
