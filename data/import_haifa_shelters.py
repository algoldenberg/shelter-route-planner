#!/usr/bin/env python3
"""
Import Haifa shelters with smart deduplication
- Updates existing shelters within 50m radius
- Adds new ones if not found
"""
import json
from pymongo import MongoClient
from math import radians, cos, sin, asin, sqrt

def haversine(lon1, lat1, lon2, lat2):
    """Calculate distance between two points in meters"""
    lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    r = 6371000  # Earth radius in meters
    return c * r

def find_duplicate(new_shelter, existing_shelters, max_distance=50):
    """Find if shelter exists within max_distance meters"""
    new_lon, new_lat = new_shelter['location']['coordinates']
    
    for shelter in existing_shelters:
        if 'location' not in shelter or 'coordinates' not in shelter['location']:
            continue
        
        old_lon, old_lat = shelter['location']['coordinates']
        distance = haversine(new_lon, new_lat, old_lon, old_lat)
        
        if distance <= max_distance:
            return shelter, distance
    
    return None, None

def main():
    # MongoDB connection
    client = MongoClient('mongodb://admin:changeme123@localhost:27017/')
    db = client['shelter_planner']
    shelters_collection = db['shelters']
    
    # Load new Haifa data
    with open('data/haifa_shelters.json', 'r', encoding='utf-8') as f:
        haifa_shelters = json.load(f)
    
    print(f"Loaded {len(haifa_shelters)} Haifa shelters from JSON")
    
    # Get existing shelters in Haifa area (approx bounds)
    # Haifa: lat 32.7-32.9, lon 34.9-35.1
    existing_shelters = list(shelters_collection.find({
        'location.coordinates.0': {'$gte': 34.9, '$lte': 35.1},
        'location.coordinates.1': {'$gte': 32.7, '$lte': 32.9}
    }))
    
    print(f"Found {len(existing_shelters)} existing shelters in Haifa area")
    
    stats = {
        'updated': 0,
        'added': 0,
        'skipped': 0
    }
    
    for new_shelter in haifa_shelters:
        duplicate, distance = find_duplicate(new_shelter, existing_shelters)
        
        if duplicate:
            # Update coordinates with more accurate data
            result = shelters_collection.update_one(
                {'_id': duplicate['_id']},
                {'$set': {
                    'name': new_shelter['name'],
                    'address': new_shelter['address'],
                    'location': new_shelter['location']
                }}
            )
            if result.modified_count > 0:
                stats['updated'] += 1
                print(f"✓ Updated: {new_shelter['name']} (was {distance:.1f}m away)")
            else:
                stats['skipped'] += 1
        else:
            # Add new shelter
            shelters_collection.insert_one(new_shelter)
            stats['added'] += 1
            print(f"+ Added: {new_shelter['name']}")
    
    print("\n" + "="*50)
    print(f"Import complete!")
    print(f"Updated: {stats['updated']}")
    print(f"Added: {stats['added']}")
    print(f"Skipped: {stats['skipped']}")
    print(f"Total: {stats['updated'] + stats['added']}")

if __name__ == '__main__':
    main()