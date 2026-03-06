"""
Shelter Service - Main FastAPI application
Manages bomb shelter data and locations
"""
from fastapi import FastAPI
from contextlib import asynccontextmanager

from app.config import settings
from app.db.mongodb import connect_to_mongo, close_mongo_connection
from app.api import shelters
from app.api import shelter_submissions


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events"""
    await connect_to_mongo()
    yield
    await close_mongo_connection()


app = FastAPI(
    title="Shelter Service",
    description="Bomb shelter locations and information",
    version="1.0.0",
    lifespan=lifespan
)

app.include_router(
    shelters.router,
    prefix="/shelters",
    tags=["shelters"]
)

app.include_router(
    shelter_submissions.router,
    prefix="/shelters",
    tags=["shelter_submissions"]
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