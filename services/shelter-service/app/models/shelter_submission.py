"""
Shelter Submission data models
"""
from typing import Optional
from datetime import datetime
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


class ShelterSubmissionCreate(BaseModel):
    """Schema for creating a new shelter submission"""
    name: str = Field(..., min_length=3, max_length=200)
    address: str = Field(..., min_length=5, max_length=500)
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    type: str = Field(..., description="public_shelter, private_building, underground_parking, other")
    capacity: Optional[int] = Field(None, ge=1)
    comment: Optional[str] = Field(None, max_length=1000)
    captcha_token: str  # ← ДОБАВЛЕНА ЭТА СТРОКА


class ShelterSubmissionResponse(BaseModel):
    """Schema for shelter submission API response"""
    id: str = Field(..., alias="_id")
    name: str
    address: str
    latitude: float
    longitude: float
    type: str
    capacity: Optional[int]
    comment: Optional[str]
    status: str  # pending, approved, rejected
    submitted_at: datetime
    submitted_by_ip: Optional[str]
    reviewed_at: Optional[datetime]
    reviewed_by: Optional[str]

    class Config:
        populate_by_name = True