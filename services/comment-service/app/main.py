"""
Comment Service - Main FastAPI application
Handles user comments and ratings for shelters
"""
from fastapi import FastAPI
from contextlib import asynccontextmanager

from app.config import settings
from app.db.mongodb import connect_to_mongo, close_mongo_connection
from app.api import comments


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events"""
    await connect_to_mongo()
    yield
    await close_mongo_connection()


app = FastAPI(
    title="Comment Service",
    description="User comments and ratings for bomb shelters",
    version="1.0.0",
    lifespan=lifespan
)

app.include_router(
    comments.router,
    prefix="/shelters",
    tags=["comments"]
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