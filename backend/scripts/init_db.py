#!/usr/bin/env python3
"""
Database initialization script for FitDetect
Adds sample exercises to MongoDB
"""

import sys
import os
from datetime import datetime

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.mongodb import connect_to_mongo, get_collection
import asyncio

async def init_database():
    """Initialize database with sample exercises"""
    
    print("Connecting to MongoDB...")
    await connect_to_mongo()
    
    exercises_collection = get_collection("exercises")
    
    # Check if exercises already exist
    existing_count = await exercises_collection.count_documents({})
    if existing_count > 0:
        print(f"Database already has {existing_count} exercises.")
        response = input("Do you want to add more exercises? (y/n): ")
        if response.lower() != 'y':
            print("Initialization cancelled.")
            return
    
    exercises = [
        {
            "exercise_id": "pushup_v1",
            "name": "Push-ups",
            "type": "pushup",
            "description": "Standard push-up exercise with real-time detection and rep counting",
            "detection_params": {
                "down_threshold": 90,
                "up_threshold": 160,
                "confidence": 0.7
            },
            "created_at": datetime.utcnow()
        },
        {
            "exercise_id": "squat_v1",
            "name": "Squats",
            "type": "squat",
            "description": "Standard squat exercise with real-time detection and rep counting",
            "detection_params": {
                "down_threshold": 90,
                "up_threshold": 160,
                "confidence": 0.7
            },
            "created_at": datetime.utcnow()
        }
    ]
    
    print("\nAdding exercises to database...")
    for exercise in exercises:
        # Check if exercise already exists
        existing = await exercises_collection.find_one({"exercise_id": exercise["exercise_id"]})
        if existing:
            print(f"  ✓ {exercise['name']} already exists")
        else:
            await exercises_collection.insert_one(exercise)
            print(f"  ✓ Added {exercise['name']}")
    
    print("\n✅ Database initialization complete!")
    print(f"Total exercises in database: {await exercises_collection.count_documents({})}")

if __name__ == "__main__":
    asyncio.run(init_database())
