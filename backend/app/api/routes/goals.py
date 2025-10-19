from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Optional, List
from datetime import datetime, date, timedelta
from bson import ObjectId
from pymongo import UpdateOne

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
    ✅ OPTIMIZED: Sync goals for the current month using bulk operations
    - Uses bulk_write for all insert/update operations
    - Single delete_many for cleanup
    - Reduced from N+1 queries to 3 total queries
    """
    db = await get_database()
    if db is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection not available"
        )
    
    goals_collection = db["goals"]
    
    # Get the month from the request, or infer from first goal
    current_month = bulk_goals.month
    if not current_month and bulk_goals.goals:
        first_goal_date = bulk_goals.goals[0].date
        if isinstance(first_goal_date, date):
            current_month = first_goal_date.strftime("%Y-%m")
        else:
            current_month = first_goal_date[:7]  # "YYYY-MM"
    
    # ✅ OPTIMIZATION 1: Prepare all upsert operations at once
    bulk_operations = []
    goals_to_keep = []
    current_time = datetime.utcnow()
    
    for goal in bulk_goals.goals:
        goal_date = goal.date.isoformat() if isinstance(goal.date, date) else goal.date
        goals_to_keep.append((goal_date, goal.exercise_type))
        
        # Prepare upsert operation (update if exists, insert if not)
        bulk_operations.append(
            UpdateOne(
                {
                    "user_id": current_user["id"],
                    "exercise_type": goal.exercise_type,
                    "date": goal_date
                },
                {
                    "$set": {
                        "target_count": goal.target_count,
                        "updated_at": current_time
                    },
                    "$setOnInsert": {
                        "user_id": current_user["id"],
                        "exercise_type": goal.exercise_type,
                        "date": goal_date,
                        "completed_count": 0,
                        "status": "pending",
                        "created_at": current_time
                    }
                },
                upsert=True
            )
        )
    
    # ✅ OPTIMIZATION 2: Execute all operations in a single bulk_write
    if bulk_operations:
        await goals_collection.bulk_write(bulk_operations, ordered=False)
        print(f"[BULK SYNC] Processed {len(bulk_operations)} goals in single operation")
    
    # ✅ OPTIMIZATION 3: Delete unwanted goals with single delete_many
    if current_month and goals_to_keep:
        month_start = f"{current_month}-01"
        month_end = f"{current_month}-31"
        
        # Build a query to delete goals NOT in the goals_to_keep list
        # MongoDB doesn't have a direct "NOT IN" for tuples, so we use $or with $ne
        delete_query = {
            "user_id": current_user["id"],
            "date": {"$gte": month_start, "$lte": month_end}
        }
        
        # Only delete if the (date, exercise_type) combo is not in goals_to_keep
        # We'll use $nor to exclude our kept goals
        exclude_conditions = [
            {"date": goal_date, "exercise_type": exercise_type}
            for goal_date, exercise_type in goals_to_keep
        ]
        
        if exclude_conditions:
            delete_query["$nor"] = exclude_conditions
        
        delete_result = await goals_collection.delete_many(delete_query)
        print(f"[BULK SYNC] Deleted {delete_result.deleted_count} goals not in the submitted list")
    
    # ✅ OPTIMIZATION 4: Fetch all saved goals in a single query
    if current_month:
        month_start = f"{current_month}-01"
        month_end = f"{current_month}-31"
        
        saved_goals = await goals_collection.find({
            "user_id": current_user["id"],
            "date": {"$gte": month_start, "$lte": month_end}
        }).sort("date", 1).to_list(length=100)
        
        return [goal_to_response(goal) for goal in saved_goals]
    
    # Fallback: fetch the specific goals we just created
    goal_keys = [(goal_date, exercise_type) for goal_date, exercise_type in goals_to_keep]
    saved_goals = await goals_collection.find({
        "user_id": current_user["id"],
        "$or": [
            {"date": goal_date, "exercise_type": exercise_type}
            for goal_date, exercise_type in goal_keys
        ]
    }).to_list(length=100)
    
    return [goal_to_response(goal) for goal in saved_goals]

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
    """
    ✅ OPTIMIZED: Get goal statistics using aggregation pipeline
    - Reduced from 4 separate count queries to 1 aggregation query
    """
    db = await get_database()
    if db is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection not available"
        )
    
    goals_collection = db["goals"]
    
    # ✅ Use aggregation pipeline for a single query
    pipeline = [
        {"$match": {"user_id": current_user["id"]}},
        {
            "$group": {
                "_id": None,
                "total_goals": {"$sum": 1},
                "completed_goals": {
                    "$sum": {"$cond": [{"$eq": ["$status", "completed"]}, 1, 0]}
                },
                "pending_goals": {
                    "$sum": {"$cond": [{"$eq": ["$status", "pending"]}, 1, 0]}
                },
                "in_progress_goals": {
                    "$sum": {"$cond": [{"$eq": ["$status", "in_progress"]}, 1, 0]}
                }
            }
        }
    ]
    
    result = await goals_collection.aggregate(pipeline).to_list(length=1)
    
    if not result:
        return {
            "total_goals": 0,
            "completed_goals": 0,
            "pending_goals": 0,
            "in_progress_goals": 0,
            "completion_rate": 0
        }
    
    stats = result[0]
    total = stats["total_goals"]
    completed = stats["completed_goals"]
    
    return {
        "total_goals": total,
        "completed_goals": completed,
        "pending_goals": stats["pending_goals"],
        "in_progress_goals": stats["in_progress_goals"],
        "completion_rate": (completed / total * 100) if total > 0 else 0
    }
