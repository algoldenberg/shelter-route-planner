import { useState } from 'react';

const SearchBar = ({ onSearch, loading }) => {
  const [latitude, setLatitude] = useState('32.0853');
  const [longitude, setLongitude] = useState('34.7818');
  const [radius, setRadius] = useState('1000');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      radius: parseInt(radius),
    });
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toFixed(6));
          setLongitude(position.coords.longitude.toFixed(6));
          onSearch({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            radius: parseInt(radius),
          });
        },
        (error) => {
          alert('Unable to get your location: ' + error.message);
        }
      );
    } else {
      alert('Geolocation is not supported by your browser');
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🛡️ Find Nearby Shelters</h2>
      
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Latitude:</label>
          <input
            type="number"
            step="0.000001"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            style={styles.input}
            required
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Longitude:</label>
          <input
            type="number"
            step="0.000001"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            style={styles.input}
            required
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Radius (meters):</label>
          <input
            type="number"
            value={radius}
            onChange={(e) => setRadius(e.target.value)}
            style={styles.input}
            required
          />
        </div>

        <div style={styles.buttonGroup}>
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Searching...' : 'Search Shelters'}
          </button>
          
          <button
            type="button"
            onClick={handleCurrentLocation}
            style={styles.buttonSecondary}
            disabled={loading}
          >
            📍 Use My Location
          </button>
        </div>
      </form>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  title: {
    marginBottom: '20px',
    color: '#333',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  label: {
    fontWeight: 'bold',
    color: '#555',
  },
  input: {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
  },
  button: {
    flex: 1,
    padding: '10px 20px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  buttonSecondary: {
    flex: 1,
    padding: '10px 20px',
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
};

export default SearchBar;