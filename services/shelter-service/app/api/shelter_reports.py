"""
Shelter Report API endpoints
"""
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, HTTPException, Request, UploadFile, File, Form
import httpx
from bson import ObjectId

from app.models.shelter_report import ShelterReportCreate, ShelterReportResponse
from app.db.mongodb import get_database

router = APIRouter()

# Photo service URL
PHOTO_SERVICE_URL = "http://photo-service:18005"


@router.post("/{shelter_id}/report", response_model=ShelterReportResponse, status_code=201)
async def report_shelter_issue(
    shelter_id: str,
    request: Request,
    issue_type: str = Form(...),
    comment: str = Form(...),
    contact: Optional[str] = Form(None),
    photos: List[UploadFile] = File(default=[])
):
    """
    Report an issue with a shelter with optional photos
    
    Args:
        shelter_id: ID of the shelter
        issue_type: Type of issue (closed, wrong_address, blocked_entrance, other)
        comment: Description of the issue
        contact: Optional contact information
        photos: List of photo files (optional)
    """
    # Validate shelter_id
    if not ObjectId.is_valid(shelter_id):
        raise HTTPException(status_code=400, detail="Invalid shelter ID format")

    # Validate comment length
    if len(comment) < 5 or len(comment) > 1000:
        raise HTTPException(status_code=400, detail="Comment must be between 5 and 1000 characters")

    db = get_database()
    shelters_collection = db["shelters"]
    reports_collection = db["shelter_reports"]

    # Verify shelter exists
    shelter = await shelters_collection.find_one({"_id": ObjectId(shelter_id)})
    if not shelter:
        raise HTTPException(status_code=404, detail="Shelter not found")

    # Get client IP
    client_ip = request.client.host if request.client else "unknown"

    # Upload photos to photo-service
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
                    "category": "report",
                    "related_id": shelter_id
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

    # Create report document
    report_dict = {
        "shelter_id": shelter_id,
        "issue_type": issue_type,
        "comment": comment,
        "contact": contact,
        "photos": photo_urls,
        "status": "pending",
        "reported_at": datetime.utcnow(),
        "reporter_ip": client_ip
    }

    # Insert into database
    result = await reports_collection.insert_one(report_dict)

    # Return created report
    created_report = await reports_collection.find_one({"_id": result.inserted_id})
    created_report["_id"] = str(created_report["_id"])

    return created_report


@router.get("/reports", response_model=List[ShelterReportResponse])
async def get_shelter_reports(status: str = "pending", limit: int = 100):
    """
    Get shelter reports by status (for admin review)
    """
    db = get_database()
    reports_collection = db["shelter_reports"]

    reports = await reports_collection.find(
        {"status": status}
    ).sort("reported_at", -1).limit(limit).to_list(limit)

    for report in reports:
        report["_id"] = str(report["_id"])

    return reports


@router.get("/{shelter_id}/reports", response_model=List[ShelterReportResponse])
async def get_reports_for_shelter(shelter_id: str):
    """
    Get all reports for a specific shelter
    """
    if not ObjectId.is_valid(shelter_id):
        raise HTTPException(status_code=400, detail="Invalid shelter ID format")

    db = get_database()
    reports_collection = db["shelter_reports"]

    reports = await reports_collection.find(
        {"shelter_id": shelter_id}
    ).sort("reported_at", -1).to_list(50)

    for report in reports:
        report["_id"] = str(report["_id"])

    return reports