import { useState, useEffect } from 'react';
import './styles/AddShelterModal.css';

const AddShelterModal = ({ isOpen, onClose, onSubmit, onPickOnMap, isPickingLocation, pickedLocation }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    type: 'public_shelter',
    capacity: '',
    comment: ''
  });

  const [inputMethod, setInputMethod] = useState('address');
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        address: '',
        latitude: '',
        longitude: '',
        type: 'public_shelter',
        capacity: '',
        comment: ''
      });
      setAddressSuggestions([]);
      setShowSuggestions(false);
    }
  }, [isOpen]);

  // Update coordinates when location picked from map
  useEffect(() => {
    if (pickedLocation) {
      setFormData(prev => ({
        ...prev,
        latitude: pickedLocation.latitude.toString(),
        longitude: pickedLocation.longitude.toString()
      }));
    }
  }, [pickedLocation]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (inputMethod === 'map' && (!formData.latitude || !formData.longitude)) {
      alert('Please pick a location on the map first');
      return;
    }

    if (inputMethod === 'address' && (!formData.latitude || !formData.longitude)) {
      alert('Please select an address from the suggestions to get coordinates');
      return;
    }

    onSubmit(formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Address autocomplete using Nominatim
  const handleAddressChange = async (e) => {
    const value = e.target.value;
    setFormData({ ...formData, address: value });

    if (value.length > 2) {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}, Israel&limit=5`
        );
        const data = await response.json();
        setAddressSuggestions(data);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Address search error:', error);
      }
    } else {
      setAddressSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectAddress = (suggestion) => {
    setFormData({
      ...formData,
      address: suggestion.display_name,
      latitude: suggestion.lat,
      longitude: suggestion.lon
    });
    setShowSuggestions(false);
  };

  const handlePickOnMap = () => {
    onPickOnMap(true);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="add-shelter-modal-backdrop" onClick={onClose} />

      <div className="add-shelter-modal">
        <div className="add-shelter-modal__header">
          <h2>🛡️ Suggest New Shelter</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="add-shelter-modal__form">
          {/* Location Method */}
          <div className="form-group">
            <label>How to specify location:</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  value="address"
                  checked={inputMethod === 'address'}
                  onChange={(e) => setInputMethod(e.target.value)}
                  disabled={isPickingLocation}
                />
                🔍 Enter Address
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  value="map"
                  checked={inputMethod === 'map'}
                  onChange={(e) => setInputMethod(e.target.value)}
                  disabled={isPickingLocation}
                />
                📍 Click on Map
              </label>
            </div>
          </div>

          {/* Shelter Name */}
          <div className="form-group">
            <label>Shelter Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Building 5 Shelter"
              required
              minLength={3}
              disabled={isPickingLocation}
            />
          </div>

          {/* Address with autocomplete */}
          {inputMethod === 'address' && (
            <div className="form-group">
              <label>Address *</label>
              <div className="autocomplete-wrapper">
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleAddressChange}
                  placeholder="Start typing street name, city..."
                  required
                  autoComplete="off"
                  disabled={isPickingLocation}
                />
                {showSuggestions && addressSuggestions.length > 0 && (
                  <ul className="suggestions-list">
                    {addressSuggestions.map((suggestion, index) => (
                      <li
                        key={index}
                        onClick={() => selectAddress(suggestion)}
                        className="suggestion-item"
                      >
                        📍 {suggestion.display_name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {formData.latitude && formData.longitude && (
                <small className="help-text success-text">
                  ✓ Coordinates: {parseFloat(formData.latitude).toFixed(6)}, {parseFloat(formData.longitude).toFixed(6)}
                </small>
              )}
            </div>
          )}

          {/* Coordinates (locked when map mode) */}
          {inputMethod === 'map' && (
            <div className="form-group">
              <label>Coordinates</label>
              <div className="coords-inputs">
                <input
                  type="text"
                  value={formData.latitude || 'Auto-filled after picking'}
                  placeholder="Latitude"
                  disabled
                  className="coords-locked"
                />
                <input
                  type="text"
                  value={formData.longitude || 'Auto-filled after picking'}
                  placeholder="Longitude"
                  disabled
                  className="coords-locked"
                />
              </div>
              {!formData.latitude && (
                <small className="help-text">
                  Click "Pick on Map" button below, then click on the map to select location
                </small>
              )}
              {formData.latitude && (
                <small className="help-text success-text">
                  ✓ Location selected: {parseFloat(formData.latitude).toFixed(6)}, {parseFloat(formData.longitude).toFixed(6)}
                </small>
              )}
            </div>
          )}

          {/* Type */}
          <div className="form-group">
            <label>Shelter Type *</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              disabled={isPickingLocation}
            >
              <option value="public_shelter">Public Shelter</option>
              <option value="private_building">Private Building</option>
              <option value="underground_parking">Underground Parking</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Capacity */}
          <div className="form-group">
            <label>Capacity (optional)</label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              placeholder="Approximate number of people"
              min="1"
              disabled={isPickingLocation}
            />
          </div>

          {/* Comment/Instructions */}
          <div className="form-group">
            <label>Instructions / Comment (optional)</label>
            <textarea
              name="comment"
              value={formData.comment}
              onChange={handleChange}
              placeholder="Where is the entrance? Any access details?"
              rows={3}
              disabled={isPickingLocation}
            />
          </div>

          {/* Actions */}
          <div className="form-actions">
            {inputMethod === 'map' && !formData.latitude && (
              <button 
                type="button" 
                className="btn btn--secondary"
                onClick={handlePickOnMap}
              >
                📍 Pick on Map
              </button>
            )}
            <button 
              type="button" 
              className="btn btn--outline" 
              onClick={onClose}
              disabled={isPickingLocation}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn--primary"
              disabled={isPickingLocation}
            >
              Submit Shelter
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AddShelterModal;