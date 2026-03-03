"""
Configuration settings for Walking Route Service
"""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings"""
    
    service_name: str = "walking-route-service"
    service_port: int = 8004
    
    api_prefix: str = "/api/v1"
    
    mongo_host: str = "mongodb"
    mongo_port: int = 27017
    mongo_db: str = "shelter_planner"
    mongo_username: str = "admin"
    mongo_password: str = "changeme123"
    
    osrm_url: str = "http://router.project-osrm.org"
    overpass_url: str = "https://overpass-api.de/api/interpreter"
    
    shelter_search_radius: int = 200
    poi_search_radius: int = 1000
    
    class Config:
        env_file = ".env"
        case_sensitive = False

    @property
    def mongodb_url(self) -> str:
        """Generate MongoDB connection URL"""
        return f"mongodb://{self.mongo_username}:{self.mongo_password}@{self.mongo_host}:{self.mongo_port}"


settings = Settings()