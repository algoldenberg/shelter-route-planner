"""
Shelter Submission API endpoints
"""
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, HTTPException, Request, UploadFile, File, Form
from bson import ObjectId
import requests
import httpx

from app.models.shelter_submission import ShelterSubmissionCreate, ShelterSubmissionResponse
from app.db.mongodb import get_database
from app.config import settings

router = APIRouter()

# Photo service URL
PHOTO_SERVICE_URL = "http://photo-service:18005"


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
async def submit_new_shelter(
    request: Request,
    name: str = Form(...),
    address: str = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    type: str = Form(...),
    capacity: Optional[int] = Form(None),
    comment: Optional[str] = Form(None),
    captcha_token: str = Form(...),
    photos: List[UploadFile] = File(default=[])
):
    """
    Submit a new shelter suggestion with optional photos
    
    Args:
        name: Shelter name
        address: Shelter address
        latitude: Latitude coordinate
        longitude: Longitude coordinate
        type: Shelter type (public_shelter, private_building, underground_parking, other)
        capacity: Optional capacity
        comment: Optional comment
        captcha_token: hCaptcha token
        photos: List of photo files (optional)
    """
    
    # 1. Verify hCaptcha
    captcha_valid = verify_hcaptcha(captcha_token)
    
    if not captcha_valid:
        raise HTTPException(
            status_code=400,
            detail="Captcha verification failed. Please try again."
        )
    
    # 2. Anti-spam validation (as backup)
    if looks_random(name) and looks_random(address):
        raise HTTPException(status_code=400, detail="Invalid submission format")
    
    # 3. Geographic validation (Israel only)
    if not (29.5 <= latitude <= 33.3 and 34.2 <= longitude <= 35.9):
        raise HTTPException(status_code=400, detail="Location must be within Israel")
    
    # 4. Capacity validation
    if capacity and capacity > 10000:
        raise HTTPException(status_code=400, detail="Capacity seems unrealistic")
    
    # 5. Upload photos to photo-service
    photo_urls = []
    if photos:
        async with httpx.AsyncClient() as client:
            for photo in photos:
                # Read file content
                photo_content = await photo.read()
                
                # Upload to photo-service
                files = {
                    "file": (photo.filename, photo_content, photo.content_type)
                }
                data = {
                    "category": "submission",
                    "related_id": "temp"  # Will be updated after approval
                }
                
                try:
                    response = await client.post(
                        f"{PHOTO_SERVICE_URL}/upload",
                        files=files,
                        data=data,
                        timeout=30.0
                    )
                    response.raise_for_status()
                    
                    photo_data = response.json()
                    photo_urls.append(photo_data["photo_url"])
                    
                except httpx.HTTPError as e:
                    print(f"Error uploading photo: {e}")
                    raise HTTPException(
                        status_code=500,
                        detail=f"Failed to upload photo: {str(e)}"
                    )
    
    db = get_database()
    submissions_collection = db["shelter_submissions"]

    # Get real client IP from headers (behind Nginx proxy)
    client_ip = (
        request.headers.get("X-Forwarded-For", "").split(",")[0].strip() or
        request.headers.get("X-Real-IP", "") or
        (request.client.host if request.client else "unknown")
    )

    # Create submission document
    submission_dict = {
        "name": name,
        "address": address,
        "latitude": latitude,
        "longitude": longitude,
        "type": type,
        "capacity": capacity,
        "comment": comment,
        "photos": photo_urls,
        "status": "pending",
        "submitted_at": datetime.utcnow(),
        "submitted_by_ip": client_ip,
        "reviewed_at": None,
        "reviewed_by": None
    }

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
    AUTOMATICALLY adds photos and comment to the new shelter
    """
    print(f"=== APPROVE CALLED FOR: {submission_id} ===")
    if not ObjectId.is_valid(submission_id):
        raise HTTPException(status_code=400, detail="Invalid submission ID format")

    db = get_database()
    submissions_collection = db["shelter_submissions"]
    shelters_collection = db["shelters"]
    comments_collection = db["comments"]

    # Get submission
    submission = await submissions_collection.find_one({"_id": ObjectId(submission_id)})
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    if submission["status"] != "pending":
        raise HTTPException(status_code=400, detail="Submission already reviewed")

    # Create shelter document in GeoJSON format (matching existing shelters)
    shelter_doc = {
        "name": submission["name"],
        "address": submission["address"],
        "city": "Israel",  # Default for all submissions
        "capacity": submission.get("capacity") or 50,
        "accessible": True,  # Default
        "location": {
            "type": "Point",
            "coordinates": [submission["longitude"], submission["latitude"]]  # [lon, lat]
        },
        "photos": submission.get("photos", [])  # ← AUTOMATICALLY ADD PHOTOS
    }
    
    print(f"=== SHELTER DOC TO INSERT: {shelter_doc} ===")

    # Insert into shelters collection
    shelter_result = await shelters_collection.insert_one(shelter_doc)
    new_shelter_id = str(shelter_result.inserted_id)

    # AUTOMATICALLY ADD COMMENT if submission has one
    if submission.get("comment"):
        comment_doc = {
            "shelter_id": new_shelter_id,
            "username": "Submitter",  # Default username for submissions
            "comment": submission["comment"],
            "rating": 5,  # Default rating for submission comments
            "photos": submission.get("photos", []),  # ← ИСПРАВЛЕНО: КОПИРУЕМ ФОТО ИЗ SUBMISSION
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        await comments_collection.insert_one(comment_doc)
        print(f"=== AUTO-ADDED COMMENT WITH {len(comment_doc['photos'])} PHOTOS: {submission['comment'][:50]}... ===")

    # Update submission status
    await submissions_collection.update_one(
        {"_id": ObjectId(submission_id)},
        {
            "$set": {
                "status": "approved",
                "reviewed_at": datetime.utcnow(),
                "shelter_id": new_shelter_id
            }
        }
    )

    return {
        "message": "Submission approved (photos and comment auto-added)",
        "shelter_id": new_shelter_id
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