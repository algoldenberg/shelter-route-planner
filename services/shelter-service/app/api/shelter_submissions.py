"""
Shelter Submission API endpoints
"""
from typing import List
from datetime import datetime
from fastapi import APIRouter, HTTPException, Request
from bson import ObjectId
import requests

from app.models.shelter_submission import ShelterSubmissionCreate, ShelterSubmissionResponse
from app.db.mongodb import get_database
from app.config import settings

router = APIRouter()


def looks_random(text: str) -> bool:
    """
    Detect random/spam strings
    Checks for: no vowels, too many consonants in a row
    """
    if not text or len(text) < 3:
        return False
    
    # Remove numbers, spaces, commas - focus on letters
    letters_only = ''.join(c for c in text if c.isalpha())
    if len(letters_only) < 3:
        return False
    
    vowels = set('aeiouAEIOUаеёиоуыэюяАЕЁИОУЫЭЮЯ')  # English + Russian
    
    # No vowels at all = suspicious
    if not any(c in vowels for c in letters_only):
        return True
    
    # More than 5 consonants in a row = suspicious
    consonant_run = 0
    for char in letters_only:
        if char not in vowels:
            consonant_run += 1
            if consonant_run > 5:
                return True
        else:
            consonant_run = 0
    
    return False


def verify_hcaptcha(token: str) -> bool:
    """Verify hCaptcha token with hCaptcha API"""
    try:
        response = requests.post(
            'https://hcaptcha.com/siteverify',
            data={
                'secret': settings.hcaptcha_secret_key,
                'response': token
            },
            timeout=5
        )
        result = response.json()
        return result.get('success', False)
    except Exception as e:
        print(f"hCaptcha verification error: {e}")
        return False


@router.post("/submit", response_model=ShelterSubmissionResponse, status_code=201)
async def submit_new_shelter(submission: ShelterSubmissionCreate, request: Request):
    """
    Submit a new shelter suggestion for review
    """
    # 1. Verify hCaptcha
    if not verify_hcaptcha(submission.captcha_token):
        raise HTTPException(
            status_code=400,
            detail="Captcha verification failed. Please try again."
        )
    
    # 2. Anti-spam validation (as backup)
    if looks_random(submission.name) and looks_random(submission.address):
        raise HTTPException(status_code=400, detail="Invalid submission format")
    
    # 3. Geographic validation (Israel only)
    if not (29.5 <= submission.latitude <= 33.3 and 34.2 <= submission.longitude <= 35.9):
        raise HTTPException(status_code=400, detail="Location must be within Israel")
    
    # 4. Capacity validation
    if submission.capacity and submission.capacity > 10000:
        raise HTTPException(status_code=400, detail="Capacity seems unrealistic")
    
    db = get_database()
    submissions_collection = db["shelter_submissions"]

    # Get real client IP from headers (behind Nginx proxy)
    client_ip = (
        request.headers.get("X-Forwarded-For", "").split(",")[0].strip() or
        request.headers.get("X-Real-IP", "") or
        (request.client.host if request.client else "unknown")
    )

    # Create submission document (exclude captcha_token)
    submission_dict = submission.model_dump(exclude={'captcha_token'})
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