"""
Shelter Submission API endpoints
"""
from typing import List
from datetime import datetime
from fastapi import APIRouter, HTTPException, Request
from bson import ObjectId

from app.models.shelter_submission import ShelterSubmissionCreate, ShelterSubmissionResponse
from app.db.mongodb import get_database

router = APIRouter()


@router.post("/submit", response_model=ShelterSubmissionResponse, status_code=201)
async def submit_new_shelter(submission: ShelterSubmissionCreate, request: Request):
    """
    Submit a new shelter suggestion for review
    """
    db = get_database()
    submissions_collection = db["shelter_submissions"]

    # Get client IP
    client_ip = request.client.host if request.client else "unknown"

    # Create submission document
    submission_dict = submission.model_dump()
    submission_dict["status"] = "pending"
    submission_dict["submitted_at"] = datetime.utcnow()
    submission_dict["submitted_by_ip"] = client_ip
    submission_dict["reviewed_at"] = None
    submission_dict["reviewed_by"] = None

    # Insert into database
    result = await submissions_collection.insert_one(submission_dict)

    # Return created submission
    created_submission = await submissions_collection.find_one({"_id": result.inserted_id})
    created_submission["_id"] = str(created_submission["_id"])

    return created_submission


@router.get("/submissions", response_model=List[ShelterSubmissionResponse])
async def get_pending_submissions(status: str = "pending"):
    """
    Get shelter submissions by status (for admin review)
    """
    db = get_database()
    submissions_collection = db["shelter_submissions"]

    submissions = await submissions_collection.find(
        {"status": status}
    ).sort("submitted_at", -1).to_list(100)

    for submission in submissions:
        submission["_id"] = str(submission["_id"])

    return submissions


@router.get("/submissions/{submission_id}", response_model=ShelterSubmissionResponse)
async def get_submission(submission_id: str):
    """
    Get a specific submission by ID
    """
    if not ObjectId.is_valid(submission_id):
        raise HTTPException(status_code=400, detail="Invalid submission ID format")

    db = get_database()
    submissions_collection = db["shelter_submissions"]

    submission = await submissions_collection.find_one({"_id": ObjectId(submission_id)})

    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    submission["_id"] = str(submission["_id"])

    return submission


@router.put("/submissions/{submission_id}/approve", response_model=dict)
async def approve_submission(submission_id: str):
    """
    Approve a submission and add to main shelters collection
    """
    if not ObjectId.is_valid(submission_id):
        raise HTTPException(status_code=400, detail="Invalid submission ID format")

    db = get_database()
    submissions_collection = db["shelter_submissions"]
    shelters_collection = db["shelters"]

    # Get submission
    submission = await submissions_collection.find_one({"_id": ObjectId(submission_id)})
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    if submission["status"] != "pending":
        raise HTTPException(status_code=400, detail="Submission already reviewed")

    # Create shelter document
    shelter_doc = {
        "name": submission["name"],
        "address": submission["address"],
        "latitude": submission["latitude"],
        "longitude": submission["longitude"],
        "type": submission["type"],
        "capacity": submission.get("capacity", 50),
        "created_at": datetime.utcnow(),
        "source": "user_submission"
    }

    # Insert into shelters collection
    shelter_result = await shelters_collection.insert_one(shelter_doc)

    # Update submission status
    await submissions_collection.update_one(
        {"_id": ObjectId(submission_id)},
        {
            "$set": {
                "status": "approved",
                "reviewed_at": datetime.utcnow(),
                "shelter_id": str(shelter_result.inserted_id)
            }
        }
    )

    return {
        "message": "Submission approved",
        "shelter_id": str(shelter_result.inserted_id)
    }


@router.put("/submissions/{submission_id}/reject", response_model=dict)
async def reject_submission(submission_id: str, reason: str = ""):
    """
    Reject a submission
    """
    if not ObjectId.is_valid(submission_id):
        raise HTTPException(status_code=400, detail="Invalid submission ID format")

    db = get_database()
    submissions_collection = db["shelter_submissions"]

    submission = await submissions_collection.find_one({"_id": ObjectId(submission_id)})
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    if submission["status"] != "pending":
        raise HTTPException(status_code=400, detail="Submission already reviewed")

    # Update submission status
    await submissions_collection.update_one(
        {"_id": ObjectId(submission_id)},
        {
            "$set": {
                "status": "rejected",
                "reviewed_at": datetime.utcnow(),
                "rejection_reason": reason
            }
        }
    )

    return {"message": "Submission rejected"}