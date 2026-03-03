import { useState, useEffect } from 'react';
import Map from './components/Map';
import SearchBar from './components/SearchBar';
import RouteBuilder from './components/RouteBuilder';
import { getNearbyShelters, calculateRoute } from './services/api';
import { reverseGeocode } from './services/geocoding';
import './App.css';

function App() {
  const [shelters, setShelters] = useState([]);
  const [center, setCenter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, radius: 0 });
  const [locationLoaded, setLocationLoaded] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  
  // Route state
  const [routeData, setRouteData] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('shelters');
  
  // Map click mode state
  const [mapClickMode, setMapClickMode] = useState(null); // 'start', 'end', or null
  const [clickedPoints, setClickedPoints] = useState({ start: null, end: null });

  // Auto-load user location on first mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLon = position.coords.longitude;
          setCenter([userLat, userLon]);
          setLocationLoaded(true);
          setMapReady(true);
          handleSearch({ latitude: userLat, longitude: userLon, radius: 1000 });
        },
        (error) => {
          console.warn('Geolocation error:', error.message);
          setCenter([32.0853, 34.7818]);
          setLocationLoaded(false);
          setMapReady(true);
          handleSearch({ latitude: 32.0853, longitude: 34.7818, radius: 1000 });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      setCenter([32.0853, 34.7818]);
      setLocationLoaded(false);
      setMapReady(true);
      handleSearch({ latitude: 32.0853, longitude: 34.7818, radius: 1000 });
    }
  }, []);

  const handleSearch = async ({ latitude, longitude, radius }) => {
    setLoading(true);
    try {
      const data = await getNearbyShelters(latitude, longitude, radius, 50);
      setShelters(data);
      setCenter([latitude, longitude]);
      setStats({ total: data.length, radius });
    } catch (error) {
      console.error('Error fetching shelters:', error);
      alert('Failed to fetch shelters. Make sure the API is running on http://localhost:8000');
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateRoute = async ({ start, end }) => {
    setRouteLoading(true);
    try {
      const data = await calculateRoute(start, end, true, 50);
      
      setRouteData({
        ...data,
        start,
        end
      });
      
      setShelters([]);
      
    } catch (error) {
      console.error('Error calculating route:', error);
      alert('Failed to calculate route. Make sure the API is running on http://localhost:8000');
    } finally {
      setRouteLoading(false);
    }
  };

  const handleClearRoute = () => {
    setRouteData(null);
    setClickedPoints({ start: null, end: null });
    setActiveTab('shelters');
    if (center) {
      handleSearch({ latitude: center[0], longitude: center[1], radius: 1000 });
    }
  };

  const handleMapClick = async (lat, lng, mode) => {
    const newPoint = { latitude: lat, longitude: lng };
    
    // Update clicked points
    if (mode === 'start') {
      setClickedPoints(prev => ({ ...prev, start: newPoint }));
    } else if (mode === 'end') {
      setClickedPoints(prev => ({ ...prev, end: newPoint }));
    }
    
    // Clear mode after setting
    setMapClickMode(null);
  };

  const handleMarkerClick = (shelter) => {
    console.log('Shelter clicked:', shelter);
  };

  if (!mapReady || !center) {
    return (
      <div className="app">
        <header className="app-header">
          <h1>🛡️ Shelter Route Planner</h1>
          <p>Find safe routes through bomb shelters in Israel</p>
        </header>
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.2rem',
          color: '#666'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📍</div>
            <div>Getting your location...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🛡️ Shelter Route Planner</h1>
        <p>Find safe routes through bomb shelters in Israel</p>
      </header>

      <div className="app-container">
        <aside className="sidebar">
          {/* Tab Navigation */}
          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'shelters' ? 'tab--active' : ''}`}
              onClick={() => setActiveTab('shelters')}
            >
              🔍 Find Shelters
            </button>
            <button 
              className={`tab ${activeTab === 'route' ? 'tab--active' : ''}`}
              onClick={() => setActiveTab('route')}
            >
              🗺️ Plan Route
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'shelters' && (
            <>
              <SearchBar onSearch={handleSearch} loading={loading} />
              
              <div className="stats">
                <h3>📊 Search Results</h3>
                <p><strong>{stats.total}</strong> shelters found</p>
                <p>within <strong>{stats.radius}m</strong> radius</p>
                {locationLoaded && <p style={{ fontSize: '0.85rem', marginTop: '8px', color: '#4CAF50' }}>
                  📍 Showing shelters near you
                </p>}
              </div>
            </>
          )}

          {activeTab === 'route' && (
            <>
              <RouteBuilder 
                onCalculateRoute={handleCalculateRoute} 
                loading={routeLoading}
                onClear={routeData ? handleClearRoute : null}
                onSetMapClickMode={setMapClickMode}
                clickedPoints={clickedPoints}
              />
              
              {routeData && (
                <div className="route-info">
                  <h3>📍 Route Information</h3>
                  <p><strong>Distance:</strong> {(routeData.distance / 1000).toFixed(2)} km</p>
                  <p><strong>Walking time:</strong> {Math.round(routeData.duration / 60)} minutes</p>
                  <p><strong>Shelters along route:</strong> {routeData.total_shelters}</p>
                </div>
              )}
            </>
          )}

          <div className="info">
            <h3>ℹ️ About</h3>
            <p><strong>12,234 shelters</strong> across Israel</p>
            <p>Data source: <a href="https://t.me/+w1e0O207iQkxYTcy" target="_blank" rel="noopener noreferrer">Public Shelters in Israel</a></p>
          </div>
        </aside>

        <main className="map-container">
          <Map
            center={center}
            zoom={15}
            shelters={shelters}
            onMarkerClick={handleMarkerClick}
            routeData={routeData}
            onMapClick={handleMapClick}
            mapClickMode={mapClickMode}
          />
        </main>
      </div>
    </div>
  );
}

export default App;