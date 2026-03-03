"""
OpenStreetMap Overpass API client
Finds Points of Interest (parks, cafes, etc.)
"""
import httpx
from typing import List, Dict
from app.config import settings


class OSMClient:
    """Client for OpenStreetMap Overpass API"""
    
    def __init__(self):
        self.base_url = settings.overpass_url
    
    POI_QUERIES = {
        "park": '["leisure"="park"]',
        "cafe": '["amenity"="cafe"]',
        "restaurant": '["amenity"="restaurant"]',
        "museum": '["tourism"="museum"]',
        "viewpoint": '["tourism"="viewpoint"]',
        "playground": '["leisure"="playground"]',
        "garden": '["leisure"="garden"]',
    }
    
    async def find_pois(
        self,
        lat: float,
        lon: float,
        radius: int,
        poi_types: List[str]
    ) -> List[Dict]:
        """
        Find Points of Interest around a location
        
        Args:
            lat: Center latitude
            lon: Center longitude
            radius: Search radius in meters
            poi_types: List of POI types (park, cafe, restaurant, etc.)
        
        Returns:
            List of POI dictionaries with name, type, lat, lon
        """
        pois = []
        
        for poi_type in poi_types:
            if poi_type not in self.POI_QUERIES:
                continue
            
            query = self._build_overpass_query(lat, lon, radius, poi_type)
            
            try:
                async with httpx.AsyncClient() as client:
                    response = await client.post(
                        self.base_url,
                        data={"data": query},
                        timeout=30.0
                    )
                    
                    if response.status_code == 200:
                        data = response.json()
                        pois.extend(self._parse_overpass_response(data, poi_type))
            
            except Exception as e:
                print(f"OSM Overpass request failed for {poi_type}: {e}")
                continue
        
        return pois
    
    def _build_overpass_query(
        self,
        lat: float,
        lon: float,
        radius: int,
        poi_type: str
    ) -> str:
        """
        Build Overpass QL query
        """
        filter_query = self.POI_QUERIES.get(poi_type, "")
        
        query = f"""
        [out:json][timeout:25];
        (
          node{filter_query}(around:{radius},{lat},{lon});
          way{filter_query}(around:{radius},{lat},{lon});
        );
        out center;
        """
        
        return query
    
    def _parse_overpass_response(
        self,
        data: Dict,
        poi_type: str
    ) -> List[Dict]:
        """
        Parse Overpass API response
        """
        pois = []
        elements = data.get("elements", [])
        
        for element in elements:
            tags = element.get("tags", {})
            name = tags.get("name", f"Unnamed {poi_type}")
            
            if element["type"] == "node":
                lat = element.get("lat")
                lon = element.get("lon")
            elif element["type"] == "way" and "center" in element:
                lat = element["center"].get("lat")
                lon = element["center"].get("lon")
            else:
                continue
            
            if lat and lon:
                pois.append({
                    "name": name,
                    "type": poi_type,
                    "latitude": lat,
                    "longitude": lon
                })
        
        return pois