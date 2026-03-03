"""
Walking Route API endpoints
"""
from fastapi import APIRouter, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
import httpx
from geopy.distance import geodesic

from app.models.walking_route import CircularRouteRequest, CircularRouteResponse
from app.services.osm_client import OSMClient
from app.services.poi_finder import POIFinder
from app.config import settings

router = APIRouter()

mongodb_client: AsyncIOMotorClient = None


def set_db_client(client: AsyncIOMotorClient):
    """Set MongoDB client"""
    global mongodb_client
    mongodb_client = client


@router.post("/circular", response_model=CircularRouteResponse)
async def calculate_circular_route(route_request: CircularRouteRequest):
    """
    Calculate circular walking route with POIs and shelters
    
    Algorithm:
    1. Generate circular waypoints based on desired distance
    2. Find POIs (parks, cafes, etc.) near waypoints
    3. Find shelters near waypoints
    4. Build route through selected POIs
    5. Calculate total distance and duration
    """
    if not mongodb_client:
        raise HTTPException(status_code=503, detail="Database not available")
    
    poi_finder = POIFinder(mongodb_client)
    
    waypoints = poi_finder.generate_circular_waypoints(
        start_lat=route_request.start.latitude,
        start_lon=route_request.start.longitude,
        distance_km=route_request.distance_km,
        num_points=8
    )
    
    pois_found = []
    if route_request.preferences:
        osm_client = OSMClient()
        all_pois = await osm_client.find_pois(
            lat=route_request.start.latitude,
            lon=route_request.start.longitude,
            radius=settings.poi_search_radius,
            poi_types=route_request.preferences
        )
        
        pois_found = poi_finder.select_best_pois(
            pois=all_pois,
            waypoints=waypoints,
            max_pois=route_request.max_pois
        )
    
    shelters = []
    if route_request.include_shelters:
        shelters = await poi_finder.find_shelters_near_waypoints(
            waypoints=waypoints,
            max_shelters=5
        )
    
    route_geometry = []
    for lat, lon in waypoints:
        route_geometry.append([lon, lat])
    
    total_distance = 0.0
    for i in range(len(waypoints) - 1):
        segment_distance = geodesic(waypoints[i], waypoints[i + 1]).meters
        total_distance += segment_distance
    
    walking_speed_ms = 1.4
    estimated_duration = total_distance / walking_speed_ms
    
    for i, poi in enumerate(pois_found):
        poi_coord = (poi.latitude, poi.longitude)
        distance_from_start = geodesic(
            (route_request.start.latitude, route_request.start.longitude),
            poi_coord
        ).meters
        pois_found[i].distance_from_start = round(distance_from_start, 1)
    
    for i, shelter in enumerate(shelters):
        shelter_coord = (shelter.latitude, shelter.longitude)
        distance_from_start = geodesic(
            (route_request.start.latitude, route_request.start.longitude),
            shelter_coord
        ).meters
        shelters[i].distance_from_start = round(distance_from_start, 1)
    
    return CircularRouteResponse(
        total_distance=round(total_distance, 1),
        estimated_duration=round(estimated_duration, 1),
        geometry=route_geometry,
        pois=pois_found,
        shelters=shelters
    )


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "walking-route-service"}