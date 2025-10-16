# FitDetect - AI-Powered Fitness Tracking

FitDetect is an AI-powered fitness tracking web application that detects and counts user exercises in real-time using computer vision. It leverages OpenCV, Mediapipe, and Python to analyze human body movements via webcam and provides live feedback on repetitions.

## 🎯 Overview

FitDetect enables users to:
- Track exercises in real-time through webcam
- Get instant repetition counting and feedback
- Securely authenticate via Google OAuth 2.0
- View progress and exercise history
- Store workout sessions in MongoDB

## ✨ Key Features

- **Landing Page**: Interactive homepage with Sign In and Learn More sections
- **OAuth Authentication**: Secure Google OAuth 2.0 authentication
- **User Dashboard**: Profile display, exercise history, and selection options
- **Goal Calendar**: Interactive monthly calendar for setting and tracking exercise goals
- **Goal Management**: Set daily exercise targets, track progress, and view completion stats
- **Exercise Detection**: Real-time pose detection using Mediapipe and OpenCV
- **Live Tracking**: Repetition counting with visual feedback
- **Database Storage**: MongoDB for user data, goals, and session logs
- **Responsive Design**: Cross-platform compatible dark-themed UI
- **Progress Tracking**: Monthly goal statistics and completion rates

## 🏗️ System Architecture

### Frontend
- **Framework**: Next.js with React
- **Styling**: Tailwind CSS
- **Authentication**: Google OAuth 2.0
- **Camera**: WebRTC for webcam access

### Backend
- **Framework**: FastAPI
- **Libraries**: OpenCV, Mediapipe, NumPy, Motor (MongoDB async driver)
- **API Routes**: 
  - `/api/auth/google` - OAuth authentication
  - `/api/detect` - Exercise detection
  - `/api/sessions` - Workout session CRUD operations
  - `/api/goals` - Goal management and statistics
  - `/api/goals/bulk` - Bulk goal creation/syncing
  - `/api/goals/today` - Today's goals
  - `/api/goals/stats/summary` - Monthly goal statistics
  - `/api/users/profile` - User profile and stats
  - `/api/exercises` - Exercise type management

### Database
- **Type**: MongoDB Atlas
- **Collections**:
  - `users`: User profiles and authentication data
  - `exercises`: Exercise types and detection parameters
  - `sessions`: Workout session logs with rep counts and timestamps
  - `goals`: Daily exercise goals with progress tracking

## 🚀 Tech Stack

**Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS, NextAuth.js  
**Backend**: Python 3.9+, FastAPI, OpenCV, Mediapipe, Motor (MongoDB async)  
**Authentication**: Google OAuth 2.0  
**Database**: MongoDB Atlas  
**Deployment**: Vercel (Frontend), Render/Railway (Backend)  
**Version Control**: GitHub

## 📋 MVP Scope

### Supported Exercises (MVP)
- Push-ups
- Squats

### Core Features
✅ Google OAuth login with NextAuth.js  
✅ Dashboard with exercise selection and goal overview  
✅ Interactive goal calendar with monthly view  
✅ Daily goal setting and progress tracking  
✅ Webcam-based exercise detection  
✅ Real-time repetition counting  
✅ MongoDB session and goal storage  
✅ Dark-themed responsive UI  
✅ Monthly goal statistics and completion rates

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+
- MongoDB Atlas account
- Google OAuth credentials

### Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # On Windows
pip install -r requirements.txt
```

Create `.env` file:
```env
MONGODB_URI=your_mongodb_connection_string
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SECRET_KEY=your_secret_key
```

Run backend:
```bash
uvicorn app.main:app --reload
```

### Frontend Setup

```bash
cd frontend
npm install
```

Create `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

Run frontend:
```bash
npm run dev
```

## 📱 User Flow

1. **Landing Page** → User clicks Sign In
2. **OAuth Flow** → Redirects to Google login → Returns to Dashboard
3. **Dashboard** → User views profile, goal stats, and clicks Start Exercise or Set Goals
4. **Goal Setting** → Interactive calendar to set daily exercise targets
5. **Exercise Selection** → Choose exercise type (Push-ups/Squats)
6. **Exercise Page** → Allow camera access → Detection begins → Real-time rep counting
7. **Completion** → Save session to MongoDB → Update goal progress → Redirect to dashboard
8. **Progress Tracking** → View monthly statistics, completion rates, and exercise history

## 📊 Success Metrics

- Exercise Detection Accuracy: >= 90%
- Average Latency: <= 200ms per frame
- User Retention (Weekly): >= 60%
- Average Session Duration: >= 5 minutes
- Login Success Rate: 100% for valid OAuth users

## 🔮 Future Enhancements

- [x] Goal calendar and progress tracking
- [x] Monthly statistics and completion rates
- [ ] Multiple exercise types with pose classification
- [ ] Real-time audio feedback and form correction
- [ ] Leaderboard and social sharing
- [ ] AI-based posture correction with ML models
- [ ] Achievement badges and streaks
- [ ] Weekly/monthly progress charts
- [ ] Wearable sensor integration
- [ ] Advanced analytics dashboard
- [ ] Mobile app version (React Native)
- [ ] Offline mode support

## 🎯 Project Timeline

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| Research & Setup | 1 week | Repo setup, OpenCV/Mediapipe installation, Basic detection test |
| Backend Development | 2 weeks | FastAPI backend, Detection API |
| Frontend & Auth | 2 weeks | React frontend, OAuth integration |
| Integration & Testing | 1 week | Connect backend, Test detection, Store data |
| Deployment | 1 week | Host frontend/backend, Connect MongoDB Atlas |

## ⚠️ Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Webcam permission denied | Show retry modal and guide for enabling permissions |
| Low lighting or camera quality | Implement brightness and motion stability adjustment |
| High CPU usage | Optimize Mediapipe pipeline and use frame skipping |
| Network delay | Use local inference and async UI updates |

## 📄 License

MIT License

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For support, email support@fitdetect.site or create an issue in the GitHub repository.

---

Built with ❤️ using AI and Computer Vision
