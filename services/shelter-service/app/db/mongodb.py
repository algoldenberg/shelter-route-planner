"""
MongoDB connection and database instance
"""
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

# MongoDB client instance
mongodb_client: AsyncIOMotorClient = None


async def connect_to_mongo():
    """Connect to MongoDB"""
    global mongodb_client
    mongodb_client = AsyncIOMotorClient(settings.mongodb_url)
    print(f"✅ Connected to MongoDB at {settings.mongo_host}:{settings.mongo_port}")


async def close_mongo_connection():
    """Close MongoDB connection"""
    global mongodb_client
    if mongodb_client:
        mongodb_client.close()
        print("❌ Closed MongoDB connection")


def get_database():
    """Get database instance"""
    return mongodb_client[settings.mongo_db]