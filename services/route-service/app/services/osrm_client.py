"""
OSRM (Open Source Routing Machine) client
Handles route calculation between coordinates
"""
import httpx
from typing import List, Tuple, Optional
from app.config import settings


class OSRMClient:
    """Client for OSRM routing service"""
    
    def __init__(self):
        self.base_url = settings.osrm_url
    
    async def get_route(
        self,
        start_lon: float,
        start_lat: float,
        end_lon: float,
        end_lat: float,
        overview: str = "full"
    ) -> Optional[dict]:
        """
        Get route between two points
        
        Args:
            start_lon: Starting longitude
            start_lat: Starting latitude
            end_lon: Ending longitude
            end_lat: Ending latitude
            overview: Geometry detail level (simplified, full, false)
        
        Returns:
            Route data with geometry, distance, duration
        """
        url = f"{self.base_url}/route/v1/foot/{start_lon},{start_lat};{end_lon},{end_lat}"
        
        params = {
            "overview": overview,
            "geometries": "geojson",
            "steps": "false"
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(url, params=params, timeout=30.0)
                response.raise_for_status()
                data = response.json()
                
                if data.get("code") != "Ok":
                    return None
                
                return data
            
            except Exception as e:
                print(f"OSRM request failed: {e}")
                return None
    
    def parse_route_geometry(self, route_data: dict) -> List[List[float]]:
        """
        Extract route geometry coordinates from OSRM response
        
        Returns:
            List of [longitude, latitude] coordinates
        """
        if not route_data or "routes" not in route_data:
            return []
        
        routes = route_data.get("routes", [])
        if not routes:
            return []
        
        geometry = routes[0].get("geometry", {})
        coordinates = geometry.get("coordinates", [])
        
        return coordinates
    
    def get_route_metadata(self, route_data: dict) -> Tuple[float, float]:
        """
        Extract distance and duration from OSRM response
        
        Returns:
            Tuple of (distance_meters, duration_seconds)
        """
        if not route_data or "routes" not in route_data:
            return 0.0, 0.0
        
        routes = route_data.get("routes", [])
        if not routes:
            return 0.0, 0.0
        
        route = routes[0]
        distance = route.get("distance", 0.0)
        duration = route.get("duration", 0.0)
        
        return distance, duration