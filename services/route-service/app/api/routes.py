"""
Route API endpoints
"""
from fastapi import APIRouter, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
from app.models.route import RouteRequest, RouteResponse
from app.services.osrm_client import OSRMClient
from app.services.shelter_finder import ShelterFinder

router = APIRouter()

mongodb_client: AsyncIOMotorClient = None


def set_db_client(client: AsyncIOMotorClient):
    """Set MongoDB client for route calculations"""
    global mongodb_client
    mongodb_client = client


@router.post("/calculate", response_model=RouteResponse)
async def calculate_route(route_request: RouteRequest):
    """
    Calculate route from start to end with shelters along the way
    
    Algorithm:
    1. Get base route from OSRM (A -> B)
    2. Find shelters within buffer zone of route
    3. Return route with shelter waypoints
    """
    osrm = OSRMClient()
    
    route_data = await osrm.get_route(
        start_lon=route_request.start.longitude,
        start_lat=route_request.start.latitude,
        end_lon=route_request.end.longitude,
        end_lat=route_request.end.latitude
    )
    
    if not route_data:
        raise HTTPException(status_code=400, detail="Could not calculate route")
    
    geometry = osrm.parse_route_geometry(route_data)
    distance, duration = osrm.get_route_metadata(route_data)
    
    # Recalculate duration for walking (average walking speed: 1.4 m/s)
    walking_speed_ms = 1.4
    duration = distance / walking_speed_ms
    
    shelters = []
    if route_request.include_shelters and mongodb_client:
        shelter_finder = ShelterFinder(mongodb_client)
        shelters = await shelter_finder.find_shelters_along_route(
            route_coordinates=geometry,
            max_shelters=route_request.max_shelters
        )
    
    return RouteResponse(
        distance=distance,
        duration=duration,
        geometry=geometry,
        shelters=shelters,
        total_shelters=len(shelters)
    )


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "route-service"}