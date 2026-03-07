"""
Shelter Service - Main FastAPI application
Manages bomb shelter data and locations
"""
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from contextlib import asynccontextmanager
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

from app.config import settings
from app.db.mongodb import connect_to_mongo, close_mongo_connection
from app.api import shelters
from app.api import shelter_submissions
from app.api import shelter_reports
from app.api import admin
from app.middleware.usage_logging import UsageLoggingMiddleware
from app.services.stats_aggregator import StatsAggregator

# Global scheduler instance
scheduler = AsyncIOScheduler()


async def run_daily_aggregation():
    """
    Background task: aggregate usage statistics
    Runs daily at 03:00 UTC
    """
    try:
        print("⏰ Running scheduled daily stats aggregation...")
        aggregator = StatsAggregator()
        await aggregator.aggregate_daily_stats()
        
        # Cleanup old logs (older than 30 days)
        await aggregator.cleanup_old_logs(days=30)
        
        print("✅ Scheduled aggregation completed")
    except Exception as e:
        print(f"❌ Scheduled aggregation failed: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events"""
    # Startup
    await connect_to_mongo()
    
    # Start scheduler
    scheduler.add_job(
        run_daily_aggregation,
        trigger=CronTrigger(hour=3, minute=0),  # 03:00 UTC daily
        id="daily_stats_aggregation",
        name="Aggregate daily usage statistics",
        replace_existing=True
    )
    scheduler.start()
    print("✅ APScheduler started - daily aggregation at 03:00 UTC")
    
    yield
    
    # Shutdown
    scheduler.shutdown()
    await close_mongo_connection()


app = FastAPI(
    title="Shelter Service",
    description="Bomb shelter locations and information",
    version="1.0.0",
    lifespan=lifespan
)

# Add usage logging middleware
app.add_middleware(UsageLoggingMiddleware)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Log validation errors"""
    print("=== VALIDATION ERROR ===")
    print(f"URL: {request.url}")
    print(f"Method: {request.method}")
    print(f"Errors: {exc.errors()}")
    print(f"Body: {await request.body()}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors()},
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

app.include_router(
    shelter_reports.router,
    prefix="/shelters",
    tags=["shelter_reports"]
)

app.include_router(
    admin.router,
    tags=["admin"]
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


@app.post("/admin/trigger-aggregation")
async def trigger_manual_aggregation():
    """
    Manual trigger for stats aggregation (for testing)
    Protected endpoint - add auth in production!
    """
    await run_daily_aggregation()
    return {"message": "Aggregation triggered manually"}