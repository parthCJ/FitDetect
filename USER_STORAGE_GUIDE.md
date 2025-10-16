# User Authentication & Storage - FitDetect

## 🔐 How It Works

### **OAuth + MongoDB Integration**

FitDetect uses **Google OAuth for authentication** and **MongoDB for persistent user storage**. Here's the complete flow:

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐      ┌──────────────┐
│   User      │─────>│   Frontend   │─────>│   Google    │─────>│   Backend    │
│  Browser    │<─────│  (Next.js)   │<─────│   OAuth     │<─────│  (FastAPI)   │
└─────────────┘      └──────────────┘      └─────────────┘      └──────┬───────┘
                                                                         │
                                                                         ▼
                                                                  ┌──────────────┐
                                                                  │   MongoDB    │
                                                                  │  Users DB    │
                                                                  └──────────────┘
```

## 📋 Step-by-Step Flow

### **1. User Clicks "Sign In with Google"**
- Frontend shows Google OAuth popup
- User selects their Google account
- Google returns an ID token

### **2. Frontend Sends Token to Backend**
```typescript
// Frontend: src/app/api/auth/[...nextauth]/route.ts
const response = await fetch(`${API_URL}/api/auth/google`, {
  method: 'POST',
  body: JSON.stringify({ token: account.id_token })
})
```

### **3. Backend Verifies Token & Creates/Updates User**
```python
# Backend: app/api/routes/auth.py

# Verify Google token
idinfo = id_token.verify_oauth2_token(token, ...)

# Extract user info
user_id = f"google_{idinfo['sub']}"
email = idinfo.get('email')
name = idinfo.get('name')

# Check if user exists in MongoDB
existing_user = await users_collection.find_one({"user_id": user_id})

if not existing_user:
    # CREATE NEW USER
    new_user = {
        "user_id": user_id,
        "name": name,
        "email": email,
        "picture": picture,
        "created_at": datetime.utcnow(),
        "last_login": datetime.utcnow()
    }
    await users_collection.insert_one(new_user)
else:
    # UPDATE EXISTING USER (last login time)
    await users_collection.update_one(
        {"user_id": user_id},
        {"$set": {"last_login": datetime.utcnow()}}
    )
```

### **4. Backend Returns JWT Token**
```python
# Create JWT token with user info
access_token = create_access_token(
    data={"sub": user_id, "email": email}
)

return {
    "access_token": access_token,
    "token_type": "bearer",
    "user": { ... }
}
```

### **5. Frontend Stores Token & User Info**
```typescript
// NextAuth stores in session
session.accessToken = response.access_token
session.user = response.user
```

### **6. Subsequent API Requests Use JWT**
```typescript
// All API calls include the token
fetch(`${API_URL}/api/goals`, {
  headers: {
    'Authorization': `Bearer ${session.accessToken}`
  }
})
```

## 🗄️ MongoDB Collections

### **Users Collection**
```javascript
{
  "_id": ObjectId("..."),
  "user_id": "google_123456789",
  "name": "John Doe",
  "email": "john@gmail.com",
  "picture": "https://lh3.googleusercontent.com/...",
  "created_at": ISODate("2025-10-16T10:30:00Z"),
  "last_login": ISODate("2025-10-16T15:45:00Z")
}
```

### **Sessions Collection** (Exercise history)
```javascript
{
  "_id": ObjectId("..."),
  "user_id": "google_123456789",
  "exercise_name": "Push-ups",
  "exercise_type": "pushup",
  "reps": 25,
  "duration": 120.5,
  "created_at": ISODate("2025-10-16T15:00:00Z"),
  "completed": true
}
```

### **Goals Collection**
```javascript
{
  "_id": ObjectId("..."),
  "user_id": "google_123456789",
  "exercise_type": "pushup",
  "target_count": 50,
  "completed_count": 25,
  "date": "2025-10-16",
  "status": "in_progress",
  "created_at": ISODate("2025-10-16T08:00:00Z")
}
```

## ✅ Verify Your Setup

### **Run Verification Script**
```bash
cd backend
python scripts/verify_user_storage.py
```

This will check:
- ✅ MongoDB connection
- ✅ Existing collections
- ✅ Registered users
- ✅ Sessions and goals

### **Manual MongoDB Check**
```bash
# Connect to MongoDB shell
mongosh

# Switch to fitdetect database
use fitdetect

# View all users
db.users.find().pretty()

# Count users
db.users.countDocuments()

# View recent sessions
db.sessions.find().sort({created_at: -1}).limit(5).pretty()

# View active goals
db.goals.find({status: {$ne: "completed"}}).pretty()
```

## 🔄 User Persistence (Auto Sign-In)

### **How Users Stay Signed In**

1. **First Sign In**:
   - User signs in with Google
   - Backend creates user in MongoDB
   - JWT token issued (30 min expiry)
   - NextAuth stores session

2. **Return Visits**:
   - NextAuth checks existing session
   - If JWT is still valid → User auto-signed in
   - If JWT expired → Auto-refresh or re-authenticate

3. **User Data Always in MongoDB**:
   - Even if session expires, user data persists
   - Goals, sessions, history all saved
   - Next sign-in loads all previous data

### **Session Configuration**
```typescript
// frontend/src/app/api/auth/[...nextauth]/route.ts
export const authOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, account }) {
      // Store backend JWT in NextAuth session
      if (account?.id_token) {
        const response = await fetch('/api/auth/google', {
          body: JSON.stringify({ token: account.id_token })
        })
        const data = await response.json()
        token.accessToken = data.access_token
        token.user = data.user
      }
      return token
    }
  }
}
```

## 🛡️ Security Features

### **Data Protection**
- ✅ User passwords **never** stored (Google handles auth)
- ✅ Only Google-verified emails can sign in
- ✅ JWT tokens expire after 30 minutes
- ✅ MongoDB credentials in `.env` (not in repo)
- ✅ CORS protection (only frontend can call backend)

### **User Privacy**
- ✅ Only basic info stored (name, email, picture)
- ✅ No sensitive data in MongoDB
- ✅ Each user only sees their own data
- ✅ User ID tied to Google account

## 🔧 Troubleshooting

### **User Not Being Created**
```bash
# Check backend logs
# Should see: "Creating new user: email@gmail.com"

# Check MongoDB connection
python scripts/verify_user_storage.py

# Verify .env has MONGODB_URI
cat backend/.env
```

### **User Can't Access Their Data**
```bash
# Check JWT token is being sent
# Frontend console → Network tab → Check Authorization header

# Verify user_id matches in database
db.users.findOne({email: "user@gmail.com"})
db.sessions.find({user_id: "google_123456"})
```

### **Sessions Not Saving**
```bash
# Check backend logs for errors
# Verify MongoDB is running
# Check sessions endpoint: POST /api/sessions/

# Manual test:
curl -X POST http://localhost:8000/api/sessions/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"exercise_name": "Push-ups", "exercise_type": "pushup"}'
```

## 📊 Monitoring Users

### **View All Users**
```python
# scripts/list_users.py
from app.db.mongodb import connect_to_mongo, get_database
import asyncio

async def list_users():
    await connect_to_mongo()
    db = await get_database()
    users = db["users"]
    
    async for user in users.find({}):
        print(f"Name: {user['name']}")
        print(f"Email: {user['email']}")
        print(f"Last Login: {user['last_login']}")
        print("-" * 40)

asyncio.run(list_users())
```

### **User Statistics**
```javascript
// In MongoDB shell
db.users.aggregate([
  {
    $lookup: {
      from: "sessions",
      localField: "user_id",
      foreignField: "user_id",
      as: "sessions"
    }
  },
  {
    $project: {
      name: 1,
      email: 1,
      total_sessions: { $size: "$sessions" },
      total_reps: { $sum: "$sessions.reps" }
    }
  }
])
```

## 🎯 Summary

**Your current setup:**
- ✅ Google OAuth handles authentication
- ✅ MongoDB stores all user data persistently
- ✅ Users are auto-created on first sign-in
- ✅ JWT tokens secure API access
- ✅ Sessions, goals, and history all saved
- ✅ Users stay signed in across sessions

**No additional configuration needed!** Just make sure MongoDB is running and users will be automatically stored when they sign in.
