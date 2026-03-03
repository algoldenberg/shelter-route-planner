import { useState, useEffect } from 'react';
import AddressSearch from './AddressSearch';
import './styles/RouteBuilder.css';

const RouteBuilder = ({ onCalculateRoute, loading, onClear, onSetMapClickMode, clickedPoints }) => {
  const [startLat, setStartLat] = useState('');
  const [startLon, setStartLon] = useState('');
  const [startAddress, setStartAddress] = useState('');
  
  const [endLat, setEndLat] = useState('');
  const [endLon, setEndLon] = useState('');
  const [endAddress, setEndAddress] = useState('');

  // Update fields when clicked points change
  useEffect(() => {
    if (clickedPoints?.start) {
      setStartLat(clickedPoints.start.latitude.toFixed(6));
      setStartLon(clickedPoints.start.longitude.toFixed(6));
      setStartAddress('Selected from map');
    }
  }, [clickedPoints?.start]);

  useEffect(() => {
    if (clickedPoints?.end) {
      setEndLat(clickedPoints.end.latitude.toFixed(6));
      setEndLon(clickedPoints.end.longitude.toFixed(6));
      setEndAddress('Selected from map');
    }
  }, [clickedPoints?.end]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!startLat || !startLon || !endLat || !endLon) {
      alert('Please set both start and end points');
      return;
    }

    onCalculateRoute({
      start: {
        latitude: parseFloat(startLat),
        longitude: parseFloat(startLon),
      },
      end: {
        latitude: parseFloat(endLat),
        longitude: parseFloat(endLon),
      },
    });
  };

  const handleStartAddressSelect = (location) => {
    setStartLat(location.latitude.toFixed(6));
    setStartLon(location.longitude.toFixed(6));
    setStartAddress(location.address);
  };

  const handleEndAddressSelect = (location) => {
    setEndLat(location.latitude.toFixed(6));
    setEndLon(location.longitude.toFixed(6));
    setEndAddress(location.address);
  };

  const handleUseCurrentLocation = (field) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (field === 'start') {
            setStartLat(position.coords.latitude.toFixed(6));
            setStartLon(position.coords.longitude.toFixed(6));
            setStartAddress('Current Location');
          } else {
            setEndLat(position.coords.latitude.toFixed(6));
            setEndLon(position.coords.longitude.toFixed(6));
            setEndAddress('Current Location');
          }
        },
        (error) => {
          alert('Unable to get your location: ' + error.message);
        }
      );
    }
  };

  return (
    <div className="route-builder">
      <h2 className="route-builder__title">🗺️ Plan Route</h2>
      
      <form onSubmit={handleSubmit} className="route-builder__form">
        {/* Start Point */}
        <div className="route-builder__section">
          <div className="route-builder__section-header">
            <label className="route-builder__section-label">📍 Start Point</label>
            <div className="route-builder__header-buttons">
              <button
                type="button"
                onClick={() => handleUseCurrentLocation('start')}
                className="route-builder__use-location-btn"
                title="Use current location"
              >
                📍
              </button>
              <button
                type="button"
                onClick={() => onSetMapClickMode && onSetMapClickMode('start')}
                className="route-builder__use-location-btn route-builder__use-location-btn--map"
                title="Click on map to set point"
              >
                🗺️
              </button>
            </div>
          </div>
          
          <AddressSearch
            label="Search Address:"
            onSelect={handleStartAddressSelect}
            initialValue={startAddress}
          />

          <div className="route-builder__coordinates">
            <div className="route-builder__input-group">
              <label className="route-builder__label">Lat:</label>
              <input
                type="number"
                step="0.000001"
                value={startLat}
                onChange={(e) => setStartLat(e.target.value)}
                className="route-builder__input route-builder__input--small"
                placeholder="32.0853"
              />
            </div>

            <div className="route-builder__input-group">
              <label className="route-builder__label">Lon:</label>
              <input
                type="number"
                step="0.000001"
                value={startLon}
                onChange={(e) => setStartLon(e.target.value)}
                className="route-builder__input route-builder__input--small"
                placeholder="34.7818"
              />
            </div>
          </div>
        </div>

        {/* End Point */}
        <div className="route-builder__section">
          <div className="route-builder__section-header">
            <label className="route-builder__section-label">🎯 End Point</label>
            <div className="route-builder__header-buttons">
              <button
                type="button"
                onClick={() => handleUseCurrentLocation('end')}
                className="route-builder__use-location-btn"
                title="Use current location"
              >
                📍
              </button>
              <button
                type="button"
                onClick={() => onSetMapClickMode && onSetMapClickMode('end')}
                className="route-builder__use-location-btn route-builder__use-location-btn--map"
                title="Click on map to set point"
              >
                🗺️
              </button>
            </div>
          </div>
          
          <AddressSearch
            label="Search Address:"
            onSelect={handleEndAddressSelect}
            initialValue={endAddress}
          />

          <div className="route-builder__coordinates">
            <div className="route-builder__input-group">
              <label className="route-builder__label">Lat:</label>
              <input
                type="number"
                step="0.000001"
                value={endLat}
                onChange={(e) => setEndLat(e.target.value)}
                className="route-builder__input route-builder__input--small"
                placeholder="32.0546"
              />
            </div>

            <div className="route-builder__input-group">
              <label className="route-builder__label">Lon:</label>
              <input
                type="number"
                step="0.000001"
                value={endLon}
                onChange={(e) => setEndLon(e.target.value)}
                className="route-builder__input route-builder__input--small"
                placeholder="34.7539"
              />
            </div>
          </div>
        </div>

        <div className="route-builder__button-group">
          <button 
            type="submit" 
            className="route-builder__button" 
            disabled={loading}
          >
            {loading ? 'Calculating...' : '🚶 Calculate Route'}
          </button>
          
          {onClear && (
            <button
              type="button"
              onClick={onClear}
              className="route-builder__button--secondary"
            >
              Clear Route
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default RouteBuilder;