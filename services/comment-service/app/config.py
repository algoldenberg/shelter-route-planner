"""
Configuration settings for Comment Service
"""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings"""
    
    service_name: str = "comment-service"
    service_port: int = 8003
    
    api_prefix: str = "/api/v1"
    
    mongo_host: str = "mongodb"
    mongo_port: int = 27017
    mongo_db: str = "shelter_planner"
    mongo_username: str = "admin"
    mongo_password: str = "changeme123"
    
    max_comment_length: int = 500
    max_comments_per_hour: int = 5
    
    class Config:
        env_file = ".env"
        case_sensitive = False

    @property
    def mongodb_url(self) -> str:
        """Generate MongoDB connection URL"""
        return f"mongodb://{self.mongo_username}:{self.mongo_password}@{self.mongo_host}:{self.mongo_port}"


settings = Settings()