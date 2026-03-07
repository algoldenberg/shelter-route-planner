"""
Statistics Aggregator Service
Aggregates data from api_logs into usage_stats
Runs daily at 03:00 UTC via APScheduler
"""
from datetime import datetime, timedelta
from typing import Dict, List
from ..db.mongodb import get_database
from bson import ObjectId
import math


class StatsAggregator:
    """Aggregates usage statistics from API logs"""
    
    def __init__(self):
        self.db = get_database()
    
    async def aggregate_daily_stats(self):
        """
        Aggregate statistics for the last 24 hours
        Called by scheduler every day at 03:00 UTC
        """
        print(f"🔄 Starting daily stats aggregation at {datetime.utcnow()}")
        
        now = datetime.utcnow()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        today_end = today_start + timedelta(days=1)
        week_start = today_start - timedelta(days=7)
        month_start = today_start - timedelta(days=30)
        
        # === API REQUESTS ===
        total_requests = await self.db.api_logs.count_documents({})
        requests_today = await self.db.api_logs.count_documents({
            "timestamp": {"$gte": today_start, "$lt": today_end}
        })
        requests_week = await self.db.api_logs.count_documents({
            "timestamp": {"$gte": week_start}
        })
        requests_month = await self.db.api_logs.count_documents({
            "timestamp": {"$gte": month_start}
        })
        
        # === ROUTES ===
        routes_today = await self.db.api_logs.count_documents({
            "endpoint": "/route",
            "timestamp": {"$gte": today_start, "$lt": today_end}
        })
        routes_week = await self.db.api_logs.count_documents({
            "endpoint": "/route",
            "timestamp": {"$gte": week_start}
        })
        routes_month = await self.db.api_logs.count_documents({
            "endpoint": "/route",
            "timestamp": {"$gte": month_start}
        })
        
        # Average route distance (if we store it in logs)
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
        avg_distance_result = await self.db.api_logs.aggregate(avg_distance_pipeline).to_list(1)
        avg_route_distance_km = round(avg_distance_result[0]["avg_distance"], 2) if avg_distance_result else 0.0
        
        # === POPULAR ENDPOINTS ===
        popular_endpoints = await self._get_popular_endpoints(month_start)
        
        # === GEOGRAPHY ===
        geography = await self._get_geography_clusters(month_start)
        
        # === POPULAR SHELTERS ===
        popular_shelters = await self._get_popular_shelters(month_start)
        
        # === REQUESTS CHART (last 30 days) ===
        requests_chart = await self._get_requests_chart(month_start)
        
        # === SAVE AGGREGATED STATS ===
        stats_doc = {
            "period": "daily",
            "period_start": today_start,
            "period_end": today_end,
            "total_requests": total_requests,
            "requests_today": requests_today,
            "requests_week": requests_week,
            "requests_month": requests_month,
            "routes_built_today": routes_today,
            "routes_built_week": routes_week,
            "routes_built_month": routes_month,
            "avg_route_distance_km": avg_route_distance_km,
            "popular_endpoints": popular_endpoints,
            "geography": geography,
            "popular_shelters": popular_shelters,
            "requests_chart": requests_chart,
            "created_at": datetime.utcnow()
        }
        
        # Insert new stats
        await self.db.usage_stats.insert_one(stats_doc)
        
        print(f"✅ Daily stats aggregated successfully")
        print(f"   - Total requests: {total_requests}")
        print(f"   - Requests today: {requests_today}")
        print(f"   - Routes today: {routes_today}")
        
        return stats_doc
    
    async def _get_popular_endpoints(self, since: datetime) -> Dict[str, int]:
        """Get top 5 most popular endpoints"""
        pipeline = [
            {"$match": {"timestamp": {"$gte": since}}},
            {"$group": {
                "_id": "$endpoint",
                "count": {"$sum": 1}
            }},
            {"$sort": {"count": -1}},
            {"$limit": 5}
        ]
        
        results = await self.db.api_logs.aggregate(pipeline).to_list(5)
        return {item["_id"]: item["count"] for item in results}
    
    async def _get_geography_clusters(self, since: datetime) -> List[Dict]:
        """
        Get top 10 geographic clusters from request GPS coordinates
        Using simple grid-based clustering (0.1 degree grid = ~11km)
        """
        pipeline = [
            {"$match": {
                "latitude": {"$exists": True},
                "longitude": {"$exists": True},
                "timestamp": {"$gte": since}
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
            {"$limit": 10}
        ]
        
        results = await self.db.api_logs.aggregate(pipeline).to_list(10)
        
        return [
            {
                "latitude": round(item["avg_lat"], 4),
                "longitude": round(item["avg_lng"], 4),
                "count": item["count"],
                "region_name": None  # TODO: можно добавить reverse geocoding
            }
            for item in results
        ]
    
    async def _get_popular_shelters(self, since: datetime) -> List[Dict]:
        """
        Get top 10 popular shelters by:
        1. Views (requests to /shelters/{id})
        2. Route usage (shelters used as destinations)
        """
        # Count shelter views from API logs
        views_pipeline = [
            {"$match": {
                "shelter_id": {"$exists": True},
                "timestamp": {"$gte": since}
            }},
            {"$group": {
                "_id": "$shelter_id",
                "views": {"$sum": 1}
            }},
            {"$sort": {"views": -1}},
            {"$limit": 10}
        ]
        
        views_results = await self.db.api_logs.aggregate(views_pipeline).to_list(10)
        
        # Get shelter details and build response
        popular = []
        for item in views_results:
            shelter_id = item["_id"]
            
            # Get shelter info
            try:
                shelter = await self.db.shelters.find_one({"_id": ObjectId(shelter_id)})
                if shelter:
                    popular.append({
                        "shelter_id": shelter_id,
                        "name": shelter.get("name", "Unknown"),
                        "views": item["views"],
                        "route_count": 0  # TODO: подсчитать из маршрутов
                    })
            except:
                # Invalid ObjectId or shelter not found
                continue
        
        return popular
    
    async def _get_requests_chart(self, since: datetime) -> List[Dict]:
        """Get daily request counts for the chart"""
        pipeline = [
            {"$match": {"timestamp": {"$gte": since}}},
            {"$group": {
                "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$timestamp"}},
                "count": {"$sum": 1}
            }},
            {"$sort": {"_id": 1}}
        ]
        
        results = await self.db.api_logs.aggregate(pipeline).to_list(None)
        
        return [
            {"date": item["_id"], "count": item["count"]}
            for item in results
        ]
    
    async def cleanup_old_logs(self, days: int = 30):
        """
        Delete API logs older than specified days
        Called after aggregation to keep DB size manageable
        """
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        result = await self.db.api_logs.delete_many({
            "timestamp": {"$lt": cutoff_date}
        })
        
        print(f"🗑️ Deleted {result.deleted_count} old API logs (older than {days} days)")
        
        return result.deleted_count