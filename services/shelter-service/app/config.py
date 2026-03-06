"""
Configuration settings for shelter service
"""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings"""
    service_name: str = "Shelter Service"
    
    # MongoDB settings
    mongo_host: str = "localhost"
    mongo_port: int = 27017
    mongo_db: str = "shelter_planner"
    mongo_username: str = "admin"
    mongo_password: str = "changeme123"
    
    # Redis settings
    redis_host: str = "localhost"
    redis_port: int = 6379
    
    # hCaptcha settings
    hcaptcha_secret_key: str = ""  
    
    class Config:
        env_file = ".env"
    
    @property
    def mongodb_url(self) -> str:
        """Construct MongoDB connection URL"""
        return f"mongodb://{self.mongo_username}:{self.mongo_password}@{self.mongo_host}:{self.mongo_port}"


settings = Settings()