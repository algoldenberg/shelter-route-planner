"""
Walking Route Service - Main FastAPI application
Handles circular walking routes with POIs and shelters
"""
from fastapi import FastAPI
from contextlib import asynccontextmanager
from motor.motor_asyncio import AsyncIOMotorClient

from app.config import settings
from app.api import walking_routes


mongodb_client: AsyncIOMotorClient = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager"""
    global mongodb_client
    
    mongodb_client = AsyncIOMotorClient(settings.mongodb_url)
    walking_routes.set_db_client(mongodb_client)
    print(f"✅ Connected to MongoDB at {settings.mongo_host}:{settings.mongo_port}")
    
    yield
    
    if mongodb_client:
        mongodb_client.close()
        print("❌ Closed MongoDB connection")


app = FastAPI(
    title="Walking Route Service",
    description="Calculate circular walking routes with POIs and shelters",
    version="1.0.0",
    lifespan=lifespan
)

app.include_router(
    walking_routes.router,
    prefix="/walking-route",
    tags=["walking-routes"]
)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": settings.service_name,
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}