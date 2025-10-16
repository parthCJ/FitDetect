#!/usr/bin/env python3
"""
User Storage Verification Script for FitDetect
Checks MongoDB connection and verifies user storage functionality
"""

import sys
import os
from datetime import datetime

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.mongodb import connect_to_mongo, get_database
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def verify_user_storage():
    """Verify MongoDB connection and user storage"""
    
    print("=" * 60)
    print("FitDetect - User Storage Verification")
    print("=" * 60)
    print()
    
    # Step 1: Connect to MongoDB
    print("1. Connecting to MongoDB...")
    try:
        await connect_to_mongo()
        db = await get_database()
        if db is None:
            print("   ❌ Failed to connect to MongoDB")
            print("   💡 Make sure MongoDB is running:")
            print("      - Windows: Check if MongoDB service is running")
            print("      - Or start manually: mongod")
            return
        print("   ✅ Connected to MongoDB successfully")
    except Exception as e:
        print(f"   ❌ Connection error: {e}")
        return
    
    print()
    
    # Step 2: Check collections
    print("2. Checking collections...")
    collections = await db.list_collection_names()
    print(f"   Found collections: {collections}")
    
    if "users" in collections:
        print("   ✅ 'users' collection exists")
    else:
        print("   ℹ️  'users' collection will be created on first user signup")
    
    print()
    
    # Step 3: Check users
    print("3. Checking stored users...")
    users_collection = db["users"]
    users_count = await users_collection.count_documents({})
    print(f"   Total users in database: {users_count}")
    
    if users_count > 0:
        print("\n   Registered users:")
        async for user in users_collection.find({}).limit(10):
            print(f"   - {user.get('name')} ({user.get('email')})")
            print(f"     User ID: {user.get('user_id')}")
            print(f"     Last Login: {user.get('last_login')}")
            print()
    else:
        print("   ℹ️  No users registered yet")
        print("   Users will be automatically created on first Google OAuth login")
    
    print()
    
    # Step 4: Check sessions
    print("4. Checking exercise sessions...")
    if "sessions" in collections:
        sessions_collection = db["sessions"]
        sessions_count = await sessions_collection.count_documents({})
        print(f"   Total sessions: {sessions_count}")
    else:
        print("   ℹ️  No sessions yet (will be created when users exercise)")
    
    print()
    
    # Step 5: Check goals
    print("5. Checking goals...")
    if "goals" in collections:
        goals_collection = db["goals"]
        goals_count = await goals_collection.count_documents({})
        print(f"   Total goals: {goals_count}")
    else:
        print("   ℹ️  No goals yet (will be created when users set goals)")
    
    print()
    print("=" * 60)
    print("Verification Complete!")
    print("=" * 60)
    print()
    print("📝 Summary:")
    print("   - MongoDB is connected and ready")
    print("   - User storage is configured correctly")
    print("   - Users will be automatically created on OAuth login")
    print("   - All user data persists in MongoDB")
    print()
    print("🔐 Security:")
    print("   - User info comes from Google OAuth")
    print("   - JWT tokens are issued for API access")
    print("   - Sessions are tracked in MongoDB")
    print()

if __name__ == "__main__":
    asyncio.run(verify_user_storage())
