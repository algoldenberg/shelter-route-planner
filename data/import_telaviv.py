#!/usr/bin/env python3
"""
Import Tel Aviv shelters with smart deduplication
- Updates existing shelters within 50m radius
- Adds new ones if not found
- Preserves comments and user data
"""
import json
from pymongo import MongoClient
from math import radians, cos, sin, asin, sqrt
from datetime import datetime

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
    
    # Load new Tel Aviv data
    with open('telaviv_shelters.json', 'r', encoding='utf-8') as f:
        telaviv_shelters = json.load(f)
    
    print(f"{'='*60}")
    print(f"TEL AVIV SHELTERS IMPORT")
    print(f"{'='*60}")
    print(f"Loaded {len(telaviv_shelters)} Tel Aviv shelters from JSON\n")
    
    # Get existing shelters in Tel Aviv area (approx bounds)
    # Tel Aviv: lat 32.0-32.15, lon 34.74-34.85
    existing_shelters = list(shelters_collection.find({
        'location.coordinates.0': {'$gte': 34.74, '$lte': 34.85},
        'location.coordinates.1': {'$gte': 32.0, '$lte': 32.15}
    }))
    
    print(f"Found {len(existing_shelters)} existing shelters in Tel Aviv area\n")
    
    stats = {
        'updated': 0,
        'added': 0,
        'skipped': 0
    }
    
    # Fields to update (preserve user data like comments)
    UPDATE_FIELDS = ['name', 'address', 'city', 'location', 'type', 'capacity', 'accessible']
    
    for new_shelter in telaviv_shelters:
        duplicate, distance = find_duplicate(new_shelter, existing_shelters)
        
        if duplicate:
            # Build update with only specific fields
            update_data = {field: new_shelter[field] for field in UPDATE_FIELDS if field in new_shelter}
            update_data['updated_at'] = datetime.utcnow()
            update_data['source'] = 'telaviv_kml_2024'
            
            # Update coordinates with more accurate data
            result = shelters_collection.update_one(
                {'_id': duplicate['_id']},
                {'$set': update_data}
            )
            
            if result.modified_count > 0:
                stats['updated'] += 1
                old_type = duplicate.get('type', 'unknown')
                new_type = new_shelter.get('type', 'unknown')
                print(f"✓ Updated: {new_shelter['name'][:50]}")
                print(f"  Distance: {distance:.1f}m | Type: {old_type} → {new_type}")
            else:
                stats['skipped'] += 1
        else:
            # Add new shelter
            new_shelter['created_at'] = datetime.utcnow()
            new_shelter['source'] = 'telaviv_kml_2024'
            shelters_collection.insert_one(new_shelter)
            stats['added'] += 1
            print(f"+ Added: {new_shelter['name'][:50]} | Type: {new_shelter.get('type', 'unknown')}")
    
    print("\n" + "="*60)
    print(f"TEL AVIV IMPORT COMPLETE")
    print(f"Updated: {stats['updated']}")
    print(f"Added: {stats['added']}")
    print(f"Skipped: {stats['skipped']} (no changes)")
    print(f"Total: {stats['updated'] + stats['added']}")
    print("="*60)

if __name__ == '__main__':
    main()