from fastapi import APIRouter, HTTPException, Depends, status
from app.core.security import get_current_user
from app.db.mongodb import get_collection
from app.models.user import User, UserUpdate
from typing import List, Optional
from datetime import datetime

router = APIRouter()

@router.get("/me")
async def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    """
    Get current user profile
    """
    users_collection = await get_collection("users")
    user = await users_collection.find_one({"user_id": current_user["id"]})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user['_id'] = str(user['_id'])
    return user

@router.put("/me")
async def update_current_user(
    user_update: UserUpdate,
    current_user: dict = Depends(get_current_user)
):
    """
    Update current user profile
    """
    users_collection = await get_collection("users")
    
    update_data = user_update.model_dump(exclude_unset=True)
    
    if update_data:
        await users_collection.update_one(
            {"user_id": current_user["id"]},
            {"$set": update_data}
        )
    
    updated_user = await users_collection.find_one({"user_id": current_user["id"]})
    updated_user['_id'] = str(updated_user['_id'])
    
    return updated_user

@router.get("/stats")
async def get_user_stats(current_user: dict = Depends(get_current_user)):
    """
    Get user statistics
    """
    sessions_collection = await get_collection("sessions")
    
    # Get total sessions
    total_sessions = await sessions_collection.count_documents({"user_id": current_user["id"]})
    
    # Get total exercises completed
    pipeline = [
        {"$match": {"user_id": current_user["id"]}},
        {"$group": {
            "_id": None,
            "total_reps": {"$sum": "$reps_completed"},
            "total_duration": {"$sum": "$duration"}
        }}
    ]
    
    result = await sessions_collection.aggregate(pipeline).to_list(length=1)
    
    if result:
        stats = result[0]
        return {
            "total_sessions": total_sessions,
            "total_reps": stats.get("total_reps", 0),
            "total_duration": stats.get("total_duration", 0)
        }
    
    return {
        "total_sessions": 0,
        "total_reps": 0,
        "total_duration": 0
    }

@router.get("/history")
async def get_user_history(
    limit: int = 10,
    current_user: dict = Depends(get_current_user)
):
    """
    Get user exercise history
    """
    sessions_collection = await get_collection("sessions")
    
    cursor = sessions_collection.find(
        {"user_id": current_user["id"]}
    ).sort("created_at", -1).limit(limit)
    
    sessions = await cursor.to_list(length=limit)
    
    for session in sessions:
        session['_id'] = str(session['_id'])
    
    return {"sessions": sessions}
