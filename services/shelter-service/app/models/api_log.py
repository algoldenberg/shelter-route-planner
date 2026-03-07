"""
API Log model for tracking all API requests
"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Dict


class APILog(BaseModel):
    """Single API request log entry"""
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    endpoint: str  # e.g., "/shelters/nearby"
    method: str  # GET, POST, PUT, DELETE
    status_code: int
    response_time_ms: float
    ip_address: str
    user_agent: Optional[str] = None
    
    # GPS coordinates from request (if available)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    
    # Route-specific data
    route_start_lat: Optional[float] = None
    route_start_lng: Optional[float] = None
    route_end_lat: Optional[float] = None
    route_end_lng: Optional[float] = None
    route_distance_km: Optional[float] = None
    
    # Shelter-specific data
    shelter_id: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "timestamp": "2024-03-07T12:00:00",
                "endpoint": "/shelters/nearby",
                "method": "GET",
                "status_code": 200,
                "response_time_ms": 45.2,
                "ip_address": "192.168.1.1",
                "latitude": 32.0853,
                "longitude": 34.7818
            }
        }