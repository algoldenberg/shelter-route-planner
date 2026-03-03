const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

/**
 * Search address and get coordinates
 * @param {string} query - Address query
 * @returns {Promise<Array>} - Array of results with coordinates
 */
export const searchAddress = async (query) => {
  if (!query || query.trim().length < 3) {
    return [];
  }

  try {
    const response = await fetch(
      `${NOMINATIM_BASE_URL}/search?` +
      new URLSearchParams({
        q: query,
        format: 'json',
        countrycodes: 'il', // Israel only
        limit: '5',
        addressdetails: '1'
      }),
      {
        headers: {
          'User-Agent': 'ShelterRoutePlanner/1.0'
        }
      }
    );

    const data = await response.json();
    
    return data.map(result => ({
      display_name: result.display_name,
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      address: result.address
    }));
  } catch (error) {
    console.error('Geocoding error:', error);
    return [];
  }
};

/**
 * Reverse geocode: coordinates to address
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<string>} - Address string
 */
export const reverseGeocode = async (latitude, longitude) => {
  try {
    const response = await fetch(
      `${NOMINATIM_BASE_URL}/reverse?` +
      new URLSearchParams({
        lat: latitude.toString(),
        lon: longitude.toString(),
        format: 'json',
        addressdetails: '1'
      }),
      {
        headers: {
          'User-Agent': 'ShelterRoutePlanner/1.0'
        }
      }
    );

    const data = await response.json();
    
    if (data.display_name) {
      return data.display_name;
    }
    
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  }
};