"""
Walking Route data models
"""
from typing import List, Optional
from pydantic import BaseModel, Field


class Coordinate(BaseModel):
    """Geographic coordinate"""
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)


class POI(BaseModel):
    """Point of Interest"""
    name: str
    type: str
    latitude: float
    longitude: float
    distance_from_start: Optional[float] = None


class Shelter(BaseModel):
    """Shelter waypoint"""
    id: str
    name: str
    latitude: float
    longitude: float
    distance_from_start: Optional[float] = None


class CircularRouteRequest(BaseModel):
    """Request to calculate circular walking route"""
    start: Coordinate
    distance_km: float = Field(..., ge=1, le=20, description="Desired route distance in kilometers")
    preferences: List[str] = Field(
        default=["park"],
        description="POI preferences: park, cafe, restaurant, museum, viewpoint"
    )
    max_pois: int = Field(default=5, ge=1, le=10)
    include_shelters: bool = True
    
    class Config:
        json_schema_extra = {
            "example": {
                "start": {"latitude": 32.0853, "longitude": 34.7818},
                "distance_km": 3.0,
                "preferences": ["park", "cafe"],
                "max_pois": 5,
                "include_shelters": True
            }
        }


class CircularRouteResponse(BaseModel):
    """Response with calculated circular route"""
    total_distance: float
    estimated_duration: float
    geometry: List[List[float]]
    pois: List[POI]
    shelters: List[Shelter]
    
    class Config:
        json_schema_extra = {
            "example": {
                "total_distance": 3200.5,
                "estimated_duration": 2400.0,
                "geometry": [[34.7818, 32.0853]],
                "pois": [
                    {
                        "name": "Yarkon Park",
                        "type": "park",
                        "latitude": 32.0863,
                        "longitude": 34.7828,
                        "distance_from_start": 150.0
                    }
                ],
                "shelters": [
                    {
                        "id": "507f1f77bcf86cd799439011",
                        "name": "Tel Aviv Shelter 1",
                        "latitude": 32.0853,
                        "longitude": 34.7818,
                        "distance_from_start": 0.0
                    }
                ]
            }
        }