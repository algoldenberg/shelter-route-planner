import { useState, useEffect } from 'react';
import './styles/LocationInfo.css';

const LocationInfo = ({ currentPosition, shelters, destination, onShelterClick }) => {
  const [nearestShelter, setNearestShelter] = useState(null);
  const [distanceToDestination, setDistanceToDestination] = useState(null);

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  };

  // Find nearest shelter
  useEffect(() => {
    if (!currentPosition || !shelters || shelters.length === 0) {
      setNearestShelter(null);
      return;
    }

    let nearest = null;
    let minDistance = Infinity;

    shelters.forEach(shelter => {
      const distance = calculateDistance(
        currentPosition.lat,
        currentPosition.lng,
        shelter.latitude,
        shelter.longitude
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearest = { ...shelter, distance };
      }
    });

    setNearestShelter(nearest);
  }, [currentPosition, shelters]);

  // Calculate distance to destination
  useEffect(() => {
    if (!currentPosition || !destination) {
      setDistanceToDestination(null);
      return;
    }

    const distance = calculateDistance(
      currentPosition.lat,
      currentPosition.lng,
      destination.latitude,
      destination.longitude
    );

    setDistanceToDestination(distance);
  }, [currentPosition, destination]);

  if (!currentPosition) return null;

  return (
    <div className="location-info">
      {nearestShelter && (
        <div 
          className="location-info__item location-info__item--shelter"
          onClick={() => onShelterClick && onShelterClick(nearestShelter)}
        >
          <span className="location-info__icon">🛡️</span>
          <div className="location-info__content">
            <div className="location-info__label">Nearest Shelter</div>
            <div className="location-info__value">
              {nearestShelter.distance < 1000
                ? `${Math.round(nearestShelter.distance)}m`
                : `${(nearestShelter.distance / 1000).toFixed(1)}km`}
            </div>
          </div>
        </div>
      )}

      {distanceToDestination && (
        <div className="location-info__item location-info__item--destination">
          <span className="location-info__icon">🎯</span>
          <div className="location-info__content">
            <div className="location-info__label">To Destination</div>
            <div className="location-info__value">
              {distanceToDestination < 1000
                ? `${Math.round(distanceToDestination)}m`
                : `${(distanceToDestination / 1000).toFixed(1)}km`}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationInfo;