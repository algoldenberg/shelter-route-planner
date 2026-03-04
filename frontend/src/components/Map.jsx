import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import ShelterPopup from './ShelterPopup';

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

// Component to update map center and bounds
function ChangeView({ center, zoom, routeGeometry }) {
  const map = useMap();
  
  useEffect(() => {
    if (routeGeometry && routeGeometry.length > 0) {
      // Fit map to route bounds
      const bounds = L.latLngBounds(routeGeometry.map(coord => [coord[1], coord[0]]));
      map.fitBounds(bounds, { padding: [100, 100] });
    } else if (center) {
      map.setView(center, zoom);
    }
  }, [routeGeometry, map]); // ← Убрали center и zoom из dependencies
  
  return null;
}

const Map = ({ 
  center = [32.0853, 34.7818], 
  zoom = 13, 
  shelters = [], 
  onMarkerClick,
  routeData = null,
  onMapClick = null,
  mapClickMode = null,
  onBuildRouteToShelter = null
}) => {
  // Convert route geometry to Leaflet format [lat, lon]
  const routeCoordinates = routeData?.geometry 
    ? routeData.geometry.map(coord => [coord[1], coord[0]]) 
    : null;

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ 
        height: '100%', 
        width: '100%',
        cursor: mapClickMode ? 'crosshair' : 'grab'
      }}
      scrollWheelZoom={true}
    >
      <ChangeView center={center} zoom={zoom} routeGeometry={routeData?.geometry} />
      <MapClickHandler onMapClick={onMapClick} mapClickMode={mapClickMode} />
      
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Click mode indicator */}
      {mapClickMode && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          background: mapClickMode === 'start' ? '#4CAF50' : '#f44336',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '8px',
          fontWeight: 'bold',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          pointerEvents: 'none'
        }}>
          {mapClickMode === 'start' ? '📍 Click map to set START point' : '🎯 Click map to set END point'}
        </div>
      )}

      {/* Regular shelter markers */}
      {!routeData && shelters.map((shelter) => (
        <Marker
          key={shelter._id}
          position={[shelter.latitude, shelter.longitude]}
          eventHandlers={{
            click: () => onMarkerClick && onMarkerClick(shelter),
          }}
        >
          <Popup maxWidth={350} minWidth={280}>
            <ShelterPopup 
              shelter={shelter}
              onBuildRoute={onBuildRouteToShelter}
              currentLocation={center}
            />
          </Popup>
        </Marker>
      ))}

      {/* Route visualization */}
      {routeData && (
        <>
          {/* Route line */}
          {routeCoordinates && (
            <Polyline 
              positions={routeCoordinates} 
              color="#2196F3" 
              weight={5}
              opacity={0.7}
            />
          )}

          {/* Start marker */}
          {routeData.start && (
            <Marker 
              position={[routeData.start.latitude, routeData.start.longitude]}
              icon={startIcon}
            >
              <Popup>
                <div>
                  <strong>🟢 Start Point</strong>
                  <p>Lat: {routeData.start.latitude.toFixed(6)}</p>
                  <p>Lon: {routeData.start.longitude.toFixed(6)}</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* End marker */}
          {routeData.end && (
            <Marker 
              position={[routeData.end.latitude, routeData.end.longitude]}
              icon={endIcon}
            >
              <Popup>
                <div>
                  <strong>🔴 End Point</strong>
                  <p>Lat: {routeData.end.latitude.toFixed(6)}</p>
                  <p>Lon: {routeData.end.longitude.toFixed(6)}</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Shelters along route */}
          {routeData.shelters && routeData.shelters.map((shelter) => (
            <Marker
              key={shelter.id}
              position={[shelter.latitude, shelter.longitude]}
              eventHandlers={{
                click: () => onMarkerClick && onMarkerClick(shelter),
              }}
            >
              <Popup maxWidth={350} minWidth={280}>
                <ShelterPopup 
                  shelter={shelter}
                  onBuildRoute={onBuildRouteToShelter}
                  currentLocation={center}
                />
              </Popup>
            </Marker>
          ))}
        </>
      )}
    </MapContainer>
  );
};

export default Map;