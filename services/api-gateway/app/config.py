"""
Configuration settings for API Gateway
"""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings"""
    
    service_name: str = "api-gateway"
    service_port: int = 8000
    
    api_prefix: str = "/api/v1"
    
    shelter_service_url: str = "http://shelter-service:8001"
    route_service_url: str = "http://route-service:8002"
    comment_service_url: str = "http://comment-service:8003"
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()