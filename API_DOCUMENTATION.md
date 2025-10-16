# API Documentation

## Base URL
```
Development: http://localhost:8000
Production: https://api.fitdetect.site
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## Endpoints

### Authentication

#### POST /api/auth/google
Authenticate with Google OAuth token

**Request Body:**
```json
{
  "token": "google_oauth_token"
}
```

**Response:**
```json
{
  "access_token": "jwt_access_token",
  "token_type": "bearer",
  "user": {
    "user_id": "google_123456",
    "name": "John Doe",
    "email": "john@example.com",
    "picture": "https://..."
  }
}
```

#### GET /api/auth/me
Get current user information

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user_id": "google_123456",
  "name": "John Doe",
  "email": "john@example.com",
  "picture": "https://...",
  "created_at": "2025-01-01T00:00:00",
  "last_login": "2025-01-15T12:00:00"
}
```

### Users

#### GET /api/users/profile
Get user profile

**Response:**
```json
{
  "user_id": "google_123456",
  "name": "John Doe",
  "email": "john@example.com",
  "picture": "https://...",
  "created_at": "2025-01-01T00:00:00"
}
```

#### PUT /api/users/profile
Update user profile

**Request Body:**
```json
{
  "name": "John Updated",
  "picture": "https://new-picture.jpg"
}
```

#### GET /api/users/history
Get user exercise history

**Query Parameters:**
- `limit` (optional): Number of sessions to return (default: 10)
- `skip` (optional): Number of sessions to skip (default: 0)

**Response:**
```json
{
  "sessions": [...],
  "total": 50,
  "skip": 0,
  "limit": 10
}
```

#### GET /api/users/stats
Get user statistics

**Response:**
```json
{
  "total_sessions": 25,
  "total_reps": 500,
  "exercise_breakdown": [
    {
      "_id": "pushup",
      "count": 15,
      "total_reps": 300
    },
    {
      "_id": "squat",
      "count": 10,
      "total_reps": 200
    }
  ]
}
```

### Exercises

#### GET /api/exercises/
Get all available exercises

**Response:**
```json
[
  {
    "exercise_id": "pushup_v1",
    "name": "Push-ups",
    "type": "pushup",
    "description": "Standard push-up exercise",
    "detection_params": {
      "down_threshold": 90,
      "up_threshold": 160
    }
  }
]
```

#### GET /api/exercises/{exercise_id}
Get specific exercise

**Response:**
```json
{
  "exercise_id": "pushup_v1",
  "name": "Push-ups",
  "type": "pushup",
  "description": "Standard push-up exercise"
}
```

#### GET /api/exercises/type/{exercise_type}
Get exercises by type

**Response:**
```json
[
  {
    "exercise_id": "pushup_v1",
    "name": "Push-ups",
    "type": "pushup"
  }
]
```

### Sessions

#### POST /api/sessions/
Create new workout session

**Request Body:**
```json
{
  "exercise_name": "Push-ups",
  "exercise_type": "pushup"
}
```

**Response:**
```json
{
  "session_id": "session_abc123",
  "user_id": "google_123456",
  "exercise_name": "Push-ups",
  "exercise_type": "pushup",
  "reps": 0,
  "completed": false,
  "timestamp": "2025-01-15T12:00:00"
}
```

#### GET /api/sessions/{session_id}
Get specific session

**Response:**
```json
{
  "session_id": "session_abc123",
  "exercise_name": "Push-ups",
  "reps": 15,
  "duration": 120.5,
  "completed": true
}
```

#### PUT /api/sessions/{session_id}
Update session

**Request Body:**
```json
{
  "reps": 15,
  "duration": 120.5,
  "calories_burned": 25.3,
  "completed": true
}
```

#### GET /api/sessions/
Get user sessions

**Query Parameters:**
- `limit` (optional): Number of sessions (default: 20)
- `skip` (optional): Skip sessions (default: 0)

**Response:**
```json
{
  "sessions": [...],
  "total": 25,
  "skip": 0,
  "limit": 20
}
```

#### DELETE /api/sessions/{session_id}
Delete session

**Response:**
```json
{
  "message": "Session deleted successfully"
}
```

## Error Responses

All endpoints may return these error codes:

### 400 Bad Request
```json
{
  "detail": "Invalid request data"
}
```

### 401 Unauthorized
```json
{
  "detail": "Could not validate credentials"
}
```

### 404 Not Found
```json
{
  "detail": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error message"
}
```

## Rate Limiting

Currently no rate limiting in development. Production will have:
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated requests

## WebSocket (Future)

Real-time exercise detection will use WebSocket:
```
ws://localhost:8000/ws/detect/{session_id}
```

## Examples

### Python
```python
import requests

# Authenticate
response = requests.post(
    'http://localhost:8000/api/auth/google',
    json={'token': 'google_token'}
)
token = response.json()['access_token']

# Get user stats
headers = {'Authorization': f'Bearer {token}'}
stats = requests.get(
    'http://localhost:8000/api/users/stats',
    headers=headers
).json()
```

### JavaScript/TypeScript
```javascript
// Authenticate
const response = await fetch('http://localhost:8000/api/auth/google', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token: googleToken })
});
const { access_token } = await response.json();

// Get exercises
const exercises = await fetch('http://localhost:8000/api/exercises/', {
  headers: { 'Authorization': `Bearer ${access_token}` }
}).then(res => res.json());
```
