from fastapi import APIRouter, HTTPException, status
from app.db.mongodb import get_collection
from app.models.exercise import Exercise, ExerciseCreate
from typing import List

router = APIRouter()

@router.get("/", response_model=List[dict])
async def get_all_exercises():
    """Get all available exercises"""
    exercises_collection = await get_collection("exercises")
    cursor = exercises_collection.find({})
    exercises = await cursor.to_list(length=100)
    
    for exercise in exercises:
        exercise['_id'] = str(exercise['_id'])
    
    return exercises

@router.get("/{exercise_id}")
async def get_exercise(exercise_id: str):
    """Get specific exercise by ID"""
    exercises_collection = await get_collection("exercises")
    exercise = await exercises_collection.find_one({"exercise_id": exercise_id})
    
    if not exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exercise not found"
        )
    
    exercise['_id'] = str(exercise['_id'])
    return exercise

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_exercise(exercise: ExerciseCreate):
    """Create a new exercise"""
    exercises_collection = await get_collection("exercises")
    
    # Check if exercise already exists
    existing = await exercises_collection.find_one({"exercise_id": exercise.exercise_id})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Exercise already exists"
        )
    
    exercise_dict = exercise.model_dump()
    result = await exercises_collection.insert_one(exercise_dict)
    exercise_dict['_id'] = str(result.inserted_id)
    
    return exercise_dict

@router.delete("/{exercise_id}")
async def delete_exercise(exercise_id: str):
    """Delete an exercise"""
    exercises_collection = await get_collection("exercises")
    result = await exercises_collection.delete_one({"exercise_id": exercise_id})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exercise not found"
        )
    
    return {"message": "Exercise deleted successfully"}
