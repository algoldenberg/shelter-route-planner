import { useState, useEffect } from 'react';
import AddressSearch from './AddressSearch';
import './styles/ShelterSearch.css';

const ShelterSearch = ({ 
  onSearch, 
  loading,
  currentLocation,
  showSearchHere,
  onSearchHere
}) => {
  const [searchAddress, setSearchAddress] = useState('');
  const [searchCoords, setSearchCoords] = useState(null);
  const [editingLocation, setEditingLocation] = useState(false);

  // Format address to show only street, city
  const formatAddress = (fullAddress) => {
    if (!fullAddress) return '';
    if (fullAddress === 'Your location' || fullAddress === 'Current location') {
      return fullAddress;
    }
    
    const parts = fullAddress.split(',').map(p => p.trim());
    if (parts.length >= 2) {
      return `${parts[0]}, ${parts[1]}`;
    }
    return parts[0] || fullAddress;
  };

  const handleSearch = () => {
    if (!searchCoords) {
      alert('Please select a location');
      return;
    }

    onSearch({
      latitude: searchCoords.latitude,
      longitude: searchCoords.longitude,
      radius: 1000 // Fixed radius
    });
  };

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          setSearchCoords(coords);
          setSearchAddress('Your location');
          setEditingLocation(false);
          
          // Auto-search
          onSearch({
            latitude: coords.latitude,
            longitude: coords.longitude,
            radius: 1000
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Could not get your location');
        },
        { enableHighAccuracy: false, timeout: 2000, maximumAge: 60000 }
      );
    }
  };

  // Set initial location from currentLocation prop
  useEffect(() => {
    if (currentLocation && !searchCoords) {
      setSearchCoords({
        latitude: currentLocation[0],
        longitude: currentLocation[1]
      });
      setSearchAddress('Current location');
    }
  }, [currentLocation, searchCoords]);

  return (
    <div className="shelter-search">
      <h2>🔍 Find Nearby Shelters</h2>

      {/* Location Input */}
      <div className="search-location">
        <label>Location:</label>
        <div className="location-input-group">
          {searchAddress && !editingLocation ? (
            <div className="address-display">
              <input
                type="text"
                value={formatAddress(searchAddress)}
                readOnly
                className="location-input location-input--filled"
                onClick={() => setEditingLocation(true)}
                title={searchAddress}
                style={{ cursor: 'pointer' }}
              />
              <button
                onClick={() => {
                  setSearchAddress('');
                  setSearchCoords(null);
                  setEditingLocation(true);
                }}
                className="btn-clear-text"
                title="Clear"
              >
                Clear
              </button>
            </div>
          ) : (
            <AddressSearch
              onSelect={(result) => {
                setSearchAddress(result.address);
                setSearchCoords({ latitude: result.latitude, longitude: result.longitude });
                setEditingLocation(false);
              }}
              placeholder="Enter address or place"
              initialValue=""
            />
          )}
          <button 
            onClick={handleUseMyLocation}
            className="btn-icon"
            title="Use my location"
          >
            📍
          </button>
        </div>
      </div>

      {/* Search Buttons */}
      <div className="search-actions">
        <button
          onClick={handleSearch}
          disabled={!searchCoords || loading}
          className="btn-search"
        >
          {loading ? '⏳ Searching...' : '🔍 Search Shelters'}
        </button>

        {showSearchHere && (
          <button
            onClick={onSearchHere}
            className="btn-search-here"
          >
            📍 Search Here
          </button>
        )}
      </div>
    </div>
  );
};

export default ShelterSearch;