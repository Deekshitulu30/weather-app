import React from 'react';

const UNIT_SYMBOL = { metric: '°C', imperial: '°F' };

function formatTime(unix, timezone) {
  const date = new Date((unix + timezone) * 1000);
  const h = date.getUTCHours().toString().padStart(2, '0');
  const m = date.getUTCMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

function WeatherIcon({ icon, description, size = 80 }) {
  return (
    <img
      src={`https://openweathermap.org/img/wn/${icon}@2x.png`}
      alt={description}
      width={size}
      height={size}
      style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))' }}
    />
  );
}

export default function CurrentWeather({ data, unit, onToggleUnit, palette }) {
  const sym = UNIT_SYMBOL[unit];
  const convert = (c) => unit === 'imperial' ? Math.round(c * 9 / 5 + 32) : Math.round(c);

  return (
    <div className="weather-card current-weather" style={{ '--card-bg': palette.card }}>
      {/* Header row */}
      <div className="cw-header">
        <div>
          <h1 className="city-name">{data.city}<span className="country-code">, {data.country}</span></h1>
          <p className="weather-desc">{data.description}</p>
        </div>
        <WeatherIcon icon={data.icon} description={data.description} size={88} />
      </div>

      {/* Main temperature */}
      <div className="temp-row">
        <span className="main-temp">{convert(data.temp)}</span>
        <button
          className="unit-toggle"
          onClick={onToggleUnit}
          aria-label="Toggle temperature unit"
          style={{ '--accent': palette.primary }}
        >
          {sym}
        </button>
      </div>
      <p className="feels-like">Feels like {convert(data.feelsLike)}{sym}</p>

      {/* Stats grid */}
      <div className="stats-grid">
        <StatCard icon="💧" label="Humidity" value={`${data.humidity}%`} />
        <StatCard icon="💨" label="Wind" value={`${Math.round(data.windSpeed * 3.6)} km/h`} />
        <StatCard icon="🌅" label="Sunrise" value={formatTime(data.sunrise, data.timezone)} />
        <StatCard icon="🌇" label="Sunset" value={formatTime(data.sunset, data.timezone)} />
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="stat-card">
      <span className="stat-icon">{icon}</span>
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
    </div>
  );
}
