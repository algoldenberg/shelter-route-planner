import { useEffect, useState, useCallback } from 'react';
import { Marker, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';

// Custom blue dot icon with direction arrow
const createLocationIcon = (heading = null) => {
  const iconHtml = heading !== null && heading >= 0
    ? `<div style="
        width: 20px;
        height: 20px;
        background: #4285F4;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        position: relative;
      ">
        <div style="
          position: absolute;
          top: -15px;
          left: 50%;
          transform: translateX(-50%) rotate(${heading}deg);
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-bottom: 12px solid #4285F4;
        "></div>
      </div>`
    : `<div style="
        width: 20px;
        height: 20px;
        background: #4285F4;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      "></div>`;

  return L.divIcon({
    html: iconHtml,
    className: '',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

const LiveLocation = ({ followMode = false, onLocationUpdate }) => {
  const [position, setPosition] = useState(null);
  const [heading, setHeading] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const map = useMap();

  // Wrap onLocationUpdate in useCallback to prevent re-renders
  const handleLocationUpdate = useCallback((newPos) => {
    if (onLocationUpdate) {
      onLocationUpdate(newPos);
    }
  }, [onLocationUpdate]);

  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const newPos = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setPosition(newPos);
        setAccuracy(pos.coords.accuracy);

        // Update heading if available
        if (pos.coords.heading !== null && pos.coords.heading >= 0) {
          setHeading(pos.coords.heading);
        }

        // Follow mode: center map on user location
        if (followMode) {
          map.setView([newPos.lat, newPos.lng], map.getZoom(), {
            animate: true,
            duration: 0.5,
          });
        }

        // Notify parent component
        handleLocationUpdate(newPos);
      },
      (error) => {
        console.error('Geolocation error:', error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [followMode, map, handleLocationUpdate]);

  if (!position) return null;

  return (
    <>
      {/* Accuracy circle */}
      {accuracy && (
        <Circle
          center={position}
          radius={accuracy}
          pathOptions={{
            color: '#4285F4',
            fillColor: '#4285F4',
            fillOpacity: 0.1,
            weight: 1,
          }}
        />
      )}

      {/* Location marker */}
      <Marker
        position={position}
        icon={createLocationIcon(heading)}
        zIndexOffset={1000}
      />
    </>
  );
};

export default LiveLocation;