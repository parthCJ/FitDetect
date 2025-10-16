# FitDetect - Quick Start Guide

This guide will help you set up and run FitDetect locally.

## Prerequisites

- Python 3.9+
- Node.js 18+
- MongoDB (local or Atlas)
- Google OAuth credentials

## Setup Instructions

### 1. Clone and Navigate

```bash
cd d:\exercise
```

### 2. Backend Setup

#### Create Python Virtual Environment

```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
```

#### Install Dependencies

```powershell
pip install -r requirements.txt
```

#### Configure Environment

Create `.env` file in `backend` directory:

```env
MONGODB_URI=mongodb://localhost:27017/fitdetect
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SECRET_KEY=your_secret_key_min_32_chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
FRONTEND_URL=http://localhost:3000
ENVIRONMENT=development
```

#### Run Backend

```powershell
cd backend
uvicorn app.main:app --reload
```

Backend will run on: http://localhost:8000

### 3. Frontend Setup

Open a new terminal:

```powershell
cd frontend
npm install
```

#### Configure Environment

Create `.env.local` file in `frontend` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

#### Run Frontend

```powershell
npm run dev
```

Frontend will run on: http://localhost:3000

### 4. MongoDB Setup

#### Option A: Local MongoDB

1. Install MongoDB Community Edition
2. Start MongoDB service:
   ```powershell
   mongod
   ```

#### Option B: MongoDB Atlas

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URI` in backend `.env`

### 5. Google OAuth Setup

1. Go to https://console.cloud.google.com/
2. Create new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret
7. Update both `.env` files

## Initialize Database

The application will automatically create collections. To add sample exercises:

```powershell
# Activate backend venv
cd backend
.\venv\Scripts\activate

# Run Python
python
```

```python
from app.db.mongodb import get_collection
from datetime import datetime

exercises_collection = get_collection("exercises")

# Add Push-ups
exercises_collection.insert_one({
    "exercise_id": "pushup_v1",
    "name": "Push-ups",
    "type": "pushup",
    "description": "Standard push-up exercise with real-time detection",
    "detection_params": {
        "down_threshold": 90,
        "up_threshold": 160,
        "confidence": 0.7
    },
    "created_at": datetime.utcnow()
})

# Add Squats
exercises_collection.insert_one({
    "exercise_id": "squat_v1",
    "name": "Squats",
    "type": "squat",
    "description": "Standard squat exercise with real-time detection",
    "detection_params": {
        "down_threshold": 90,
        "up_threshold": 160,
        "confidence": 0.7
    },
    "created_at": datetime.utcnow()
})

print("Exercises added successfully!")
```

## Testing the Application

1. Open browser: http://localhost:3000
2. Click "Sign In"
3. Sign in with Google
4. Access Dashboard
5. Select an exercise (Push-ups or Squats)
6. Allow camera access
7. Start exercising!

## API Documentation

Once backend is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Troubleshooting

### Backend Issues

**Import errors:**
```powershell
# Make sure virtual environment is activated
.\venv\Scripts\activate
pip install -r requirements.txt
```

**MongoDB connection failed:**
- Check if MongoDB is running
- Verify `MONGODB_URI` in `.env`

**OpenCV/Mediapipe errors:**
```powershell
pip install --upgrade opencv-python mediapipe
```

### Frontend Issues

**Module not found:**
```powershell
rm -r node_modules
npm install
```

**Next.js errors:**
```powershell
npm run build
npm run dev
```

**OAuth not working:**
- Verify Google OAuth credentials
- Check redirect URIs match exactly
- Ensure both Client ID and Secret are correct

### Camera Access Issues

- Use HTTPS in production (required for camera access)
- Check browser permissions
- Try different browser (Chrome recommended)

## Project Structure

```
d:\exercise\
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/
│   │   ├── core/
│   │   ├── db/
│   │   ├── detection/
│   │   ├── models/
│   │   └── main.py
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   └── app/
│   │       ├── api/
│   │       ├── auth/
│   │       ├── dashboard/
│   │       └── exercise/
│   ├── package.json
│   └── .env.local
├── README.md
└── DEPLOYMENT.md
```

## Next Steps

1. **Test Detection**: Try push-ups and squats
2. **View History**: Check dashboard for session history
3. **Customize**: Modify detection parameters in exercise models
4. **Deploy**: Follow DEPLOYMENT.md for production setup

## Support

For issues or questions:
- Check documentation
- Review error logs
- Create issue on GitHub

Happy exercising with FitDetect! 💪
