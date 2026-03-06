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
    hcaptcha_secret_key: str 
    
    class Config:
        env_file = ".env"


settings = Settings()