import React from 'react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function ForecastDay({ day, unit, palette }) {
  const convert = (c) => unit === 'imperial' ? Math.round(c * 9 / 5 + 32) : Math.round(c);
  const sym = unit === 'imperial' ? '°F' : '°C';
  const date = new Date(day.date + 'T12:00:00Z');
  const dayName = DAYS[date.getUTCDay()];

  return (
    <div className="forecast-day" style={{ '--accent': palette.primary }}>
      <span className="fc-day-name">{dayName}</span>
      <img
        src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`}
        alt={day.description}
        width={44}
        height={44}
        style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.25))' }}
      />
      <span className="fc-desc">{day.description}</span>
      <div className="fc-temps">
        <span className="fc-max">{convert(day.tempMax)}{sym}</span>
        <span className="fc-min">{convert(day.tempMin)}{sym}</span>
      </div>
    </div>
  );
}

export default function ForecastStrip({ forecast, unit, palette }) {
  return (
    <div className="weather-card forecast-strip" style={{ '--card-bg': palette.card }}>
      <h2 className="forecast-title">5-Day Forecast</h2>
      <div className="forecast-row">
        {forecast.map((day) => (
          <ForecastDay key={day.date} day={day} unit={unit} palette={palette} />
        ))}
      </div>
    </div>
  );
}
