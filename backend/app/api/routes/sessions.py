from fastapi import APIRouter, HTTPException, Depends, status
from app.core.security import get_current_user
from app.db.mongodb import get_collection
from app.models.session import Session, SessionCreate, SessionUpdate
from typing import List, Optional
from datetime import datetime, timedelta
from bson import ObjectId

router = APIRouter()

@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_session(
    session: SessionCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    Create a new exercise session
    """
    try:
        sessions_collection = await get_collection("sessions")
        
        session_dict = session.model_dump()
        session_dict["user_id"] = current_user["id"]
        session_dict["created_at"] = datetime.utcnow()
        session_dict["updated_at"] = datetime.utcnow()
        session_dict["reps"] = 0
        session_dict["completed"] = False
        
        result = await sessions_collection.insert_one(session_dict)
        
        return {
            "session_id": str(result.inserted_id),
            "exercise_name": session_dict["exercise_name"],
            "exercise_type": session_dict["exercise_type"],
            "reps": 0,
            "completed": False
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create session: {str(e)}"
        )

@router.get("/{session_id}")
async def get_session(
    session_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get a specific session by ID
    """
    try:
        sessions_collection = await get_collection("sessions")
        
        session = await sessions_collection.find_one({
            "_id": ObjectId(session_id),
            "user_id": current_user["id"]
        })
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found"
            )
        
        session["_id"] = str(session["_id"])
        return session
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get session: {str(e)}"
        )

@router.put("/{session_id}")
async def update_session(
    session_id: str,
    session_update: SessionUpdate,
    current_user: dict = Depends(get_current_user)
):
    """
    Update a session
    """
    try:
        sessions_collection = await get_collection("sessions")
        
        # Check if session exists and belongs to user
        existing_session = await sessions_collection.find_one({
            "_id": ObjectId(session_id),
            "user_id": current_user["id"]
        })
        
        if not existing_session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found"
            )
        
        update_data = session_update.model_dump(exclude_unset=True)
        update_data["updated_at"] = datetime.utcnow()
        
        await sessions_collection.update_one(
            {"_id": ObjectId(session_id)},
            {"$set": update_data}
        )
        
        updated_session = await sessions_collection.find_one({"_id": ObjectId(session_id)})
        updated_session["_id"] = str(updated_session["_id"])
        
        return updated_session
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update session: {str(e)}"
        )

@router.get("/")
async def get_sessions(
    exercise_type: Optional[str] = None,
    limit: int = 50,
    current_user: dict = Depends(get_current_user)
):
    """
    Get all sessions for current user
    """
    sessions_collection = await get_collection("sessions")
    
    query = {"user_id": current_user["id"]}
    if exercise_type:
        query["exercise_type"] = exercise_type
    
    cursor = sessions_collection.find(query).sort("created_at", -1).limit(limit)
    sessions = await cursor.to_list(length=limit)
    
    for session in sessions:
        session["_id"] = str(session["_id"])
    
    return sessions

@router.delete("/{session_id}")
async def delete_session(
    session_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Delete a session
    """
    sessions_collection = await get_collection("sessions")
    
    result = await sessions_collection.delete_one({
        "_id": ObjectId(session_id),
        "user_id": current_user["id"]
    })
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    return {"message": "Session deleted successfully"}
