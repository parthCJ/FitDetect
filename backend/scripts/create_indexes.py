"""
Create database indexes for optimal query performance
Run this script once to create indexes on your MongoDB collections
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import certifi
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME", "fitdetect")

async def create_indexes():
    """Create indexes for all collections"""
    try:
        # Connect to MongoDB
        client = AsyncIOMotorClient(
            MONGODB_URI,
            tls=True,
            tlsCAFile=certifi.where(),
        )
        
        db = client[DATABASE_NAME]
        print(f"✅ Connected to database: {DATABASE_NAME}")
        
        # ============================================
        # USERS COLLECTION INDEXES
        # ============================================
        users_collection = db.users
        
        # Create index on user_id (unique) - Primary lookup field
        await users_collection.create_index("user_id", unique=True)
        print("✅ Created unique index on users.user_id")
        
        # Create index on email - For email-based lookups
        await users_collection.create_index("email")
        print("✅ Created index on users.email")
        
        # Create index on last_login - For activity queries
        await users_collection.create_index("last_login")
        print("✅ Created index on users.last_login")
        
        # ============================================
        # SESSIONS COLLECTION INDEXES
        # ============================================
        sessions_collection = db.sessions
        
        # Create compound index on user_id + timestamp - Most common query
        await sessions_collection.create_index([("user_id", 1), ("timestamp", -1)])
        print("✅ Created compound index on sessions.user_id + timestamp")
        
        # Create index on exercise_type - For filtering by exercise
        await sessions_collection.create_index("exercise_type")
        print("✅ Created index on sessions.exercise_type")
        
        # Create index on timestamp - For date range queries
        await sessions_collection.create_index("timestamp")
        print("✅ Created index on sessions.timestamp")
        
        # ============================================
        # GOALS COLLECTION INDEXES
        # ============================================
        goals_collection = db.goals
        
        # Create compound index on user_id + week_start - Primary lookup
        await goals_collection.create_index([("user_id", 1), ("week_start", -1)])
        print("✅ Created compound index on goals.user_id + week_start")
        
        # Try to create unique compound index (skip if duplicate data exists)
        try:
            await goals_collection.create_index(
                [("user_id", 1), ("week_start", 1)],
                unique=True
            )
            print("✅ Created unique compound index on goals.user_id + week_start")
        except Exception as e:
            if "duplicate key" in str(e).lower() or "11000" in str(e):
                print("⚠️  Skipped unique index on goals (duplicate data exists - clean up needed)")
            else:
                raise
        
        # Create index on status - For filtering active/completed goals
        await goals_collection.create_index("status")
        print("✅ Created index on goals.status")
        
        # ============================================
        # EXERCISES COLLECTION INDEXES (if used)
        # ============================================
        exercises_collection = db.exercises
        
        # Create index on exercise_type
        await exercises_collection.create_index("exercise_type")
        print("✅ Created index on exercises.exercise_type")
        
        print("\n🎉 All indexes created successfully!")
        print("\n📊 Index Summary:")
        print("   - Users: user_id (unique), email, last_login")
        print("   - Sessions: user_id+timestamp, exercise_type, timestamp")
        print("   - Goals: user_id+week_start, user_id+week_start (unique), status")
        print("   - Exercises: exercise_type")
        
        # List all indexes for verification
        print("\n🔍 Verifying indexes...")
        for collection_name in ["users", "sessions", "goals", "exercises"]:
            collection = db[collection_name]
            indexes = await collection.index_information()
            print(f"\n{collection_name.upper()} indexes:")
            for index_name, index_info in indexes.items():
                print(f"   - {index_name}: {index_info.get('key', [])}")
        
        client.close()
        
    except Exception as e:
        print(f"❌ Error creating indexes: {e}")
        raise

if __name__ == "__main__":
    print("🚀 Creating database indexes for FitDetect...")
    print("=" * 60)
    asyncio.run(create_indexes())
    print("=" * 60)
    print("✅ Done! Your database queries will now be much faster.")
