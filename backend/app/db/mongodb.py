from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class Database:
    def __init__(self):
        self.client = None
        self.is_connected = False
    
db = Database()

async def connect_to_mongo():
    """Connect to MongoDB"""
    try:
        db.client = AsyncIOMotorClient(settings.MONGODB_URI, serverSelectionTimeoutMS=5000)
        # Test the connection
        await db.client.admin.command('ping')
        db.is_connected = True
        logger.info(f"✅ Connected to MongoDB at {settings.MONGODB_URI}")
    except Exception as e:
        db.is_connected = False
        logger.warning(f"⚠️ MongoDB connection failed: {e}")
        logger.warning("⚠️ Running in offline mode - sessions will not be persisted")

async def close_mongo_connection():
    """Close MongoDB connection"""
    if db.client:
        db.client.close()
        logger.info("Closed MongoDB connection")

async def get_database():
    """Get database instance"""
    if db.client and db.is_connected:
        return db.client[settings.DATABASE_NAME]
    # If not connected, try to connect
    if not db.is_connected:
        await connect_to_mongo()
        if db.client and db.is_connected:
            return db.client[settings.DATABASE_NAME]
    return None

async def get_collection(collection_name: str):
    """Get collection from database"""
    database = await get_database()
    if database is not None:
        return database[collection_name]
    return None

def is_db_connected():
    """Check if database is connected"""
    return db.is_connected
