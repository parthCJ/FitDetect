"""
Verify MongoDB Atlas Connection and Database Setup
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings

async def verify_atlas_connection():
    """Test connection to MongoDB Atlas and show database info"""
    print("=" * 60)
    print("🔍 MongoDB Atlas Connection Verification")
    print("=" * 60)
    
    print(f"\n📍 MongoDB URI: {settings.MONGODB_URI[:50]}...")
    print(f"📦 Database Name: {settings.DATABASE_NAME}")
    
    try:
        # Connect to MongoDB Atlas
        print("\n⏳ Connecting to MongoDB Atlas...")
        client = AsyncIOMotorClient(settings.MONGODB_URI, serverSelectionTimeoutMS=10000)
        
        # Test connection
        await client.admin.command('ping')
        print("✅ Successfully connected to MongoDB Atlas!")
        
        # Get database
        db = client[settings.DATABASE_NAME]
        
        # List all collections
        collections = await db.list_collection_names()
        print(f"\n📚 Collections in '{settings.DATABASE_NAME}' database:")
        if collections:
            for collection in collections:
                count = await db[collection].count_documents({})
                print(f"   • {collection}: {count} documents")
        else:
            print("   ⚠️  No collections found yet")
            print("\n💡 Collections will be created automatically when you:")
            print("   1. Sign in with Google (creates 'users' collection)")
            print("   2. Create a workout session (creates 'sessions' collection)")
            print("   3. Set a goal (creates 'goals' collection)")
        
        # Check for specific collections
        print("\n🔍 Checking required collections:")
        required_collections = ['users', 'sessions', 'goals']
        for col in required_collections:
            if col in collections:
                count = await db[col].count_documents({})
                print(f"   ✅ {col}: {count} documents")
            else:
                print(f"   ⚠️  {col}: Not created yet")
        
        # Show sample user if exists
        users_collection = db['users']
        user_count = await users_collection.count_documents({})
        if user_count > 0:
            print(f"\n👥 Found {user_count} user(s) in database:")
            async for user in users_collection.find().limit(3):
                print(f"   • {user.get('email', 'N/A')} (ID: {user.get('_id')})")
        
        # Show sample session if exists
        sessions_collection = db['sessions']
        session_count = await sessions_collection.count_documents({})
        if session_count > 0:
            print(f"\n🏋️ Found {session_count} session(s) in database:")
            async for session in sessions_collection.find().limit(3):
                print(f"   • {session.get('exercise_name', 'N/A')} - {session.get('reps', 0)} reps")
        
        # Show sample goal if exists
        goals_collection = db['goals']
        goal_count = await goals_collection.count_documents({})
        if goal_count > 0:
            print(f"\n🎯 Found {goal_count} goal(s) in database:")
            async for goal in goals_collection.find().limit(3):
                print(f"   • {goal.get('exercise_type', 'N/A')} - Target: {goal.get('target_count', 0)}")
        
        print("\n" + "=" * 60)
        print("✅ Verification Complete!")
        print("=" * 60)
        
        # Close connection
        client.close()
        
        return True
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("\n🔧 Troubleshooting:")
        print("   1. Check MongoDB Atlas Network Access allows your IP")
        print("   2. Verify username and password are correct")
        print("   3. Ensure cluster is running (not paused)")
        print("   4. Check URI format in .env file")
        return False

if __name__ == "__main__":
    success = asyncio.run(verify_atlas_connection())
    sys.exit(0 if success else 1)
