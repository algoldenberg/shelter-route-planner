"""
Comment API endpoints
"""
from typing import List
from datetime import datetime
from fastapi import APIRouter, HTTPException, Query
from bson import ObjectId
from app.models.comment import CommentCreate, CommentResponse, CommentUpdate
from app.db.mongodb import get_database

router = APIRouter()


@router.post("/shelters/{shelter_id}/comments", response_model=CommentResponse, status_code=201)
async def create_comment(shelter_id: str, comment: CommentCreate):
    """
    Add a comment to a shelter
    """
    if not ObjectId.is_valid(shelter_id):
        raise HTTPException(status_code=400, detail="Invalid shelter ID format")
    
    db = get_database()
    comments_collection = db["comments"]
    
    shelters_collection = db["shelters"]
    shelter = await shelters_collection.find_one({"_id": ObjectId(shelter_id)})
    if not shelter:
        raise HTTPException(status_code=404, detail="Shelter not found")
    
    comment_dict = comment.model_dump()
    comment_dict["shelter_id"] = shelter_id
    comment_dict["created_at"] = datetime.utcnow()
    comment_dict["updated_at"] = datetime.utcnow()
    
    result = await comments_collection.insert_one(comment_dict)
    
    created_comment = await comments_collection.find_one({"_id": result.inserted_id})
    created_comment["_id"] = str(created_comment["_id"])
    
    return created_comment


@router.get("/shelters/{shelter_id}/comments", response_model=List[CommentResponse])
async def get_shelter_comments(
    shelter_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100)
):
    """
    Get all comments for a shelter
    """
    if not ObjectId.is_valid(shelter_id):
        raise HTTPException(status_code=400, detail="Invalid shelter ID format")
    
    db = get_database()
    comments_collection = db["comments"]
    
    comments = await comments_collection.find(
        {"shelter_id": shelter_id}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    for comment in comments:
        comment["_id"] = str(comment["_id"])
    
    return comments


@router.get("/comments/{comment_id}", response_model=CommentResponse)
async def get_comment(comment_id: str):
    """
    Get a specific comment by ID
    """
    if not ObjectId.is_valid(comment_id):
        raise HTTPException(status_code=400, detail="Invalid comment ID format")
    
    db = get_database()
    comments_collection = db["comments"]
    
    comment = await comments_collection.find_one({"_id": ObjectId(comment_id)})
    
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    comment["_id"] = str(comment["_id"])
    
    return comment


@router.put("/comments/{comment_id}", response_model=CommentResponse)
async def update_comment(comment_id: str, comment_update: CommentUpdate):
    """
    Update a comment
    """
    if not ObjectId.is_valid(comment_id):
        raise HTTPException(status_code=400, detail="Invalid comment ID format")
    
    db = get_database()
    comments_collection = db["comments"]
    
    existing_comment = await comments_collection.find_one({"_id": ObjectId(comment_id)})
    if not existing_comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    update_data = comment_update.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    update_data["updated_at"] = datetime.utcnow()
    
    await comments_collection.update_one(
        {"_id": ObjectId(comment_id)},
        {"$set": update_data}
    )
    
    updated_comment = await comments_collection.find_one({"_id": ObjectId(comment_id)})
    updated_comment["_id"] = str(updated_comment["_id"])
    
    return updated_comment


@router.delete("/comments/{comment_id}", status_code=204)
async def delete_comment(comment_id: str):
    """
    Delete a comment
    """
    if not ObjectId.is_valid(comment_id):
        raise HTTPException(status_code=400, detail="Invalid comment ID format")
    
    db = get_database()
    comments_collection = db["comments"]
    
    result = await comments_collection.delete_one({"_id": ObjectId(comment_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    return None


@router.get("/shelters/{shelter_id}/comments/stats")
async def get_shelter_comments_stats(shelter_id: str):
    """
    Get comment statistics for a shelter
    """
    if not ObjectId.is_valid(shelter_id):
        raise HTTPException(status_code=400, detail="Invalid shelter ID format")
    
    db = get_database()
    comments_collection = db["comments"]
    
    total_comments = await comments_collection.count_documents({"shelter_id": shelter_id})
    
    if total_comments == 0:
        return {
            "total_comments": 0,
            "average_rating": 0.0,
            "rating_distribution": {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
        }
    
    pipeline = [
        {"$match": {"shelter_id": shelter_id}},
        {"$group": {
            "_id": None,
            "average_rating": {"$avg": "$rating"},
            "ratings": {"$push": "$rating"}
        }}
    ]
    
    result = await comments_collection.aggregate(pipeline).to_list(1)
    
    if not result:
        return {
            "total_comments": 0,
            "average_rating": 0.0,
            "rating_distribution": {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
        }
    
    ratings = result[0]["ratings"]
    rating_distribution = {i: ratings.count(i) for i in range(1, 6)}
    
    return {
        "total_comments": total_comments,
        "average_rating": round(result[0]["average_rating"], 1),
        "rating_distribution": rating_distribution
    }