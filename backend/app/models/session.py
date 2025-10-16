from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from bson import ObjectId
from app.models.user import PyObjectId

class Session(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    session_id: str
    user_id: str
    exercise_name: str
    exercise_type: str
    reps: int = 0
    duration: Optional[float] = None  # in seconds
    calories_burned: Optional[float] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    completed: bool = False
    
    class Config:
        populate_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        json_schema_extra = {
            "example": {
                "session_id": "session_123456",
                "user_id": "google_123456789",
                "exercise_name": "Push-ups",
                "exercise_type": "pushup",
                "reps": 15,
                "duration": 120.5,
                "calories_burned": 25.3,
                "completed": True
            }
        }

class SessionCreate(BaseModel):
    exercise_name: str
    exercise_type: str

class SessionUpdate(BaseModel):
    reps: Optional[int] = None
    duration: Optional[float] = None
    calories_burned: Optional[float] = None
    completed: Optional[bool] = None

class SessionInDB(Session):
    pass
