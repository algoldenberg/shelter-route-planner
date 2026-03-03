"""
Comment data models
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


class CommentCreate(BaseModel):
    """Schema for creating a new comment"""
    
    username: str = Field(default="Anonymous", max_length=50)
    comment: str = Field(..., min_length=1, max_length=500)
    rating: int = Field(..., ge=1, le=5, description="Rating from 1 to 5 stars")


class CommentModel(BaseModel):
    """Comment document model"""
    
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    shelter_id: str = Field(..., description="Shelter ObjectId")
    username: str = Field(default="Anonymous")
    comment: str
    rating: int = Field(..., ge=1, le=5)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class CommentResponse(BaseModel):
    """Schema for comment API response"""
    
    id: str = Field(..., alias="_id")
    shelter_id: str
    username: str
    comment: str
    rating: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        populate_by_name = True


class CommentUpdate(BaseModel):
    """Schema for updating a comment"""
    
    comment: Optional[str] = Field(None, min_length=1, max_length=500)
    rating: Optional[int] = Field(None, ge=1, le=5)