from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Optional, List
from datetime import datetime, date, timedelta
from bson import ObjectId

from app.models.goal import (
    GoalCreate, GoalUpdate, GoalResponse, BulkGoalCreate, ExerciseGoal
)
from app.core.security import get_current_user
from app.db.mongodb import get_database

router = APIRouter()

def goal_to_response(goal: dict) -> GoalResponse:
    """Convert MongoDB goal document to response schema"""
    progress = int((goal["completed_count"] / goal["target_count"]) * 100) if goal["target_count"] > 0 else 0
    return GoalResponse(
        id=str(goal["_id"]),
        user_id=goal["user_id"],
        exercise_type=goal["exercise_type"],
        target_count=goal["target_count"],
        date=goal["date"].isoformat() if isinstance(goal["date"], date) else goal["date"],
        completed_count=goal["completed_count"],
        status=goal["status"],
        progress_percentage=progress,
        created_at=goal["created_at"].isoformat() if isinstance(goal["created_at"], datetime) else goal["created_at"],
        updated_at=goal["updated_at"].isoformat() if isinstance(goal["updated_at"], datetime) else goal["updated_at"]
    )

@router.post("/goals", response_model=GoalResponse, status_code=status.HTTP_201_CREATED)
async def create_goal(
    goal: GoalCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new exercise goal"""
    db = await get_database()
    if db is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection not available"
        )
    
    goals_collection = db["goals"]
    
    # Check if goal already exists for this date and exercise
    existing = await goals_collection.find_one({
        "user_id": current_user["id"],
        "exercise_type": goal.exercise_type,
        "date": goal.date.isoformat() if isinstance(goal.date, date) else goal.date
    })
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Goal already exists for this exercise and date"
        )
    
    goal_dict = goal.model_dump()
    goal_dict["user_id"] = current_user["id"]
    goal_dict["completed_count"] = 0
    goal_dict["status"] = "pending"
    goal_dict["created_at"] = datetime.utcnow()
    goal_dict["updated_at"] = datetime.utcnow()
    
    # Convert date to ISO string for consistency
    if isinstance(goal_dict["date"], date):
        goal_dict["date"] = goal_dict["date"].isoformat()
    
    result = await goals_collection.insert_one(goal_dict)
    goal_dict["_id"] = result.inserted_id
    
    return goal_to_response(goal_dict)

@router.post("/goals/bulk", response_model=List[GoalResponse], status_code=status.HTTP_201_CREATED)
async def create_goals_bulk(
    bulk_goals: BulkGoalCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    Sync goals for the current month - creates/updates goals from the list,
    and deletes any goals not in the list for the current month
    """
    db = await get_database()
    if db is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection not available"
        )
    
    goals_collection = db["goals"]
    created_goals = []
    
    # Track which goal IDs we're keeping (by date and exercise_type)
    goals_to_keep = []
    
    # Get the month from the request, or infer from first goal
    current_month = bulk_goals.month
    if not current_month and bulk_goals.goals:
        first_goal_date = bulk_goals.goals[0].date
        if isinstance(first_goal_date, date):
            current_month = first_goal_date.strftime("%Y-%m")
        else:
            current_month = first_goal_date[:7]  # "YYYY-MM"
    
    for goal in bulk_goals.goals:
        # Check if goal already exists
        goal_date = goal.date.isoformat() if isinstance(goal.date, date) else goal.date
        goals_to_keep.append((goal_date, goal.exercise_type))
        
        existing = await goals_collection.find_one({
            "user_id": current_user["id"],
            "exercise_type": goal.exercise_type,
            "date": goal_date
        })
        
        if existing:
            # Update existing goal
            await goals_collection.update_one(
                {"_id": existing["_id"]},
                {"$set": {
                    "target_count": goal.target_count,
                    "updated_at": datetime.utcnow()
                }}
            )
            updated_goal = await goals_collection.find_one({"_id": existing["_id"]})
            created_goals.append(goal_to_response(updated_goal))
        else:
            # Create new goal
            goal_dict = goal.model_dump()
            goal_dict["user_id"] = current_user["id"]
            goal_dict["completed_count"] = 0
            goal_dict["status"] = "pending"
            goal_dict["created_at"] = datetime.utcnow()
            goal_dict["updated_at"] = datetime.utcnow()
            
            if isinstance(goal_dict["date"], date):
                goal_dict["date"] = goal_dict["date"].isoformat()
            
            result = await goals_collection.insert_one(goal_dict)
            goal_dict["_id"] = result.inserted_id
            created_goals.append(goal_to_response(goal_dict))
    
    # Delete goals from the current month that are not in the submitted list
    if current_month:
        # Find all goals for the current month
        month_start = f"{current_month}-01"
        month_end = f"{current_month}-31"
        
        print(f"[BULK SYNC] Month: {current_month}")
        print(f"[BULK SYNC] Date range: {month_start} to {month_end}")
        print(f"[BULK SYNC] Goals to keep: {goals_to_keep}")
        
        existing_month_goals = await goals_collection.find({
            "user_id": current_user["id"],
            "date": {"$gte": month_start, "$lte": month_end}
        }).to_list(length=None)
        
        print(f"[BULK SYNC] Found {len(existing_month_goals)} existing goals for this month")
        
        # Delete goals that are not in the goals_to_keep list
        deleted_count = 0
        for existing_goal in existing_month_goals:
            goal_key = (existing_goal["date"], existing_goal["exercise_type"])
            if goal_key not in goals_to_keep:
                await goals_collection.delete_one({"_id": existing_goal["_id"]})
                deleted_count += 1
                print(f"[BULK SYNC] Deleted goal: {goal_key}")
        
        print(f"[BULK SYNC] Deleted {deleted_count} goals")
    else:
        print("[BULK SYNC] No month specified, skipping deletion sync")
    
    return created_goals

@router.get("/goals", response_model=List[GoalResponse])
async def get_goals(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    exercise_type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """Get goals with optional filters"""
    db = await get_database()
    if db is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection not available"
        )
    
    goals_collection = db["goals"]
    
    query = {"user_id": current_user["id"]}
    
    if start_date and end_date:
        query["date"] = {"$gte": start_date, "$lte": end_date}
    elif start_date:
        query["date"] = {"$gte": start_date}
    elif end_date:
        query["date"] = {"$lte": end_date}
    
    if exercise_type:
        query["exercise_type"] = exercise_type
    
    if status:
        query["status"] = status
    
    cursor = goals_collection.find(query).sort("date", 1)
    goals = await cursor.to_list(length=1000)
    
    return [goal_to_response(goal) for goal in goals]

@router.get("/goals/today", response_model=List[GoalResponse])
async def get_today_goals(current_user: dict = Depends(get_current_user)):
    """Get goals for today"""
    db = await get_database()
    if db is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection not available"
        )
    
    goals_collection = db["goals"]
    today = date.today().isoformat()
    
    cursor = goals_collection.find({
        "user_id": current_user["id"],
        "date": today
    })
    goals = await cursor.to_list(length=100)
    
    return [goal_to_response(goal) for goal in goals]

@router.get("/goals/{goal_id}", response_model=GoalResponse)
async def get_goal(
    goal_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get a specific goal"""
    db = await get_database()
    if db is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection not available"
        )
    
    goals_collection = db["goals"]
    
    goal = await goals_collection.find_one({
        "_id": ObjectId(goal_id),
        "user_id": current_user["id"]
    })
    
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    
    return goal_to_response(goal)

@router.put("/goals/{goal_id}", response_model=GoalResponse)
async def update_goal(
    goal_id: str,
    goal_update: GoalUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update a goal"""
    db = await get_database()
    if db is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection not available"
        )
    
    goals_collection = db["goals"]
    
    existing_goal = await goals_collection.find_one({
        "_id": ObjectId(goal_id),
        "user_id": current_user["id"]
    })
    
    if not existing_goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    
    update_data = goal_update.model_dump(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()
    
    # Update status based on progress
    if "completed_count" in update_data and "target_count" in existing_goal:
        if update_data["completed_count"] >= existing_goal["target_count"]:
            update_data["status"] = "completed"
        else:
            update_data["status"] = "in_progress"
    
    await goals_collection.update_one(
        {"_id": ObjectId(goal_id)},
        {"$set": update_data}
    )
    
    updated_goal = await goals_collection.find_one({"_id": ObjectId(goal_id)})
    return goal_to_response(updated_goal)

@router.delete("/goals/{goal_id}")
async def delete_goal(
    goal_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a goal"""
    db = await get_database()
    if db is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection not available"
        )
    
    goals_collection = db["goals"]
    
    result = await goals_collection.delete_one({
        "_id": ObjectId(goal_id),
        "user_id": current_user["id"]
    })
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    
    return {"message": "Goal deleted successfully"}

@router.get("/goals/stats/summary")
async def get_goal_stats(current_user: dict = Depends(get_current_user)):
    """Get goal statistics summary"""
    db = await get_database()
    if db is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection not available"
        )
    
    goals_collection = db["goals"]
    
    # Get total goals
    total_goals = await goals_collection.count_documents({"user_id": current_user["id"]})
    
    # Get completed goals
    completed_goals = await goals_collection.count_documents({
        "user_id": current_user["id"],
        "status": "completed"
    })
    
    # Get pending goals
    pending_goals = await goals_collection.count_documents({
        "user_id": current_user["id"],
        "status": "pending"
    })
    
    # Get in-progress goals
    in_progress_goals = await goals_collection.count_documents({
        "user_id": current_user["id"],
        "status": "in_progress"
    })
    
    return {
        "total_goals": total_goals,
        "completed_goals": completed_goals,
        "pending_goals": pending_goals,
        "in_progress_goals": in_progress_goals,
        "completion_rate": (completed_goals / total_goals * 100) if total_goals > 0 else 0
    }
