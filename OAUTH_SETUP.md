# Google OAuth Configuration - FitDetect

## ✅ Configuration Complete!

### Credentials Configured

**Frontend (.env.local):**
- ✅ Google_Client ID: `[CONFIGURED]`
- ✅ Google_Client Secret: `[CONFIGURED]`
- ✅ NextAuth_Secret: `[CONFIGURED]`
- ✅ NextAuth_URL: `http://localhost:3000`
- ✅ API_URL: `http://localhost:8000`

**Backend (.env):**
- ✅ Google_Client ID: `[CONFIGURED]`
- ✅ Google_Client Secret: `[CONFIGURED]`
- ✅ MongoDB_URI: `mongodb://localhost:27017/fitdetect`
- ✅ JWT_Secret_Key: `[GENERATED]`
- ✅ Frontend_URL: `http://localhost:3000`

### OAuth Configuration

**Project ID:** `fitdetect-475307`

**Authorized Origins:**
- http://localhost:3000

**Authorized Redirect URIs:**
- http://localhost:3000/api/auth/callback/google

## 🚀 Next Steps

### 1. Restart Next.js Dev Server
The environment variables have been updated. Restart your dev server:

```powershell
# Press Ctrl+C to stop current server
# Then restart:
cd frontend
npm run dev
```

### 2. Start Backend Server
In a new terminal:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 3. Test OAuth Login

1. Open: http://localhost:3000
2. Click **"Sign In"**
3. Click **"Sign in with Google"**
4. You should be redirected to Google login
5. After successful login, you'll be redirected to the dashboard

## 📝 Important Notes

### For Production Deployment

When deploying to production, update these settings in Google Cloud Console:

**Add Production URLs:**
- Authorized JavaScript origins: `https://fitdetect.site`
- Authorized redirect URIs: `https://fitdetect.site/api/auth/callback/google`

**Update Environment Variables:**
- Frontend: Update `NEXTAUTH_URL` to your production domain
- Backend: Update `FRONTEND_URL` to your production domain

### Security Reminders

⚠️ **Never commit `.env` or `.env.local` files to Git!** (Already in .gitignore)

✅ **These files contain sensitive credentials**
✅ **Use different secrets for production**
✅ **Keep your client secret secure**

## 🧪 Testing OAuth

### Test Users
During development, you can sign in with any Google account. 

If you set up "External" user type, anyone with a Google account can test.

If you need to restrict access:
1. Go to Google Cloud Console
2. OAuth consent screen → Test users
3. Add specific email addresses

## 🔍 Troubleshooting

### "Redirect URI mismatch" error
- Verify the redirect URI in Google Console exactly matches: `http://localhost:3000/api/auth/callback/google`
- Check for trailing slashes or https vs http

### "Invalid client" error
- Double-check Client ID and Client Secret
- Make sure there are no extra spaces in .env files

### OAuth not working
1. Clear browser cookies
2. Try incognito/private mode
3. Check both frontend and backend are running
4. Verify environment variables are loaded (restart dev server)

## ✅ Ready to Go!

Your FitDetect application is now configured with Google OAuth! 🎉

Start both servers and test the login flow.
