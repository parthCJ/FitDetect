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
    ).sort("timestamp", -1).limit(limit)
    
    sessions = await cursor.to_list(length=limit)
    
    for session in sessions:
        session['_id'] = str(session['_id'])
        # Ensure timestamp is ISO format string
        if 'timestamp' in session and isinstance(session['timestamp'], datetime):
            session['timestamp'] = session['timestamp'].isoformat()
        # Fallback to created_at if timestamp doesn't exist
        elif 'created_at' in session and isinstance(session['created_at'], datetime):
            session['timestamp'] = session['created_at'].isoformat()
    
    return {"sessions": sessions}

# Avatar Management Routes

AVAILABLE_AVATARS = [
    {"id": "weightlifter-male", "name": "Weightlifter", "gender": "male", "category": "strength"},
    {"id": "weightlifter-female", "name": "Weightlifter", "gender": "female", "category": "strength"},
    {"id": "runner-male", "name": "Runner", "gender": "male", "category": "cardio"},
    {"id": "runner-female", "name": "Runner", "gender": "female", "category": "cardio"},
    {"id": "yogi-male", "name": "Yogi", "gender": "male", "category": "flexibility"},
    {"id": "yogi-female", "name": "Yogi", "gender": "female", "category": "flexibility"},
    {"id": "gymnast-male", "name": "Gymnast", "gender": "male", "category": "agility"},
    {"id": "gymnast-female", "name": "Gymnast", "gender": "female", "category": "agility"},
    {"id": "cyclist-male", "name": "Cyclist", "gender": "male", "category": "cardio"},
    {"id": "cyclist-female", "name": "Cyclist", "gender": "female", "category": "cardio"},
    {"id": "boxer-male", "name": "Boxer", "gender": "male", "category": "combat"},
    {"id": "boxer-female", "name": "Boxer", "gender": "female", "category": "combat"},
    {"id": "athlete-male", "name": "Athlete", "gender": "male", "category": "general"},
    {"id": "athlete-female", "name": "Athlete", "gender": "female", "category": "general"},
    {"id": "bodybuilder-male", "name": "Bodybuilder", "gender": "male", "category": "strength"},
    {"id": "bodybuilder-female", "name": "Bodybuilder", "gender": "female", "category": "strength"},
]

@router.get("/avatars/list")
async def get_available_avatars():
    """
    Get list of all available avatars
    """
    return {
        "avatars": AVAILABLE_AVATARS,
        "total": len(AVAILABLE_AVATARS)
    }

@router.get("/me/avatar")
async def get_my_avatar(current_user: dict = Depends(get_current_user)):
    """
    Get current user's avatar
    """
    users_collection = await get_collection("users")
    user = await users_collection.find_one({"user_id": current_user["id"]})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {
        "avatar": user.get("avatar"),
        "avatar_selected": user.get("avatar_selected", False)
    }

@router.post("/me/avatar")
async def select_avatar(
    avatar_data: dict,
    current_user: dict = Depends(get_current_user)
):
    """
    User selects their avatar
    """
    avatar_id = avatar_data.get("avatar_id")
    
    if not avatar_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="avatar_id is required"
        )
    
    # Validate avatar_id exists
    valid_avatar_ids = [avatar["id"] for avatar in AVAILABLE_AVATARS]
    if avatar_id not in valid_avatar_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid avatar_id. Must be one of: {', '.join(valid_avatar_ids)}"
        )
    
    users_collection = await get_collection("users")
    
    # Update user document
    result = await users_collection.update_one(
        {"user_id": current_user["id"]},
        {
            "$set": {
                "avatar": avatar_id,
                "avatar_selected": True,
                "last_login": datetime.utcnow()
            }
        }
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found or avatar already set"
        )
    
    return {
        "success": True,
        "avatar": avatar_id,
        "message": "Avatar updated successfully"
    }
