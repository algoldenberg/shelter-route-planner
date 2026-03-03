import { useState, useEffect, useRef } from 'react';
import { searchAddress } from '../services/geocoding';
import './styles/AddressSearch.css';

const AddressSearch = ({ label, onSelect, initialValue = '' }) => {
  const [query, setQuery] = useState(initialValue);
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeout = useRef(null);
  const wrapperRef = useRef(null);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (query.length >= 3) {
      setIsSearching(true);
      searchTimeout.current = setTimeout(async () => {
        const searchResults = await searchAddress(query);
        setResults(searchResults);
        setIsSearching(false);
        setShowResults(true);
      }, 500);
    } else {
      setResults([]);
      setShowResults(false);
    }

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [query]);

  const handleSelect = (result) => {
    setQuery(result.display_name);
    setShowResults(false);
    onSelect({
      latitude: result.latitude,
      longitude: result.longitude,
      address: result.display_name
    });
  };

  return (
    <div className="address-search" ref={wrapperRef}>
      <label className="address-search__label">{label}</label>
      
      <div className="address-search__input-wrapper">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type address or place name..."
          className="address-search__input"
        />
        
        {isSearching && (
          <div className="address-search__spinner">🔍</div>
        )}
      </div>

      {showResults && results.length > 0 && (
        <ul className="address-search__results">
          {results.map((result, index) => (
            <li
              key={index}
              onClick={() => handleSelect(result)}
              className="address-search__result-item"
            >
              <span className="address-search__result-icon">📍</span>
              <span className="address-search__result-text">
                {result.display_name}
              </span>
            </li>
          ))}
        </ul>
      )}

      {showResults && results.length === 0 && !isSearching && query.length >= 3 && (
        <div className="address-search__no-results">
          No results found. Try a different search.
        </div>
      )}
    </div>
  );
};

export default AddressSearch;