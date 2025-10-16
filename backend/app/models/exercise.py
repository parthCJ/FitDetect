from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
from bson import ObjectId
from app.models.user import PyObjectId

class Exercise(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    exercise_id: str
    name: str
    type: str  # pushup, squat, etc.
    description: Optional[str] = None
    detection_params: Dict[str, Any] = {}
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class ExerciseCreate(BaseModel):
    exercise_id: str
    name: str
    type: str
    description: Optional[str] = None
    detection_params: Dict[str, Any] = {}

class ExerciseUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    detection_params: Optional[Dict[str, Any]] = None
