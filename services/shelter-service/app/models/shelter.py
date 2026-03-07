"""
Shelter data model
"""
from typing import Optional, Dict, List
from pydantic import BaseModel, Field, field_validator
from bson import ObjectId


class PyObjectId(ObjectId):
    """Custom ObjectId type for Pydantic"""
    
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")


class LocationModel(BaseModel):
    """GeoJSON Point location"""
    type: str = "Point"
    coordinates: List[float]  # [longitude, latitude]


class ShelterModel(BaseModel):
    """Shelter document model for MongoDB"""
    
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    name: str = Field(..., description="Shelter name or address")
    address: str = Field(..., description="Street address")
    city: str = Field(default="Israel", description="City name")
    capacity: int = Field(default=50, description="Shelter capacity")
    accessible: bool = Field(default=True, description="Accessibility")
    type: str = Field(default="public_shelter", description="Shelter type")  # ← ДОБАВЛЕНО
    location: LocationModel = Field(..., description="GeoJSON Point")
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class ShelterResponse(BaseModel):
    """Schema for shelter API response"""
    
    id: str = Field(..., alias="_id")
    name: str
    address: str
    city: str
    capacity: int
    accessible: bool
    type: str
    latitude: float
    longitude: float
    
    @classmethod
    def from_mongo(cls, shelter: dict):
        """Convert MongoDB document to response model"""
        return cls(
            _id=str(shelter["_id"]),
            name=shelter.get("name") or "Unknown Shelter",
            address=shelter.get("address", "Unknown"),
            city=shelter.get("city", "Israel"),
            capacity=shelter.get("capacity", 50),
            accessible=shelter.get("accessible", True),
            type=shelter.get("type", "public_shelter"),
            latitude=shelter["location"]["coordinates"][1],
            longitude=shelter["location"]["coordinates"][0]
        )
    
    class Config:
        populate_by_name = True