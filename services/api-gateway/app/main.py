"""
API Gateway - Entry point for all microservices
Routes requests to appropriate services
"""
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import httpx

from app.config import settings

app = FastAPI(
    title="Shelter Route Planner - API Gateway",
    description="Single entry point for all microservices",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": settings.service_name,
        "version": "1.0.0",
        "status": "running",
        "available_services": [
            "shelter-service",
            "route-service",
            "comment-service",
        ]
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    services_health = {}
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{settings.shelter_service_url}/health", timeout=5.0)
            services_health["shelter-service"] = "healthy" if response.status_code == 200 else "unhealthy"
        except Exception:
            services_health["shelter-service"] = "unreachable"
        
        try:
            response = await client.get(f"{settings.route_service_url}/health", timeout=5.0)
            services_health["route-service"] = "healthy" if response.status_code == 200 else "unhealthy"
        except Exception:
            services_health["route-service"] = "unreachable"
        
        try:
            response = await client.get(f"{settings.comment_service_url}/health", timeout=5.0)
            services_health["comment-service"] = "healthy" if response.status_code == 200 else "unhealthy"
        except Exception:
            services_health["comment-service"] = "unreachable"
    
    overall_status = "healthy" if all(s == "healthy" for s in services_health.values()) else "degraded"
    
    return {
        "status": overall_status,
        "services": services_health
    }


@app.api_route("/shelters/{shelter_id}/comments", methods=["GET", "POST"])
@app.api_route("/shelters/{shelter_id}/comments/{path:path}", methods=["GET", "PUT", "DELETE"])
async def proxy_shelter_comments(shelter_id: str, request: Request, path: str = ""):
    """
    Proxy requests for shelter comments
    """
    if path:
        target_url = f"{settings.comment_service_url}/api/v1/shelters/{shelter_id}/comments/{path}"
    else:
        target_url = f"{settings.comment_service_url}/api/v1/shelters/{shelter_id}/comments"
    
    query_params = dict(request.query_params)
    headers = dict(request.headers)
    headers.pop("host", None)
    
    async with httpx.AsyncClient() as client:
        try:
            if request.method == "GET":
                response = await client.get(target_url, params=query_params, headers=headers, timeout=30.0)
            elif request.method == "POST":
                body = await request.body()
                response = await client.post(target_url, content=body, params=query_params, headers=headers, timeout=30.0)
            elif request.method == "PUT":
                body = await request.body()
                response = await client.put(target_url, content=body, params=query_params, headers=headers, timeout=30.0)
            elif request.method == "DELETE":
                response = await client.delete(target_url, params=query_params, headers=headers, timeout=30.0)
            else:
                raise HTTPException(status_code=405, detail="Method not allowed")
            
            return JSONResponse(
                content=response.json() if response.text else {},
                status_code=response.status_code,
                headers=dict(response.headers)
            )
        
        except httpx.TimeoutException:
            raise HTTPException(status_code=504, detail="Service timeout")
        except httpx.RequestError as e:
            raise HTTPException(status_code=503, detail=f"Service unavailable: {str(e)}")