"""
Route Service - Main FastAPI application
Handles route calculation with shelter waypoints
"""
from fastapi import FastAPI
from contextlib import asynccontextmanager
from motor.motor_asyncio import AsyncIOMotorClient

from app.config import settings
from app.api import routes


mongodb_client: AsyncIOMotorClient = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events"""
    global mongodb_client
    
    mongodb_client = AsyncIOMotorClient(settings.mongodb_url)
    routes.set_db_client(mongodb_client)
    print(f"✅ Connected to MongoDB at {settings.mongo_host}:{settings.mongo_port}")
    
    yield
    
    if mongodb_client:
        mongodb_client.close()
        print("❌ Closed MongoDB connection")


app = FastAPI(
    title="Route Service",
    description="Calculate routes with shelter waypoints",
    version="1.0.0",
    lifespan=lifespan
)

app.include_router(
    routes.router,
    prefix="/route",
    tags=["routes"]
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