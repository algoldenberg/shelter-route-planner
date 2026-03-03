"""
POI Finder - finds POIs and creates circular route
"""
from typing import List, Tuple
from motor.motor_asyncio import AsyncIOMotorClient
from geopy.distance import geodesic
import math
from app.config import settings
from app.models.walking_route import POI, Shelter


class POIFinder:
    """Find POIs and shelters for circular routes"""
    
    def __init__(self, db_client: AsyncIOMotorClient):
        self.db = db_client[settings.mongo_db]
        self.shelters_collection = self.db["shelters"]
    
    def generate_circular_waypoints(
        self,
        start_lat: float,
        start_lon: float,
        distance_km: float,
        num_points: int = 8
    ) -> List[Tuple[float, float]]:
        """
        Generate waypoints for a circular route
        
        Args:
            start_lat: Starting latitude
            start_lon: Starting longitude
            distance_km: Desired total distance
            num_points: Number of waypoints
        
        Returns:
            List of (lat, lon) tuples forming a circle
        """
        radius_km = distance_km / (2 * math.pi)
        
        waypoints = [(start_lat, start_lon)]
        
        for i in range(1, num_points):
            angle = (2 * math.pi * i) / num_points
            
            lat_offset = radius_km * math.cos(angle) / 111.32
            lon_offset = radius_km * math.sin(angle) / (111.32 * math.cos(math.radians(start_lat)))
            
            waypoint_lat = start_lat + lat_offset
            waypoint_lon = start_lon + lon_offset
            
            waypoints.append((waypoint_lat, waypoint_lon))
        
        waypoints.append((start_lat, start_lon))
        
        return waypoints
    
    def select_best_pois(
        self,
        pois: List[dict],
        waypoints: List[Tuple[float, float]],
        max_pois: int
    ) -> List[POI]:
        """
        Select POIs closest to the circular route waypoints
        """
        if not pois:
            return []
        
        scored_pois = []
        
        for poi in pois:
            poi_coord = (poi["latitude"], poi["longitude"])
            
            min_distance = float('inf')
            for waypoint in waypoints:
                distance = geodesic(waypoint, poi_coord).meters
                min_distance = min(min_distance, distance)
            
            scored_pois.append((min_distance, poi))
        
        scored_pois.sort(key=lambda x: x[0])
        
        selected_pois = []
        for _, poi in scored_pois[:max_pois]:
            selected_pois.append(POI(
                name=poi["name"],
                type=poi["type"],
                latitude=poi["latitude"],
                longitude=poi["longitude"]
            ))
        
        return selected_pois
    
    async def find_shelters_near_waypoints(
        self,
        waypoints: List[Tuple[float, float]],
        max_shelters: int = 5
    ) -> List[Shelter]:
        """
        Find shelters near circular route waypoints
        """
        shelters_found = []
        seen_shelter_ids = set()
        
        for lat, lon in waypoints[::2]:
            query = {
                "location": {
                    "$near": {
                        "$geometry": {
                            "type": "Point",
                            "coordinates": [lon, lat]
                        },
                        "$maxDistance": settings.shelter_search_radius
                    }
                }
            }
            
            nearby_shelters = await self.shelters_collection.find(query).limit(2).to_list(2)
            
            for shelter_doc in nearby_shelters:
                shelter_id = str(shelter_doc["_id"])
                
                if shelter_id in seen_shelter_ids:
                    continue
                
                seen_shelter_ids.add(shelter_id)
                
                shelters_found.append(Shelter(
                    id=shelter_id,
                    name=shelter_doc.get("name", "Unknown"),
                    latitude=shelter_doc["latitude"],
                    longitude=shelter_doc["longitude"]
                ))
                
                if len(shelters_found) >= max_shelters:
                    break
            
            if len(shelters_found) >= max_shelters:
                break
        
        return shelters_found