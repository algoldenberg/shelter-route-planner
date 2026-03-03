"""
Route data models
"""
from typing import List, Optional
from pydantic import BaseModel, Field


class Coordinate(BaseModel):
    """Geographic coordinate"""
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)


class ShelterOnRoute(BaseModel):
    """Shelter along the route"""
    id: str
    name: str
    street: Optional[str] = None
    latitude: float
    longitude: float
    distance_from_start: float
    type: str = "public_shelter"


class RouteRequest(BaseModel):
    """Request to calculate route"""
    start: Coordinate
    end: Coordinate
    include_shelters: bool = True
    max_shelters: int = Field(default=10, ge=1, le=50)


class RouteResponse(BaseModel):
    """Response with calculated route"""
    distance: float
    duration: float
    geometry: List[List[float]]
    shelters: List[ShelterOnRoute]
    total_shelters: int
    
    class Config:
        json_schema_extra = {
            "example": {
                "distance": 5420.5,
                "duration": 1080.3,
                "geometry": [[34.7818, 32.0853], [34.7820, 32.0855]],
                "shelters": [
                    {
                        "id": "507f1f77bcf86cd799439011",
                        "name": "Tel Aviv Shelter 1",
                        "street": "רחוב הרצל 1",
                        "latitude": 32.0853,
                        "longitude": 34.7818,
                        "distance_from_start": 150.5,
                        "type": "public_shelter"
                    }
                ],
                "total_shelters": 3
            }
        }