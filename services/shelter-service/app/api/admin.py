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


@router.get("/usage-stats")
async def get_usage_stats():
    """
    Get usage statistics
    Real-time counters from api_logs + cached heavy queries from usage_stats
    """
    db = get_database()
    
    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - timedelta(days=7)
    month_start = today_start - timedelta(days=30)
    
    # === REAL-TIME COUNTERS FROM API_LOGS ===
    
    # Total requests (all time)
    total_requests = await db.api_logs.count_documents({})
    
    # Requests by period
    requests_today = await db.api_logs.count_documents({
        "timestamp": {"$gte": today_start}
    })
    requests_week = await db.api_logs.count_documents({
        "timestamp": {"$gte": week_start}
    })
    requests_month = await db.api_logs.count_documents({
        "timestamp": {"$gte": month_start}
    })
    
    # Routes built (action_type = route_built)
    routes_built_today = await db.api_logs.count_documents({
        "action_type": "route_built",
        "timestamp": {"$gte": today_start}
    })
    routes_built_week = await db.api_logs.count_documents({
        "action_type": "route_built",
        "timestamp": {"$gte": week_start}
    })
    routes_built_month = await db.api_logs.count_documents({
        "action_type": "route_built",
        "timestamp": {"$gte": month_start}
    })
    
    # Address searches (action_type = address_search)
    address_searches_today = await db.api_logs.count_documents({
        "action_type": "address_search",
        "timestamp": {"$gte": today_start}
    })
    address_searches_week = await db.api_logs.count_documents({
        "action_type": "address_search",
        "timestamp": {"$gte": week_start}
    })
    address_searches_month = await db.api_logs.count_documents({
        "action_type": "address_search",
        "timestamp": {"$gte": month_start}
    })
    
    # Location searches (action_type = location_search)
    location_searches_today = await db.api_logs.count_documents({
        "action_type": "location_search",
        "timestamp": {"$gte": today_start}
    })
    location_searches_week = await db.api_logs.count_documents({
        "action_type": "location_search",
        "timestamp": {"$gte": week_start}
    })
    location_searches_month = await db.api_logs.count_documents({
        "action_type": "location_search",
        "timestamp": {"$gte": month_start}
    })
    
    # Average route distance (last 30 days)
    avg_distance_pipeline = [
        {"$match": {
            "route_distance_km": {"$exists": True},
            "timestamp": {"$gte": month_start}
        }},
        {"$group": {
            "_id": None,
            "avg_distance": {"$avg": "$route_distance_km"}
        }}
    ]
    avg_distance_result = await db.api_logs.aggregate(avg_distance_pipeline).to_list(1)
    avg_route_distance_km = round(avg_distance_result[0]["avg_distance"], 2) if avg_distance_result else 0.0
    
    # === CACHED DATA FROM usage_stats (charts, heavy queries) ===
    latest_stats = await db.usage_stats.find_one(
        {},
        sort=[("created_at", -1)]
    )
    
    # Get cached data or defaults
    requests_chart = latest_stats.get("requests_chart", []) if latest_stats else []
    popular_endpoints = latest_stats.get("popular_endpoints", {}) if latest_stats else {}
    geography = latest_stats.get("geography", []) if latest_stats else []
    popular_shelters = latest_stats.get("popular_shelters", []) if latest_stats else []
    
    return {
        # Real-time counters
        "total_requests": total_requests,
        "requests_today": requests_today,
        "requests_week": requests_week,
        "requests_month": requests_month,
        
        "routes_built_today": routes_built_today,
        "routes_built_week": routes_built_week,
        "routes_built_month": routes_built_month,
        
        "address_searches_today": address_searches_today,
        "address_searches_week": address_searches_week,
        "address_searches_month": address_searches_month,
        
        "location_searches_today": location_searches_today,
        "location_searches_week": location_searches_week,
        "location_searches_month": location_searches_month,
        
        "avg_route_distance_km": avg_route_distance_km,
        
        # Cached data (from daily aggregation)
        "requests_chart": requests_chart,
        "popular_endpoints": popular_endpoints,
        "geography": geography,
        "popular_shelters": popular_shelters,
        
        "last_updated": datetime.utcnow().isoformat()
    }
    
    # Remove MongoDB _id field
    latest_stats.pop("_id", None)
    
    # Add last_updated timestamp
    latest_stats["last_updated"] = latest_stats.get("created_at").isoformat() if latest_stats.get("created_at") else None
    
    return latest_stats


@router.get("/popular-endpoints")
async def get_popular_endpoints(limit: int = 10):
    """
    Get most popular API endpoints
    Real-time query from api_logs (last 30 days)
    """
    db = get_database()
    
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    
    pipeline = [
        {"$match": {"timestamp": {"$gte": thirty_days_ago}}},
        {"$group": {
            "_id": "$endpoint",
            "count": {"$sum": 1},
            "avg_response_time": {"$avg": "$response_time_ms"}
        }},
        {"$sort": {"count": -1}},
        {"$limit": limit}
    ]
    
    results = await db.api_logs.aggregate(pipeline).to_list(limit)
    
    return [
        {
            "endpoint": item["_id"],
            "count": item["count"],
            "avg_response_time_ms": round(item["avg_response_time"], 2)
        }
        for item in results
    ]


@router.get("/geography")
async def get_geography_stats(limit: int = 10):
    """
    Get geographic distribution of API requests
    Based on GPS coordinates from api_logs
    """
    db = get_database()
    
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    
    pipeline = [
        {"$match": {
            "latitude": {"$exists": True},
            "longitude": {"$exists": True},
            "timestamp": {"$gte": thirty_days_ago}
        }},
        {"$project": {
            "grid_lat": {"$round": [{"$divide": ["$latitude", 0.1]}, 0]},
            "grid_lng": {"$round": [{"$divide": ["$longitude", 0.1]}, 0]},
            "latitude": 1,
            "longitude": 1
        }},
        {"$group": {
            "_id": {"lat": "$grid_lat", "lng": "$grid_lng"},
            "count": {"$sum": 1},
            "avg_lat": {"$avg": "$latitude"},
            "avg_lng": {"$avg": "$longitude"}
        }},
        {"$sort": {"count": -1}},
        {"$limit": limit}
    ]
    
    results = await db.api_logs.aggregate(pipeline).to_list(limit)
    
    return [
        {
            "latitude": round(item["avg_lat"], 4),
            "longitude": round(item["avg_lng"], 4),
            "count": item["count"]
        }
        for item in results
    ]


@router.get("/popular-shelters")
async def get_popular_shelters(limit: int = 10):
    """
    Get most viewed/used shelters
    Based on shelter_id in api_logs
    """
    db = get_database()
    
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    
    # Count views per shelter
    pipeline = [
        {"$match": {
            "shelter_id": {"$exists": True},
            "timestamp": {"$gte": thirty_days_ago}
        }},
        {"$group": {
            "_id": "$shelter_id",
            "views": {"$sum": 1}
        }},
        {"$sort": {"views": -1}},
        {"$limit": limit}
    ]
    
    results = await db.api_logs.aggregate(pipeline).to_list(limit)
    
    # Get shelter details
    popular = []
    for item in results:
        try:
            shelter = await db.shelters.find_one({"_id": ObjectId(item["_id"])})
            if shelter:
                popular.append({
                    "shelter_id": item["_id"],
                    "name": shelter.get("name", "Unknown"),
                    "address": shelter.get("address", ""),
                    "views": item["views"]
                })
        except:
            # Invalid ObjectId
            continue
    
    return popular


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
    
    # Add to shelters collection in GeoJSON format (matching existing shelters)
    shelter_data = {
        "name": submission["name"],
        "address": submission.get("address", f"{submission['latitude']}, {submission['longitude']}"),
        "city": "Israel",
        "capacity": submission.get("capacity") or 50,
        "accessible": True,
        "location": {
            "type": "Point",
            "coordinates": [submission["longitude"], submission["latitude"]]  # [lon, lat]
        }
    }
    
    print(f"=== ADMIN APPROVE: SHELTER DATA = {shelter_data} ===")  # Debug log
    
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