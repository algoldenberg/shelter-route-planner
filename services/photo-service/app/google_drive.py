import os
import io
from datetime import datetime
from typing import Optional
from dotenv import load_dotenv
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload
from googleapiclient.errors import HttpError

# Load environment variables
load_dotenv()

# Google Drive API setup
SCOPES = ['https://www.googleapis.com/auth/drive.file']
TOKEN_FILE = '/app/credentials/token.json'

# Root folder ID in your personal Google Drive
ROOT_FOLDER_ID = os.getenv('GOOGLE_DRIVE_ROOT_FOLDER_ID', '1OE2WH64cw7j7QMFHsijQXXvI92kpqtRC')


class GoogleDriveManager:
    """Manager for Google Drive operations using OAuth 2.0"""
    
    def __init__(self):
        """Initialize Google Drive API client with OAuth token"""
        try:
            # Load OAuth token
            if not os.path.exists(TOKEN_FILE):
                raise FileNotFoundError(f"OAuth token not found: {TOKEN_FILE}")
            
            creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)
            
            # Refresh token if expired
            if creds and creds.expired and creds.refresh_token:
                print("🔄 Refreshing OAuth token...")
                creds.refresh(Request())
                # Save refreshed token
                with open(TOKEN_FILE, 'w') as token:
                    token.write(creds.to_json())
            
            self.service = build('drive', 'v3', credentials=creds)
            self.folder_ids = {}
            self._ensure_folder_structure()
            print("✅ Google Drive initialized with OAuth")
        except Exception as e:
            print(f"❌ Error initializing Google Drive: {e}")
            raise
    
    def _ensure_folder_structure(self):
        """Ensure folder structure exists in Google Drive"""
        try:
            # Use your shared folder as root
            self.folder_ids['root'] = ROOT_FOLDER_ID
            
            # Create subfolders inside YOUR shelter-photos folder
            for category in ['comments', 'reports', 'submissions']:
                folder_id = self._get_or_create_folder(category, parent_id=ROOT_FOLDER_ID)
                self.folder_ids[category] = folder_id
                
            print(f"✅ Google Drive folder structure ready: {self.folder_ids}")
        except Exception as e:
            print(f"❌ Error ensuring folder structure: {e}")
            raise
    
    def _get_or_create_folder(self, folder_name: str, parent_id: str) -> str:
        """Get existing folder ID or create new folder in parent"""
        try:
            # Search for existing folder inside parent
            query = f"name='{folder_name}' and mimeType='application/vnd.google-apps.folder' and trashed=false and '{parent_id}' in parents"
            
            results = self.service.files().list(
                q=query,
                spaces='drive',
                fields='files(id, name)'
            ).execute()
            
            files = results.get('files', [])
            
            if files:
                print(f"📁 Found existing folder: {folder_name} (ID: {files[0]['id']})")
                return files[0]['id']
            
            # Create new folder inside parent
            file_metadata = {
                'name': folder_name,
                'mimeType': 'application/vnd.google-apps.folder',
                'parents': [parent_id]
            }
            
            folder = self.service.files().create(
                body=file_metadata,
                fields='id'
            ).execute()
            
            print(f"📁 Created new folder: {folder_name} (ID: {folder['id']})")
            return folder['id']
            
        except HttpError as error:
            print(f"❌ Error getting/creating folder {folder_name}: {error}")
            raise
    
    def upload_photo(
        self, 
        file_content: bytes, 
        file_name: str, 
        category: str,
        mime_type: str = 'image/jpeg'
    ) -> dict:
        """
        Upload photo to Google Drive
        
        Args:
            file_content: Photo file bytes
            file_name: Original filename
            category: 'comments', 'reports', or 'submissions'
            mime_type: MIME type of the file
        
        Returns:
            dict with photo_id, photo_url, thumbnail_url, etc.
        """
        try:
            # Get folder ID for category
            folder_id = self.folder_ids.get(category)
            if not folder_id:
                raise ValueError(f"Invalid category: {category}")
            
            # Generate unique filename with timestamp
            timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
            unique_filename = f"{timestamp}_{file_name}"
            
            # Prepare file metadata - upload to YOUR folder
            file_metadata = {
                'name': unique_filename,
                'parents': [folder_id]
            }
            
            # Upload file
            media = MediaIoBaseUpload(
                io.BytesIO(file_content),
                mimetype=mime_type,
                resumable=True
            )
            
            file = self.service.files().create(
                body=file_metadata,
                media_body=media,
                fields='id, name, size, mimeType, createdTime, webViewLink, webContentLink'
            ).execute()
            
            # Make file publicly readable
            self.service.permissions().create(
                fileId=file['id'],
                body={'type': 'anyone', 'role': 'reader'}
            ).execute()
            
            # Generate thumbnail URL (Google Drive automatic thumbnail)
            thumbnail_url = f"https://drive.google.com/thumbnail?id={file['id']}&sz=w400"
            
            # Direct download link
            photo_url = f"https://drive.google.com/uc?export=view&id={file['id']}"
            
            print(f"✅ Uploaded photo: {unique_filename} (ID: {file['id']})")
            
            return {
                'photo_id': file['id'],
                'photo_url': photo_url,
                'thumbnail_url': thumbnail_url,
                'file_name': unique_filename,
                'file_size': int(file.get('size', 0)),
                'mime_type': file.get('mimeType', mime_type),
                'uploaded_at': file.get('createdTime', datetime.utcnow().isoformat())
            }
            
        except HttpError as error:
            print(f"❌ Error uploading photo: {error}")
            raise
    
    def delete_photo(self, photo_id: str) -> bool:
        """Delete photo from Google Drive"""
        try:
            self.service.files().delete(fileId=photo_id).execute()
            print(f"✅ Deleted photo: {photo_id}")
            return True
        except HttpError as error:
            print(f"❌ Error deleting photo {photo_id}: {error}")
            return False
    
    def get_photo_url(self, photo_id: str) -> Optional[str]:
        """Get direct URL for photo"""
        try:
            return f"https://drive.google.com/uc?export=view&id={photo_id}"
        except Exception as e:
            print(f"❌ Error getting photo URL: {e}")
            return None


# Global instance
drive_manager = GoogleDriveManager()