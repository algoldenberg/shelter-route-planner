"""
Shelter API endpoints
"""
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from app.models.shelter import ShelterResponse
from app.db.mongodb import get_database

router = APIRouter()


@router.get("/nearby/", response_model=List[ShelterResponse])
async def get_nearby_shelters(
    latitude: float = Query(..., ge=-90, le=90, description="User latitude"),
    longitude: float = Query(..., ge=-180, le=180, description="User longitude"),
    radius: int = Query(1000, ge=100, le=10000, description="Search radius in meters"),
    limit: int = Query(10, ge=1, le=50, description="Maximum number of results")
):
    """
    Find shelters near a location using geospatial query
    
    Requires 2dsphere index on 'location' field
    """
    db = get_database()
    shelters_collection = db["shelters"]
    
    query = {
        "location": {
            "$near": {
                "$geometry": {
                    "type": "Point",
                    "coordinates": [longitude, latitude]
                },
                "$maxDistance": radius
            }
        }
    }
    
    shelters = await shelters_collection.find(query).limit(limit).to_list(limit)
    
    for shelter in shelters:
        shelter["_id"] = str(shelter["_id"])
    
    return shelters


@router.get("/stats/count")
async def get_shelters_count():
    """
    Get total count of shelters in database
    """
    db = get_database()
    shelters_collection = db["shelters"]
    
    count = await shelters_collection.count_documents({})
    
    return {"total_shelters": count}


@router.get("/", response_model=List[ShelterResponse])
async def get_shelters(
    skip: int = Query(0, ge=0, description="Number of shelters to skip"),
    limit: int = Query(10, ge=1, le=100, description="Number of shelters to return")
):
    """
    Get list of shelters with pagination
    """
    db = get_database()
    shelters_collection = db["shelters"]
    
    shelters = await shelters_collection.find().skip(skip).limit(limit).to_list(limit)
    
    for shelter in shelters:
        shelter["_id"] = str(shelter["_id"])
    
    return shelters


@router.get("/{shelter_id}", response_model=ShelterResponse)
async def get_shelter(shelter_id: str):
    """
    Get shelter by ID
    """
    from bson import ObjectId
    
    db = get_database()
    shelters_collection = db["shelters"]
    
    if not ObjectId.is_valid(shelter_id):
        raise HTTPException(status_code=400, detail="Invalid shelter ID format")
    
    shelter = await shelters_collection.find_one({"_id": ObjectId(shelter_id)})
    
    if not shelter:
        raise HTTPException(status_code=404, detail="Shelter not found")
    
    shelter["_id"] = str(shelter["_id"])
    
    return shelter