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
    }
  }, [clickedPoints.end]);

  const handleUseMyLocation = () => {
    setEditingStart(false);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          setStartCoords(coords);
          setStartAddress('Your location');
          setUseCurrentLocation(true);
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Could not get your location');
        }
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
    if (onClear) onClear();
  };

  return (
    <div className="route-builder">
      <h2>🗺️ Plan Route</h2>

      {/* Start Point */}
      <div className="route-point">
        <div className="point-indicator start">●</div>
        <div className="point-content">
          {useCurrentLocation && !editingStart ? (
            <>
              <input
                type="text"
                value="Your location"
                readOnly
                className="location-input"
                onClick={() => {
                  setEditingStart(true);
                  setStartAddress(''); // ← Автоочистка
                  setUseCurrentLocation(false);
                }}
                style={{ cursor: 'pointer' }}
              />
              <button 
                onClick={handleUseMyLocation}
                className="btn-icon"
                title="Use my location"
              >
                📍
              </button>
            </>
          ) : (
            <>
              <AddressSearch
                onSelect={(result) => {
                  console.log('🟢 Start selected:', result);
                  setStartAddress(result.address);
                  setStartCoords({ latitude: result.latitude, longitude: result.longitude });
                  setUseCurrentLocation(false);
                  setEditingStart(false);
                  console.log('📍 Start coords set:', { latitude: result.latitude, longitude: result.longitude });
                }}
                placeholder="Start point"
                initialValue={startAddress}
              />
              <button 
                onClick={handleUseMyLocation}
                className="btn-icon"
                title="Use my location"
              >
                📍
              </button>
            </>
          )}
        </div>
      </div>

      {/* End Point */}
      <div className="route-point">
        <div className="point-indicator end">●</div>
        <div className="point-content">
          {endAddress === 'Your location' ? (
            <>
              <input
                type="text"
                value="Your location"
                readOnly
                className="location-input"
                onClick={() => {
                  setEndAddress('');
                }}
                style={{ cursor: 'pointer' }}
              />
              <button 
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      (position) => {
                        const coords = {
                          latitude: position.coords.latitude,
                          longitude: position.coords.longitude
                        };
                        setEndCoords(coords);
                        setEndAddress('Your location');
                      },
                      (error) => {
                        console.error('Geolocation error:', error);
                        alert('Could not get your location');
                      }
                    );
                  }
                }}
                className="btn-icon"
                title="Use my location as destination"
              >
                📍
              </button>
            </>
          ) : (
            <>
              <AddressSearch
                onSelect={(result) => {
                  console.log('🎯 End selected:', result);
                  setEndAddress(result.address);
                  setEndCoords({ latitude: result.latitude, longitude: result.longitude });
                  console.log('📍 End coords set:', { latitude: result.latitude, longitude: result.longitude });
                }}
                placeholder="Choose destination"
                initialValue={endAddress}
              />
              <button 
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      (position) => {
                        const coords = {
                          latitude: position.coords.latitude,
                          longitude: position.coords.longitude
                        };
                        setEndCoords(coords);
                        setEndAddress('Your location');
                      },
                      (error) => {
                        console.error('Geolocation error:', error);
                        alert('Could not get your location');
                      }
                    );
                  }
                }}
                className="btn-icon"
                title="Use my location as destination"
              >
                📍
              </button>
            </>
          )}
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
            Clear
          </button>
        )}
      </div>
    </div>
  );
};

export default RouteBuilder;