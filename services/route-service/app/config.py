"""
Configuration settings for Route Service
"""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings"""
    
    service_name: str = "route-service"
    service_port: int = 8002
    
    api_prefix: str = "/api/v1"
    
    mongo_host: str = "mongodb"
    mongo_port: int = 27017
    mongo_db: str = "shelter_planner"
    mongo_username: str = "admin"
    mongo_password: str = "changeme123"
    
    redis_host: str = "redis"
    redis_port: int = 6379
    
    osrm_url: str = "http://osrm-backend:5000"
    
    shelter_search_radius: int = 500
    
    class Config:
        env_file = ".env"
        case_sensitive = False

    @property
    def mongodb_url(self) -> str:
        """Generate MongoDB connection URL"""
        return f"mongodb://{self.mongo_username}:{self.mongo_password}@{self.mongo_host}:{self.mongo_port}"


settings = Settings()