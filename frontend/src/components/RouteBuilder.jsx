import { useState, useEffect } from 'react';
import AddressSearch from './AddressSearch';
import './styles/RouteBuilder.css';

const RouteBuilder = ({ 
  onCalculateRoute, 
  loading, 
  onClear,
  onSetMapClickMode,
  clickedPoints 
}) => {
  const [startAddress, setStartAddress] = useState('');
  const [endAddress, setEndAddress] = useState('');
  const [startCoords, setStartCoords] = useState(null);
  const [endCoords, setEndCoords] = useState(null);
  const [useCurrentLocation, setUseCurrentLocation] = useState(true);
  const [editingStart, setEditingStart] = useState(false);
  const [editingEnd, setEditingEnd] = useState(false);
  const [loadingStartLocation, setLoadingStartLocation] = useState(false);
  const [loadingEndLocation, setLoadingEndLocation] = useState(false);

  // Format address to show only street, city
  const formatAddress = (fullAddress) => {
    if (!fullAddress) return '';
    if (fullAddress === 'Your location' || fullAddress === 'Selected from map') {
      return fullAddress;
    }
    
    const parts = fullAddress.split(',').map(p => p.trim());
    if (parts.length >= 2) {
      return `${parts[0]}, ${parts[1]}`;
    }
    return parts[0] || fullAddress;
  };

  // Update from clicked points
  useEffect(() => {
    if (clickedPoints.start) {
      setStartCoords(clickedPoints.start);
      setStartAddress('Selected from map');
      setUseCurrentLocation(false);
      setEditingStart(false);
    }
  }, [clickedPoints.start]);

  useEffect(() => {
    if (clickedPoints.end) {
      setEndCoords(clickedPoints.end);
      setEndAddress('Selected from map');
      setEditingEnd(false);
    }
  }, [clickedPoints.end]);

  const handleUseMyLocationStart = () => {
    if (navigator.geolocation) {
      setLoadingStartLocation(true);
      
      // Fast initial position
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          setStartCoords(coords);
          setStartAddress('Your location');
          setUseCurrentLocation(true);
          setEditingStart(false);
          setLoadingStartLocation(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Could not get your location');
          setLoadingStartLocation(false);
        },
        { enableHighAccuracy: false, timeout: 2000, maximumAge: 60000 }
      );
    }
  };

  const handleUseMyLocationEnd = () => {
    if (navigator.geolocation) {
      setLoadingEndLocation(true);
      
      // Fast initial position
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          setEndCoords(coords);
          setEndAddress('Your location');
          setEditingEnd(false);
          setLoadingEndLocation(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Could not get your location');
          setLoadingEndLocation(false);
        },
        { enableHighAccuracy: false, timeout: 2000, maximumAge: 60000 }
      );
    }
  };

  const handleCalculate = () => {
    console.log('🚀 Calculate clicked:', { startCoords, endCoords });
    if (!startCoords || !endCoords) {
      alert('Please select both start and end points');
      return;
    }

    onCalculateRoute({
      start: startCoords,
      end: endCoords
    });
  };

  const handleClear = () => {
    setStartAddress('');
    setEndAddress('');
    setStartCoords(null);
    setEndCoords(null);
    setUseCurrentLocation(false);
    setEditingStart(false);
    setEditingEnd(false);
    if (onClear) onClear();
  };

  return (
    <div className="route-builder">
      <h2>🗺️ Plan Route</h2>

      {/* Start Point */}
      <div className="route-point">
        <div className="point-indicator start">●</div>
        <div className="point-content">
          {startAddress && !editingStart ? (
            <div className="address-display">
              <input
                type="text"
                value={formatAddress(startAddress)}
                readOnly
                className="location-input location-input--filled"
                title={startAddress}
              />
              <button
                onClick={() => {
                  setStartAddress('');
                  setStartCoords(null);
                  setUseCurrentLocation(false);
                  setEditingStart(true);
                }}
                className="btn-clear-input"
                title="Clear"
              >
                ✕
              </button>
            </div>
          ) : (
            <>
              <AddressSearch
                onSelect={(result) => {
                  console.log('🟢 Start selected:', result);
                  setStartAddress(result.address);
                  setStartCoords({ latitude: result.latitude, longitude: result.longitude });
                  setUseCurrentLocation(false);
                  setEditingStart(false);
                }}
                placeholder="Start point"
                initialValue=""
              />
            </>
          )}
          <button 
            onClick={handleUseMyLocationStart}
            className="btn-icon"
            title="Use my location"
            disabled={loadingStartLocation}
          >
            {loadingStartLocation ? '⏳' : '📍'}
          </button>
        </div>
      </div>

      {/* End Point */}
      <div className="route-point">
        <div className="point-indicator end">●</div>
        <div className="point-content">
          {endAddress && !editingEnd ? (
            <div className="address-display">
              <input
                type="text"
                value={formatAddress(endAddress)}
                readOnly
                className="location-input location-input--filled"
                title={endAddress}
              />
              <button
                onClick={() => {
                  setEndAddress('');
                  setEndCoords(null);
                  setEditingEnd(true);
                }}
                className="btn-clear-input"
                title="Clear"
              >
                ✕
              </button>
            </div>
          ) : (
            <>
              <AddressSearch
                onSelect={(result) => {
                  console.log('🎯 End selected:', result);
                  setEndAddress(result.address);
                  setEndCoords({ latitude: result.latitude, longitude: result.longitude });
                  setEditingEnd(false);
                }}
                placeholder="Choose destination"
                initialValue=""
              />
            </>
          )}
          <button 
            onClick={handleUseMyLocationEnd}
            className="btn-icon"
            title="Use my location as destination"
            disabled={loadingEndLocation}
          >
            {loadingEndLocation ? '⏳' : '📍'}
          </button>
          <button
            onClick={() => onSetMapClickMode && onSetMapClickMode('end')}
            className="btn-icon"
            title="Select on map"
          >
            🗺️
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="route-actions">
        <button
          onClick={handleCalculate}
          disabled={!startCoords || !endCoords || loading}
          className="btn-calculate"
        >
          {loading ? '⏳ Calculating...' : '🚀 Calculate Route'}
        </button>

        {(startCoords || endCoords) && (
          <button onClick={handleClear} className="btn-clear-simple">
            Clear All
          </button>
        )}
      </div>
    </div>
  );
};

export default RouteBuilder;