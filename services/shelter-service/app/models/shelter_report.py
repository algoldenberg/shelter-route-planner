"""
Shelter Report data models
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


class ShelterReportCreate(BaseModel):
    """Schema for creating a new shelter report"""
    issue_type: str = Field(..., description="closed, wrong_address, blocked_entrance, other")
    comment: str = Field(..., min_length=5, max_length=1000)
    contact: Optional[str] = Field(None, max_length=100)


class ShelterReportResponse(BaseModel):
    """Schema for shelter report API response"""
    id: str = Field(..., alias="_id")
    shelter_id: str
    issue_type: str
    comment: str
    contact: Optional[str]
    status: str  # pending, reviewed, resolved
    reported_at: datetime
    reporter_ip: Optional[str]

    class Config:
        populate_by_name = True