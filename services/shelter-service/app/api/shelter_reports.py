"""
Shelter Report API endpoints
"""
from typing import List
from datetime import datetime
from fastapi import APIRouter, HTTPException, Request
from bson import ObjectId

from app.models.shelter_report import ShelterReportCreate, ShelterReportResponse
from app.db.mongodb import get_database

router = APIRouter()


@router.post("/{shelter_id}/report", response_model=ShelterReportResponse, status_code=201)
async def report_shelter_issue(shelter_id: str, report: ShelterReportCreate, request: Request):
    """
    Report an issue with a shelter
    """
    if not ObjectId.is_valid(shelter_id):
        raise HTTPException(status_code=400, detail="Invalid shelter ID format")

    db = get_database()
    shelters_collection = db["shelters"]
    reports_collection = db["shelter_reports"]

    # Verify shelter exists
    shelter = await shelters_collection.find_one({"_id": ObjectId(shelter_id)})
    if not shelter:
        raise HTTPException(status_code=404, detail="Shelter not found")

    # Get client IP
    client_ip = request.client.host if request.client else "unknown"

    # Create report document
    report_dict = report.model_dump()
    report_dict["shelter_id"] = shelter_id
    report_dict["status"] = "pending"
    report_dict["reported_at"] = datetime.utcnow()
    report_dict["reporter_ip"] = client_ip

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