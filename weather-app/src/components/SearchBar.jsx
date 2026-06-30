import React, { useState, useRef, useEffect } from 'react';

export default function SearchBar({ onSearch, onGeolocate, recentSearches, loading }) {
  const [query, setQuery] = useState('');
  const [showRecent, setShowRecent] = useState(false);
  const inputRef = useRef(null);
  const wrapRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setShowRecent(false);
    }
  };

  const handleRecentClick = (city) => {
    setQuery(city);
    onSearch(city);
    setShowRecent(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setShowRecent(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="search-wrapper" ref={wrapRef}>
      <form className="search-form" onSubmit={handleSubmit}>
        <div className="search-input-wrap">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            className="search-input"
            type="text"
            placeholder="Search city…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => recentSearches.length > 0 && setShowRecent(true)}
            autoComplete="off"
            aria-label="Search city"
          />
          {query && (
            <button
              type="button"
              className="clear-btn"
              onClick={() => { setQuery(''); inputRef.current.focus(); }}
              aria-label="Clear"
            >
              ×
            </button>
          )}
        </div>

        <button type="submit" className="search-btn" disabled={loading || !query.trim()} aria-label="Search">
          {loading ? <span className="spinner" /> : 'Search'}
        </button>

        <button
          type="button"
          className="geo-btn"
          onClick={onGeolocate}
          disabled={loading}
          title="Use my location"
          aria-label="Use my location"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
            <circle cx="12" cy="12" r="9" strokeDasharray="4 2" />
          </svg>
        </button>
      </form>

      {showRecent && recentSearches.length > 0 && (
        <ul className="recent-list" role="listbox">
          <li className="recent-label">Recent</li>
          {recentSearches.map((city) => (
            <li
              key={city}
              className="recent-item"
              role="option"
              onClick={() => handleRecentClick(city)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-3.8" />
              </svg>
              {city}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
