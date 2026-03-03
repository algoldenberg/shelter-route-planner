"""
Script to load shelter data from JSON into MongoDB
"""
import json
import asyncio
from pathlib import Path
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = "mongodb://admin:changeme123@localhost:27017"
DB_NAME = "shelter_planner"
COLLECTION_NAME = "shelters"

DATA_FILE = Path(__file__).parent / "shelters_data.json"


async def create_geospatial_index(collection):
    """
    Create 2dsphere geospatial index for location-based queries
    """
    try:
        await collection.create_index([("location", "2dsphere")])
        print("✅ Created 2dsphere index on 'location' field")
    except Exception as e:
        print(f"⚠️  Index creation warning: {e}")


async def load_shelters():
    """
    Load shelters from JSON file into MongoDB
    """
    print(f"📡 Connecting to MongoDB at {MONGO_URL}")
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    collection = db[COLLECTION_NAME]
    
    if not DATA_FILE.exists():
        print(f"❌ Data file not found: {DATA_FILE}")
        return
    
    print(f"📂 Loading data from {DATA_FILE}")
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        shelters_data = json.load(f)
    
    print(f"📊 Found {len(shelters_data)} shelters in JSON file")
    
    print("🗑️  Dropping existing collection...")
    await collection.drop()
    
    print("🔄 Transforming data (adding GeoJSON location field)...")
    for shelter in shelters_data:
        shelter["location"] = {
            "type": "Point",
            "coordinates": [shelter["longitude"], shelter["latitude"]]
        }
    
    print("💾 Inserting shelters into MongoDB...")
    result = await collection.insert_many(shelters_data)
    print(f"✅ Inserted {len(result.inserted_ids)} shelters")
    
    await create_geospatial_index(collection)
    
    count = await collection.count_documents({})
    print(f"📊 Total shelters in database: {count}")
    
    client.close()
    print("✅ Data load complete!")


if __name__ == "__main__":
    asyncio.run(load_shelters())