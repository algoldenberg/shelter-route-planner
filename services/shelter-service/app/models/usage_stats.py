"""
Usage Statistics model for aggregated analytics
"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Dict, List, Optional


class GeoCluster(BaseModel):
    """Geographic cluster for request origins"""
    latitude: float
    longitude: float
    count: int
    region_name: Optional[str] = None


class PopularShelter(BaseModel):
    """Popular shelter stats"""
    shelter_id: str
    name: str
    views: int
    route_count: int


class UsageStats(BaseModel):
    """Aggregated usage statistics for a time period"""
    period: str  # 'daily', 'weekly', 'monthly'
    period_start: datetime
    period_end: datetime
    
    # API requests
    total_requests: int = 0
    requests_today: int = 0
    requests_week: int = 0
    requests_month: int = 0
    
    # Routes
    routes_built_today: int = 0
    routes_built_week: int = 0
    routes_built_month: int = 0
    avg_route_distance_km: float = 0.0
    
    # Popular endpoints (top 5)
    popular_endpoints: Dict[str, int] = {}  # {endpoint: count}
    
    # Geography (top 10 clusters)
    geography: List[GeoCluster] = []
    
    # Popular shelters (top 10)
    popular_shelters: List[PopularShelter] = []
    
    # Chart data for requests over time
    requests_chart: List[Dict] = []  # [{date: "2024-03-01", count: 150}]
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_schema_extra = {
            "example": {
                "period": "daily",
                "period_start": "2024-03-07T00:00:00",
                "period_end": "2024-03-07T23:59:59",
                "total_requests": 1234,
                "routes_built_today": 45,
                "popular_endpoints": {
                    "/shelters/nearby": 850,
                    "/route": 200
                }
            }
        }