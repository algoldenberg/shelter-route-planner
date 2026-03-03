"""
Shelter data model
"""
from typing import Optional
from pydantic import BaseModel, Field
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


class ShelterModel(BaseModel):
    """Shelter document model"""
    
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    name: str = Field(..., description="Shelter name or address")
    street: Optional[str] = Field(None, description="Street address in Hebrew")
    latitude: float = Field(..., ge=-90, le=90, description="Latitude coordinate")
    longitude: float = Field(..., ge=-180, le=180, description="Longitude coordinate")
    distance_to_shelter: Optional[float] = Field(None, description="Distance to shelter in meters")
    color: Optional[str] = Field(None, description="Marker color (green/orange)")
    original_id: Optional[int] = Field(None, description="Original ID from source data")
    type: str = Field(default="public_shelter", description="Shelter type")
    source: str = Field(default="Public Shelters in Israel - Google My Maps")
    source_url: str = Field(default="https://t.me/+w1e0O207iQkxYTcy")
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        json_schema_extra = {
            "example": {
                "name": "0 0",
                "street": "בועז 22",
                "latitude": 32.0493326915678,
                "longitude": 34.7952310321176,
                "distance_to_shelter": 28.0,
                "color": "green",
                "original_id": 121,
                "type": "public_shelter"
            }
        }


class ShelterCreate(BaseModel):
    """Schema for creating a new shelter"""
    
    name: str
    street: Optional[str] = None
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    distance_to_shelter: Optional[float] = None
    color: Optional[str] = None
    type: str = "public_shelter"


class ShelterResponse(BaseModel):
    """Schema for shelter API response"""
    
    id: str = Field(..., alias="_id")
    name: str
    street: Optional[str] = None
    latitude: float
    longitude: float
    distance_to_shelter: Optional[float] = None
    color: Optional[str] = None
    type: str
    
    class Config:
        populate_by_name = True