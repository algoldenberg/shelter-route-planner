from fastapi import APIRouter, HTTPException
from datetime import datetime, timedelta
from typing import List, Optional
from ..db.mongodb import get_database
from bson import ObjectId

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/stats")
async def get_admin_stats():
    """Get overall statistics"""
    db = get_database()
    
    # Total shelters
    total_shelters = await db.shelters.count_documents({})
    
    # Submissions stats
    pending_submissions = await db.shelter_submissions.count_documents({"status": "pending"})
    approved_submissions = await db.shelter_submissions.count_documents({"status": "approved"})
    rejected_submissions = await db.shelter_submissions.count_documents({"status": "rejected"})
    
    # Reports stats
    pending_reports = await db.shelter_reports.count_documents({"status": "pending"})
    resolved_reports = await db.shelter_reports.count_documents({"status": "resolved"})
    
    # Comments stats
    total_comments = await db.shelter_comments.count_documents({})
    
    # Submissions over last 30 days
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    submissions_pipeline = [
        {"$match": {"submitted_at": {"$gte": thirty_days_ago}}},
        {
            "$group": {
                "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$submitted_at"}},
                "count": {"$sum": 1}
            }
        },
        {"$sort": {"_id": 1}}
    ]
    
    submissions_chart = await db.shelter_submissions.aggregate(submissions_pipeline).to_list(None)
    
    return {
        "shelters": {
            "total": total_shelters
        },
        "submissions": {
            "pending": pending_submissions,
            "approved": approved_submissions,
            "rejected": rejected_submissions,
            "chart_data": submissions_chart
        },
        "reports": {
            "pending": pending_reports,
            "resolved": resolved_reports
        },
        "comments": {
            "total": total_comments
        }
    }


@router.get("/submissions")
async def get_pending_submissions(status: Optional[str] = "pending"):
    """Get submissions by status"""
    db = get_database()
    
    query = {"status": status} if status else {}
    submissions = await db.shelter_submissions.find(query).sort("submitted_at", -1).to_list(100)
    
    return [
        {
            "id": str(sub["_id"]),
            "name": sub["name"],
            "address": sub.get("address", ""),
            "latitude": sub["latitude"],
            "longitude": sub["longitude"],
            "type": sub["type"],
            "capacity": sub.get("capacity"),
            "comment": sub.get("comment", ""),
            "status": sub["status"],
            "submitted_at": sub["submitted_at"].isoformat(),
            "submitter_ip": sub.get("submitter_ip", "")
        }
        for sub in submissions
    ]


@router.put("/submissions/{submission_id}/approve")
async def approve_submission(submission_id: str):
    """Approve submission and add to shelters"""
    db = get_database()
    
    # Get submission
    submission = await db.shelter_submissions.find_one({"_id": ObjectId(submission_id)})
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    if submission["status"] != "pending":
        raise HTTPException(status_code=400, detail="Submission already processed")
    
    # Add to shelters collection
    shelter_data = {
        "name": submission["name"],
        "address": submission.get("address", f"{submission['latitude']}, {submission['longitude']}"),
        "latitude": submission["latitude"],
        "longitude": submission["longitude"],
        "type": submission["type"],
        "capacity": submission.get("capacity", 50),
        "created_at": datetime.utcnow(),
        "source": "user_submission"
    }
    
    result = await db.shelters.insert_one(shelter_data)
    
    # Update submission status
    await db.shelter_submissions.update_one(
        {"_id": ObjectId(submission_id)},
        {
            "$set": {
                "status": "approved",
                "reviewed_at": datetime.utcnow(),
                "shelter_id": str(result.inserted_id)
            }
        }
    )
    
    return {"message": "Submission approved", "shelter_id": str(result.inserted_id)}


@router.put("/submissions/{submission_id}/reject")
async def reject_submission(submission_id: str, reason: Optional[str] = None):
    """Reject submission"""
    db = get_database()
    
    submission = await db.shelter_submissions.find_one({"_id": ObjectId(submission_id)})
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    if submission["status"] != "pending":
        raise HTTPException(status_code=400, detail="Submission already processed")
    
    await db.shelter_submissions.update_one(
        {"_id": ObjectId(submission_id)},
        {
            "$set": {
                "status": "rejected",
                "reviewed_at": datetime.utcnow(),
                "rejection_reason": reason or "Not approved"
            }
        }
    )
    
    return {"message": "Submission rejected"}


@router.get("/reports")
async def get_reports(status: Optional[str] = "pending"):
    """Get reports by status"""
    db = get_database()
    
    query = {"status": status} if status else {}
    reports = await db.shelter_reports.find(query).sort("reported_at", -1).to_list(100)
    
    result = []
    for report in reports:
        # Get shelter info
        shelter = await db.shelters.find_one({"_id": ObjectId(report["shelter_id"])})
        
        result.append({
            "id": str(report["_id"]),
            "shelter_id": report["shelter_id"],
            "shelter_name": shelter["name"] if shelter else "Unknown",
            "shelter_address": shelter.get("address", "") if shelter else "",
            "issue_type": report["issue_type"],
            "comment": report["comment"],
            "contact": report.get("contact", ""),
            "status": report["status"],
            "reported_at": report["reported_at"].isoformat(),
            "reporter_ip": report.get("reporter_ip", "")
        })
    
    return result


@router.put("/reports/{report_id}/resolve")
async def resolve_report(report_id: str, action: str):
    """
    Resolve report with action
    action: 'mark_resolved' | 'delete_shelter'
    """
    db = get_database()
    
    report = await db.shelter_reports.find_one({"_id": ObjectId(report_id)})
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    if action == "delete_shelter":
        # Delete shelter
        await db.shelters.delete_one({"_id": ObjectId(report["shelter_id"])})
        
        # Mark all reports for this shelter as resolved
        await db.shelter_reports.update_many(
            {"shelter_id": report["shelter_id"]},
            {"$set": {"status": "resolved", "reviewed_at": datetime.utcnow()}}
        )
        
        return {"message": "Shelter deleted and reports resolved"}
    
    else:  # mark_resolved
        await db.shelter_reports.update_one(
            {"_id": ObjectId(report_id)},
            {"$set": {"status": "resolved", "reviewed_at": datetime.utcnow()}}
        )
        
        return {"message": "Report marked as resolved"}


@router.delete("/reports/{report_id}")
async def delete_report(report_id: str):
    """Delete report (mark as invalid)"""
    db = get_database()
    
    result = await db.shelter_reports.update_one(
        {"_id": ObjectId(report_id)},
        {"$set": {"status": "invalid", "reviewed_at": datetime.utcnow()}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Report not found")
    
    return {"message": "Report deleted"}