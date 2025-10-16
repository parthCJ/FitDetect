#!/usr/bin/env python3
"""
Fix missing timestamps in existing sessions
Adds timestamp field to sessions that only have created_at
"""

import sys
import os
from datetime import datetime

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.mongodb import connect_to_mongo, get_database
import asyncio

async def fix_timestamps():
    """Add timestamp to sessions that are missing it"""
    
    print("=" * 60)
    print("Fixing Session Timestamps")
    print("=" * 60)
    print()
    
    # Connect to MongoDB
    print("Connecting to MongoDB...")
    await connect_to_mongo()
    db = await get_database()
    
    if db is None:
        print("❌ Failed to connect to MongoDB")
        return
    
    print("✅ Connected to MongoDB")
    print()
    
    sessions_collection = db["sessions"]
    
    # Find sessions without timestamp
    sessions_without_timestamp = await sessions_collection.count_documents({
        "timestamp": {"$exists": False}
    })
    
    print(f"Found {sessions_without_timestamp} sessions without timestamp field")
    
    if sessions_without_timestamp == 0:
        print("✅ All sessions already have timestamps!")
        return
    
    print()
    print("Updating sessions...")
    
    # Update sessions: copy created_at to timestamp if timestamp doesn't exist
    result = await sessions_collection.update_many(
        {"timestamp": {"$exists": False}},
        [
            {
                "$set": {
                    "timestamp": {
                        "$cond": {
                            "if": {"$ne": ["$created_at", None]},
                            "then": "$created_at",
                            "else": datetime.utcnow()
                        }
                    }
                }
            }
        ]
    )
    
    print(f"✅ Updated {result.modified_count} sessions")
    print()
    
    # Verify
    remaining = await sessions_collection.count_documents({
        "timestamp": {"$exists": False}
    })
    
    if remaining == 0:
        print("✅ All sessions now have timestamps!")
    else:
        print(f"⚠️  {remaining} sessions still missing timestamps")
    
    print()
    print("=" * 60)
    print("Migration Complete!")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(fix_timestamps())
