import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents, Circle } from 'react-leaflet';
import { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import ShelterPopup from './ShelterPopup';
import BottomSheet from './BottomSheet';
import LocationInfo from './LocationInfo';
import './styles/MapControls.css';

// Fix Leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
const startIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const endIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to handle map clicks
function MapClickHandler({ onMapClick, mapClickMode }) {
  useMapEvents({
    click: (e) => {
      if (mapClickMode && onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng, mapClickMode);
      }
    },
  });
  return null;
}

// Component to track map movement
function MapMoveHandler({ onMapMove }) {
  const map = useMap();

  useEffect(() => {
    const handleMoveEnd = () => {
      const newCenter = map.getCenter();
      if (onMapMove) {
        onMapMove([newCenter.lat, newCenter.lng]);
      }
    };

    map.on('moveend', handleMoveEnd);

    return () => {
      map.off('moveend', handleMoveEnd);
    };
  }, [map, onMapMove]);

  return null;
}

// Component to update map center and bounds
function ChangeView({ center, zoom, routeGeometry }) {
  const map = useMap();
  
  useEffect(() => {
    if (routeGeometry && routeGeometry.length > 0) {
      const bounds = L.latLngBounds(routeGeometry.map(coord => [coord[1], coord[0]]));
      map.fitBounds(bounds, { padding: [100, 100] });
    } else if (center) {
      map.setView(center, zoom);
    }
  }, [routeGeometry, map, center, zoom]);
  
  return null;
}

// Save map instance for external access
function SaveMapInstance({ onMapReady }) {
  const map = useMap();
  
  useEffect(() => {
    onMapReady(map);
  }, [map, onMapReady]);
  
  return null;
}

// Live GPS Location Tracker with manual map movement detection
function LocationTracker({ followMode, onLocationUpdate, onFollowModeChange }) {
  const [position, setPosition] = useState(null);
  const [heading, setHeading] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [isUserDragging, setIsUserDragging] = useState(false);
  const map = useMap();

  // Disable follow mode when user manually drags the map
  useEffect(() => {
    if (!followMode) return;

    const handleDragStart = () => {
      setIsUserDragging(true);
      onFollowModeChange(false);
    };

    const handleDragEnd = () => {
      setIsUserDragging(false);
    };

    map.on('dragstart', handleDragStart);
    map.on('dragend', handleDragEnd);

    return () => {
      map.off('dragstart', handleDragStart);
      map.off('dragend', handleDragEnd);
    };
  }, [followMode, map, onFollowModeChange]);

  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported');
      return;
    }

    // Quick initial position
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPosition(newPos);
        setAccuracy(pos.coords.accuracy);
        if (onLocationUpdate) {
          onLocationUpdate(newPos);
        }
      },
      null,
      { enableHighAccuracy: false, timeout: 1000, maximumAge: 60000 }
    );

    // High accuracy watch
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPosition(newPos);
        setAccuracy(pos.coords.accuracy);

        if (pos.coords.heading !== null && pos.coords.heading >= 0) {
          setHeading(pos.coords.heading);
        }

        if (followMode && !isUserDragging) {
          map.setView([newPos.lat, newPos.lng], map.getZoom(), {
            animate: true,
            duration: 0.5,
          });
        }

        if (onLocationUpdate) {
          onLocationUpdate(newPos);
        }
      },
      (error) => console.error('Geolocation error:', error),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [followMode, map, onLocationUpdate, isUserDragging]);

  if (!position) return null;

  const locationIcon = L.divIcon({
    html: heading !== null && heading >= 0
      ? `<div style="width:20px;height:20px;background:#4285F4;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3);position:relative;">
          <div style="position:absolute;top:-15px;left:50%;transform:translateX(-50%) rotate(${heading}deg);width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-bottom:12px solid #4285F4;"></div>
        </div>`
      : `<div style="width:20px;height:20px;background:#4285F4;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
    className: '',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

  return (
    <>
      {accuracy && (
        <Circle
          center={position}
          radius={accuracy}
          pathOptions={{ color: '#4285F4', fillColor: '#4285F4', fillOpacity: 0.1, weight: 1 }}
        />
      )}
      <Marker position={position} icon={locationIcon} zIndexOffset={1000} />
    </>
  );
}

const Map = ({ 
  center = [32.0853, 34.7818], 
  zoom = 13, 
  shelters = [], 
  onMarkerClick,
  routeData = null,
  onMapClick = null,
  mapClickMode = null,
  onBuildRouteToShelter = null,
  onMapMove = null,
  onFollowModeEnabled = null,
  activeTab = 'shelters'
}) => {
  const [selectedShelter, setSelectedShelter] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [followMode, setFollowMode] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const routeCoordinates = routeData?.geometry 
    ? routeData.geometry.map(coord => [coord[1], coord[0]]) 
    : null;

  const handleFollowModeToggle = () => {
    const newMode = !followMode;
    setFollowMode(newMode);
    
    // Center map immediately when enabling follow mode
    if (newMode && currentPosition && mapInstance) {
      mapInstance.setView(
        [currentPosition.lat, currentPosition.lng],
        mapInstance.getZoom(),
        { animate: true, duration: 0.5 }
      );
      
      // Trigger search at current location
      if (onFollowModeEnabled && currentPosition) {
        onFollowModeEnabled({
          latitude: currentPosition.lat,
          longitude: currentPosition.lng
        });
      }
    }
  };

  return (
    <>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%', cursor: mapClickMode ? 'crosshair' : 'grab' }}
        scrollWheelZoom={true}
      >
        <ChangeView center={center} zoom={zoom} routeGeometry={routeData?.geometry} />
        <SaveMapInstance onMapReady={setMapInstance} />
        <MapClickHandler onMapClick={onMapClick} mapClickMode={mapClickMode} />
        <MapMoveHandler onMapMove={onMapMove} />
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {mapClickMode && (
          <div style={{
            position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)',
            zIndex: 1000, background: mapClickMode === 'start' ? '#4CAF50' : '#f44336',
            color: 'white', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)', pointerEvents: 'none'
          }}>
            {mapClickMode === 'start' ? '📍 Click map to set START point' : '🎯 Click map to set END point'}
          </div>
        )}

        {!routeData && shelters.map((shelter) => (
          <Marker
            key={shelter._id}
            position={[shelter.latitude, shelter.longitude]}
            eventHandlers={{
              click: () => {
                if (isMobile) {
                  setSelectedShelter(shelter);
                } else {
                  onMarkerClick && onMarkerClick(shelter);
                }
              },
            }}
          >
            {!isMobile && (
              <Popup maxWidth={350} minWidth={280}>
                <ShelterPopup shelter={shelter} onBuildRoute={onBuildRouteToShelter} currentLocation={center} />
              </Popup>
            )}
          </Marker>
        ))}

        {routeData && (
          <>
            {routeCoordinates && (
              <Polyline positions={routeCoordinates} color="#2196F3" weight={5} opacity={0.7} />
            )}

            {routeData.start && (
              <Marker position={[routeData.start.latitude, routeData.start.longitude]} icon={startIcon}>
                <Popup>
                  <div>
                    <strong>🟢 Start Point</strong>
                    <p>Lat: {routeData.start.latitude.toFixed(6)}</p>
                    <p>Lon: {routeData.start.longitude.toFixed(6)}</p>
                  </div>
                </Popup>
              </Marker>
            )}

            {routeData.end && (
              <Marker position={[routeData.end.latitude, routeData.end.longitude]} icon={endIcon}>
                <Popup>
                  <div>
                    <strong>🔴 End Point</strong>
                    <p>Lat: {routeData.end.latitude.toFixed(6)}</p>
                    <p>Lon: {routeData.end.longitude.toFixed(6)}</p>
                  </div>
                </Popup>
              </Marker>
            )}

            {routeData.shelters && routeData.shelters.map((shelter) => (
              <Marker
                key={shelter.id}
                position={[shelter.latitude, shelter.longitude]}
                eventHandlers={{
                  click: () => {
                    if (isMobile) {
                      setSelectedShelter(shelter);
                    } else {
                      onMarkerClick && onMarkerClick(shelter);
                    }
                  },
                }}
              >
                {!isMobile && (
                  <Popup maxWidth={350} minWidth={280}>
                    <ShelterPopup shelter={shelter} onBuildRoute={onBuildRouteToShelter} currentLocation={center} />
                  </Popup>
                )}
              </Marker>
            ))}
          </>
        )}

        <LocationTracker
          followMode={followMode}
          onLocationUpdate={setCurrentPosition}
          onFollowModeChange={setFollowMode}
        />
      </MapContainer>

      <button
        onClick={handleFollowModeToggle}
        className={`follow-mode-btn ${followMode ? 'follow-mode-btn--active' : ''}`}
        title={followMode ? 'Disable follow mode' : 'Enable follow mode'}
      >
        {followMode ? '📍' : '🧭'}
      </button>

      {(currentPosition || center) && (
        <LocationInfo
          currentPosition={currentPosition}
          shelters={shelters}
          destination={routeData?.end}
          searchCenter={!routeData ? center : null}
          showDestination={activeTab === 'route' && !!routeData}
          onShelterClick={(shelter) => {
            if (isMobile) {
              setSelectedShelter(shelter);
            } else {
              onMarkerClick && onMarkerClick(shelter);
            }
          }}
        />
      )}

      {isMobile && selectedShelter && (
        <BottomSheet
          shelter={selectedShelter}
          onClose={() => setSelectedShelter(null)}
          onBuildRoute={onBuildRouteToShelter}
          currentLocation={center}
        />
      )}
    </>
  );
};

export default Map;