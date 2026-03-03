# Data Directory

## Files

### `shelters_data.json`
Contains shelter data for Israel (12,234 shelters when full dataset is loaded).

**Data Structure**:
```json
{
  "name": "Shelter name or address",
  "street": "Street address in Hebrew",
  "latitude": 32.0853,
  "longitude": 34.7818,
  "distance_to_shelter": 50.0,
  "color": "green",
  "original_id": 1,
  "type": "public_shelter",
  "source": "Public Shelters in Israel - Google My Maps",
  "source_url": "https://t.me/+w1e0O207iQkxYTcy"
}
```

### `load_shelters.py`
Python script to load shelter data into MongoDB with geospatial indexes.

**Usage**:
```bash
# Make sure MongoDB is running
docker-compose up -d mongodb

# Install dependencies
pip install motor

# Run script
python data/load_shelters.py
```

## Data Source

**Public Shelters in Israel**  
- Google My Maps: https://maps.app.goo.gl/Kf5x3LqHqiKh4vPM6
- Telegram: https://t.me/+w1e0O207iQkxYTcy
- Original format: KML (converted to JSON)

## Geospatial Indexing

The script automatically creates a `2dsphere` index on the `location` field for fast geospatial queries (finding nearby shelters).