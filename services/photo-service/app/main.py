from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from typing import Optional
import uvicorn
import io

from models import PhotoUploadResponse
from google_drive import drive_manager

app = FastAPI(
    title="Photo Service API",
    description="Photo upload service using Google Drive",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "photo-service",
        "status": "running",
        "version": "1.0.0"
    }


@app.post("/upload", response_model=PhotoUploadResponse)
async def upload_photo(
    file: UploadFile = File(...),
    category: str = Form(...),
    related_id: Optional[str] = Form(None)
):
    """
    Upload photo to Google Drive
    
    Args:
        file: Photo file (jpeg, png, webp)
        category: 'comment', 'report', or 'submission'
        related_id: Optional ID of related entity (comment/report/submission)
    
    Returns:
        PhotoUploadResponse with photo_id, urls, etc.
    """
    try:
        # Validate category
        valid_categories = ['comment', 'report', 'submission']
        if category not in valid_categories:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid category: {category}. Must be 'comment', 'report', or 'submission'"
            )
        
        # Convert to plural form for Google Drive folder mapping
        category_mapping = {
            'comment': 'comments',
            'report': 'reports',
            'submission': 'submissions'
        }
        drive_category = category_mapping[category]
        
        # Validate file type
        allowed_types = ['image/jpeg', 'image/png', 'image/webp']
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type: {file.content_type}. Allowed: {allowed_types}"
            )
        
        # Read file content
        file_content = await file.read()
        
        # Check file size (max 10MB)
        max_size = 10 * 1024 * 1024  # 10MB
        if len(file_content) > max_size:
            raise HTTPException(
                status_code=400,
                detail=f"File too large. Max size: 10MB"
            )
        
        # Upload to Google Drive
        result = drive_manager.upload_photo(
            file_content=file_content,
            file_name=file.filename,
            category=drive_category,
            mime_type=file.content_type
        )
        
        return PhotoUploadResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error uploading photo: {e}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@app.get("/proxy/{file_id}")
async def proxy_photo(file_id: str):
    """
    Proxy endpoint для отдачи фото из Google Drive
    Решает проблемы CORS и rate limits
    
    Args:
        file_id: Google Drive file ID
        
    Returns:
        StreamingResponse with photo content
    """
    try:
        # Скачиваем файл из Google Drive
        file_content = drive_manager.download_photo(file_id)
        
        if not file_content:
            raise HTTPException(status_code=404, detail="Photo not found")
        
        # Определяем MIME type (по умолчанию jpeg)
        mime_type = "image/jpeg"
        
        # Отдаём как streaming response с правильными headers
        return StreamingResponse(
            io.BytesIO(file_content),
            media_type=mime_type,
            headers={
                "Cache-Control": "public, max-age=86400",  # Кэш на 24 часа
                "Access-Control-Allow-Origin": "*"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error proxying photo {file_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to proxy photo: {str(e)}")


@app.delete("/photo/{photo_id}")
async def delete_photo(photo_id: str):
    """Delete photo from Google Drive"""
    try:
        success = drive_manager.delete_photo(photo_id)
        if success:
            return {"message": f"Photo {photo_id} deleted successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to delete photo")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/photo/{photo_id}/url")
async def get_photo_url(photo_id: str):
    """Get direct URL for photo"""
    try:
        url = drive_manager.get_photo_url(photo_id)
        if url:
            return {"photo_url": url}
        else:
            raise HTTPException(status_code=404, detail="Photo not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=18005)