from pydantic import BaseModel
from typing import Optional

class PhotoUploadResponse(BaseModel):
    """Response after uploading photo to Google Drive"""
    photo_id: str
    photo_url: str
    thumbnail_url: str
    file_name: str
    uploaded_at: str

class PhotoMetadata(BaseModel):
    """Metadata for photo stored in MongoDB"""
    photo_id: str
    photo_url: str
    thumbnail_url: str
    file_name: str
    file_size: int
    mime_type: str
    uploaded_at: str
    category: str  # 'comment', 'report', 'submission'
    related_id: Optional[str] = None  # ID комментария/репорта/миклата