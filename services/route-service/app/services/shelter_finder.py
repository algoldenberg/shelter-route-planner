"""
Shelter Finder - finds shelters along a route
"""
from typing import List, Tuple
from motor.motor_asyncio import AsyncIOMotorClient
from geopy.distance import geodesic
from app.config import settings
from app.models.route import ShelterOnRoute


class ShelterFinder:
    """Find shelters along a route"""
    
    def __init__(self, db_client: AsyncIOMotorClient):
        self.db = db_client[settings.mongo_db]
        self.shelters_collection = self.db["shelters"]
    
    async def find_shelters_along_route(
        self,
        route_coordinates: List[List[float]],
        max_shelters: int = 10,
        search_radius: int = None
    ) -> List[ShelterOnRoute]:
        """
        Find shelters within buffer zone of route
        
        Args:
            route_coordinates: List of [lon, lat] coordinates forming the route
            max_shelters: Maximum number of shelters to return
            search_radius: Search radius in meters (default from config)
        
        Returns:
            List of shelters along the route
        """
        if not route_coordinates:
            return []
        
        radius = search_radius or settings.shelter_search_radius
        
        shelters_found = []
        seen_shelter_ids = set()
        
        sample_rate = max(1, len(route_coordinates) // 10)
        
        for i, coord in enumerate(route_coordinates):
            if i % sample_rate != 0 and i != len(route_coordinates) - 1:
                continue
            
            lon, lat = coord[0], coord[1]
            
            query = {
                "location": {
                    "$near": {
                        "$geometry": {
                            "type": "Point",
                            "coordinates": [lon, lat]
                        },
                        "$maxDistance": radius
                    }
                }
            }
            
            nearby_shelters = await self.shelters_collection.find(query).limit(5).to_list(5)
            
            for shelter in nearby_shelters:
                shelter_id = str(shelter["_id"])
                
                if shelter_id in seen_shelter_ids:
                    continue
                
                seen_shelter_ids.add(shelter_id)
                
                # Extract coordinates from GeoJSON structure
                shelter_lon = shelter["location"]["coordinates"][0]
                shelter_lat = shelter["location"]["coordinates"][1]
                
                distance_from_start = self._calculate_distance_along_route(
                    route_coordinates,
                    [shelter_lon, shelter_lat]
                )
                
                shelter_on_route = ShelterOnRoute(
                    id=shelter_id,
                    name=shelter.get("name") or "Unknown Shelter",
                    street=shelter.get("address") or "Unknown",
                    latitude=shelter_lat,
                    longitude=shelter_lon,
                    distance_from_start=distance_from_start,
                    type=shelter.get("type") or "public_shelter"
                )
                
                shelters_found.append(shelter_on_route)
                
                if len(shelters_found) >= max_shelters:
                    break
            
            if len(shelters_found) >= max_shelters:
                break
        
        shelters_found.sort(key=lambda s: s.distance_from_start)
        
        return shelters_found[:max_shelters]
    
    def _calculate_distance_along_route(
        self,
        route_coordinates: List[List[float]],
        point: List[float]
    ) -> float:
        """
        Calculate approximate distance from route start to nearest point on route
        
        Args:
            route_coordinates: Route geometry
            point: [lon, lat] of shelter
        
        Returns:
            Distance in meters from route start
        """
        if not route_coordinates:
            return 0.0
        
        min_distance = float('inf')
        closest_index = 0
        
        for i, coord in enumerate(route_coordinates):
            distance = geodesic(
                (coord[1], coord[0]),
                (point[1], point[0])
            ).meters
            
            if distance < min_distance:
                min_distance = distance
                closest_index = i
        
        distance_along_route = 0.0
        for i in range(closest_index):
            if i + 1 < len(route_coordinates):
                segment_distance = geodesic(
                    (route_coordinates[i][1], route_coordinates[i][0]),
                    (route_coordinates[i + 1][1], route_coordinates[i + 1][0])
                ).meters
                distance_along_route += segment_distance
        
        return round(distance_along_route, 1)