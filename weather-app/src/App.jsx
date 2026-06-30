import React, { useState, useCallback } from 'react';
import WeatherCanvas from './components/WeatherCanvas';
import SearchBar from './components/SearchBar';
import CurrentWeather from './components/CurrentWeather';
import ForecastStrip from './components/ForecastStrip';
import { useWeather } from './hooks/useWeather';
import { getAccentPalette } from './utils/weatherMap';
import './index.css';

export default function App() {
  const { weatherData, loading, error, recentSearches, fetchByCity, fetchByCoords } = useWeather();
  const [unit, setUnit] = useState('metric'); // 'metric' | 'imperial'

  const handleSearch = useCallback((city) => {
    fetchByCity(city);
  }, [fetchByCity]);

  const handleGeolocate = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchByCoords(pos.coords.latitude, pos.coords.longitude),
      () => alert('Unable to retrieve your location. Please allow location access.')
    );
  }, [fetchByCoords]);

  const toggleUnit = useCallback(() => {
    setUnit((u) => (u === 'metric' ? 'imperial' : 'metric'));
  }, []);

  const condition = weatherData?.condition ?? 'clear';
  const isDay = weatherData?.isDay ?? true;
  const palette = getAccentPalette(condition, isDay);

  return (
    <>
      {/* Animated canvas background */}
      <WeatherCanvas condition={condition} isDay={isDay} />

      {/* Main UI layer */}
      <div className="app-container" style={{ '--accent': palette.primary, '--accent2': palette.secondary, '--text': palette.text }}>
        <header className="app-header">
          <div className="brand">
            <span className="brand-icon">🌤</span>
            <span className="brand-name">SkyPulse</span>
          </div>
          <SearchBar
            onSearch={handleSearch}
            onGeolocate={handleGeolocate}
            recentSearches={recentSearches}
            loading={loading}
          />
        </header>

        <main className="main-content">
          {/* Loading state */}
          {loading && (
            <div className="state-card">
              <div className="loading-orb" />
              <p>Fetching weather data…</p>
            </div>
          )}

          {/* Error state */}
          {!loading && error && (
            <div className="state-card error-card">
              <span className="error-icon">⚠️</span>
              <p className="error-msg">{error}</p>
              <p className="error-hint">Try a different city name or check your connection.</p>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && !weatherData && (
            <div className="state-card hero-card">
              <div className="hero-emoji">🌍</div>
              <h2>Discover the Weather</h2>
              <p>Search for a city or use your location to see live weather with a stunning animated backdrop.</p>
            </div>
          )}

          {/* Weather data */}
          {!loading && !error && weatherData && (
            <div className="weather-content" key={weatherData.city}>
              <CurrentWeather
                data={weatherData}
                unit={unit}
                onToggleUnit={toggleUnit}
                palette={palette}
              />
              <ForecastStrip
                forecast={weatherData.forecast}
                unit={unit}
                palette={palette}
              />
            </div>
          )}
        </main>

        <footer className="app-footer">
          <span>Powered by OpenWeatherMap</span>
        </footer>
      </div>
    </>
  );
}
