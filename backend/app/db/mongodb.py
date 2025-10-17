from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
import logging
import certifi
import ssl

logger = logging.getLogger(__name__)

class Database:
    def __init__(self):
        self.client = None
        self.is_connected = False
    
db = Database()

async def connect_to_mongo():
    """Connect to MongoDB with enhanced SSL/TLS support"""
    try:
        # MongoDB connection with TLS/SSL support for Atlas
        # Use certifi for SSL certificate verification (fixes Windows SSL issues)
        db.client = AsyncIOMotorClient(
            settings.MONGODB_URI,
            serverSelectionTimeoutMS=5000,
            tls=True,  # Enable TLS
            tlsAllowInvalidCertificates=False,  # Validate certificates
            tlsCAFile=certifi.where(),  # Use certifi's CA bundle for Windows compatibility
        )
        # Test the connection
        await db.client.admin.command('ping')
        db.is_connected = True
        logger.info(f"✅ Connected to MongoDB Atlas successfully!")
        logger.info(f"📊 Database: {settings.DATABASE_NAME}")
    except Exception as e:
        error_msg = str(e)
        db.is_connected = False
        logger.error(f"❌ MongoDB connection failed: {error_msg}")
        
        # Provide helpful troubleshooting information
        if "SSL" in error_msg or "TLS" in error_msg:
            logger.error("🔧 SSL/TLS Error - Possible solutions:")
            logger.error("   1. Ensure certifi is installed: pip install certifi")
            logger.error("   2. Update your certificates: pip install --upgrade certifi")
            logger.error("   3. Check your MongoDB connection string in .env")
        
        if "Timeout" in error_msg or "serverSelectionTimeoutMS" in error_msg:
            logger.error("🌐 Connection Timeout - Check:")
            logger.error("   1. Your IP address is whitelisted in MongoDB Atlas")
            logger.error("   2. Go to: Network Access → Add IP Address → Add Current IP")
            logger.error("   3. Or allow access from anywhere: 0.0.0.0/0 (dev only)")
        
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
