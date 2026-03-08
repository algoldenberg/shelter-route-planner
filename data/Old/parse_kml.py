"""
Parse KML file and convert to JSON for MongoDB import
"""
import xml.etree.ElementTree as ET
import json
from pathlib import Path


def parse_kml(kml_file):
    """Parse KML file and extract shelter data"""
    
    tree = ET.parse(kml_file)
    root = tree.getroot()
    
    ns = {'kml': 'http://www.opengis.net/kml/2.2'}
    
    shelters = []
    
    for placemark in root.findall('.//kml:Placemark', ns):
        shelter = {}
        
        name_elem = placemark.find('kml:name', ns)
        if name_elem is not None:
            shelter['name'] = name_elem.text or ""
        
        point = placemark.find('.//kml:Point/kml:coordinates', ns)
        if point is not None:
            coords = point.text.strip().split(',')
            if len(coords) >= 2:
                shelter['longitude'] = float(coords[0])
                shelter['latitude'] = float(coords[1])
        
        extended_data = placemark.find('kml:ExtendedData', ns)
        if extended_data is not None:
            for data in extended_data.findall('kml:Data', ns):
                name_attr = data.get('name')
                value_elem = data.find('kml:value', ns)
                
                if value_elem is not None and value_elem.text:
                    value = value_elem.text
                    
                    if name_attr == 'street':
                        shelter['street'] = value
                    elif name_attr == 'distance2shelter':
                        try:
                            shelter['distance_to_shelter'] = float(value)
                        except ValueError:
                            pass
                    elif name_attr == 'color':
                        shelter['color'] = value
                    elif name_attr == 'id':
                        try:
                            shelter['original_id'] = int(float(value))
                        except ValueError:
                            pass
        
        shelter['type'] = 'public_shelter'
        shelter['source'] = 'Public Shelters in Israel - Google My Maps'
        shelter['source_url'] = 'https://t.me/+w1e0O207iQkxYTcy'
        
        if 'latitude' in shelter and 'longitude' in shelter:
            shelter['location'] = {
                "type": "Point",
                "coordinates": [shelter['longitude'], shelter['latitude']]
            }
            shelters.append(shelter)
    
    return shelters


def main():
    kml_file = Path(__file__).parent / 'Public_Shelters_in_Israel.kml'
    
    print(f"Parsing KML file: {kml_file}")
    shelters = parse_kml(kml_file)
    
    print(f"Found {len(shelters)} shelters")
    
    output_file = Path(__file__).parent / 'shelters_full.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(shelters, f, ensure_ascii=False, indent=2)
    
    print(f"Saved to {output_file}")
    
    if shelters:
        print(f"\nSample shelter:")
        print(json.dumps(shelters[0], ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()