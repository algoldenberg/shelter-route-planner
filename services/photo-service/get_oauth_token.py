#!/usr/bin/env python3
"""
Script to obtain OAuth 2.0 refresh token for Google Drive API.
Run this ONCE on your local machine to get the token, then save it to token.json
"""

import os
import json
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials

# Scopes required for Google Drive
SCOPES = ['https://www.googleapis.com/auth/drive.file']

# Path to OAuth credentials
CREDENTIALS_FILE = 'credentials/oauth-credentials.json'
TOKEN_FILE = 'credentials/token.json'


def get_oauth_token():
    """
    Obtain OAuth 2.0 token by running local authorization flow.
    This will open a browser window for you to authorize the app.
    """
    creds = None
    
    # Check if token already exists
    if os.path.exists(TOKEN_FILE):
        print(f"✅ Token file already exists: {TOKEN_FILE}")
        creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)
    
    # If no valid credentials, run OAuth flow
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            print("🔄 Refreshing expired token...")
            creds.refresh(Request())
        else:
            print("🔐 Starting OAuth authorization flow...")
            print("A browser window will open. Please authorize the app.")
            
            flow = InstalledAppFlow.from_client_secrets_file(
                CREDENTIALS_FILE, SCOPES
            )
            
            # Run local server on port 8080
            creds = flow.run_local_server(port=8080)
        
        # Save token for future use
        with open(TOKEN_FILE, 'w') as token:
            token.write(creds.to_json())
        
        print(f"✅ Token saved to: {TOKEN_FILE}")
    
    print("\n" + "="*60)
    print("✅ SUCCESS! OAuth token obtained.")
    print("="*60)
    print(f"\nToken file location: {os.path.abspath(TOKEN_FILE)}")
    print("\nYou can now:")
    print("1. Upload this token.json file to your server")
    print("2. Place it in services/photo-service/credentials/")
    print("3. Rebuild and restart the photo-service container")
    print("\n" + "="*60)
    
    return creds


if __name__ == '__main__':
    get_oauth_token()