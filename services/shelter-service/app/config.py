"""
Configuration settings for Shelter Service
"""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings"""
    
    # MongoDB settings
    mongo_host: str = "mongodb"
    mongo_port: int = 27017
    mongo_db: str = "shelter_planner"
    mongo_username: str = "admin"
    mongo_password: str = "changeme123"
    
    # Service settings
    service_name: str = "shelter-service"
    service_port: int = 8001
    
    # API settings
    api_prefix: str = "/api/v1"
    
    class Config:
        env_file = ".env"
        case_sensitive = False

    @property
    def mongodb_url(self) -> str:
        """Generate MongoDB connection URL"""
        return f"mongodb://{self.mongo_username}:{self.mongo_password}@{self.mongo_host}:{self.mongo_port}"


# Global settings instance
settings = Settings()