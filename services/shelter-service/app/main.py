"""
Shelter Service - Main FastAPI application
Handles CRUD operations for bomb shelters in Israel
"""
from fastapi import FastAPI
from contextlib import asynccontextmanager

from app.config import settings
from app.db.mongodb import connect_to_mongo, close_mongo_connection
from app.api import shelters


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events
    """
    # Startup: Connect to MongoDB
    await connect_to_mongo()
    yield
    # Shutdown: Close MongoDB connection
    await close_mongo_connection()


# Create FastAPI app
app = FastAPI(
    title="Shelter Service",
    description="CRUD operations for bomb shelters in Israel",
    version="1.0.0",
    lifespan=lifespan
)

# Include routers
app.include_router(
    shelters.router,
    prefix=f"{settings.api_prefix}/shelters",
    tags=["shelters"]
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