from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime, date

class ExerciseGoal(BaseModel):
    """Exercise goal for a specific date"""
    user_id: str
    exercise_type: Literal["pushup", "squat"]
    target_count: int = Field(gt=0, description="Target number of reps")
    date: date
    completed_count: int = Field(default=0, ge=0)
    status: Literal["pending", "in_progress", "completed", "missed"] = "pending"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            date: lambda v: v.isoformat()
        }

class GoalCreate(BaseModel):
    """Schema for creating a new goal"""
    exercise_type: Literal["pushup", "squat"]
    target_count: int = Field(gt=0, description="Target number of reps")
    date: str  # Will be converted to date object

class GoalUpdate(BaseModel):
    """Schema for updating an existing goal"""
    target_count: Optional[int] = Field(None, gt=0)
    completed_count: Optional[int] = Field(None, ge=0)
    status: Optional[Literal["pending", "in_progress", "completed", "missed"]] = None

class GoalResponse(BaseModel):
    """Response schema for goal"""
    id: str
    user_id: str
    exercise_type: str
    target_count: int
    date: str
    completed_count: int
    status: str
    progress_percentage: int
    created_at: str
    updated_at: str

class BulkGoalCreate(BaseModel):
    """Schema for creating multiple goals at once"""
    goals: list[GoalCreate]
    month: Optional[str] = None  # Format: "YYYY-MM" - used for syncing/deleting goals
