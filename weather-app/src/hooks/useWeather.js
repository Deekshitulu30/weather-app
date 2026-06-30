import { useState, useCallback, useRef } from 'react';
import { mapCondition } from '../utils/weatherMap';

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const BASE = 'https://api.openweathermap.org/data/2.5';

function buildWeatherData(current, forecast) {
  const { weather, main, wind, sys, name, dt, timezone } = current;
  const weatherId = weather[0].id;
  const condition = mapCondition(weatherId);

  // Determine day/night using sunrise/sunset
  const localTime = dt + timezone; // UTC seconds + offset
  const sunriseLocal = sys.sunrise + timezone;
  const sunsetLocal = sys.sunset + timezone;
  const isDay = localTime >= sunriseLocal && localTime < sunsetLocal;

  // Process 5-day forecast: one entry per day at noon
  const dailyMap = {};
  forecast.list.forEach((item) => {
    const date = new Date(item.dt * 1000);
    const dayKey = date.toISOString().slice(0, 10);
    const hour = date.getUTCHours();
    if (!dailyMap[dayKey] || Math.abs(hour - 12) < Math.abs(dailyMap[dayKey].hour - 12)) {
      dailyMap[dayKey] = { hour, item };
    }
  });

  const forecastDays = Object.entries(dailyMap)
    .slice(0, 5)
    .map(([date, { item }]) => ({
      date,
      tempMax: item.main.temp_max,
      tempMin: item.main.temp_min,
      description: item.weather[0].description,
      icon: item.weather[0].icon,
      condition: mapCondition(item.weather[0].id),
    }));

  return {
    city: name,
    country: sys.country,
    temp: main.temp,
    feelsLike: main.feels_like,
    description: weather[0].description,
    humidity: main.humidity,
    windSpeed: wind.speed,
    sunrise: sys.sunrise,
    sunset: sys.sunset,
    timezone,
    condition,
    isDay,
    weatherId,
    icon: weather[0].icon,
    forecast: forecastDays,
  };
}

export function useWeather() {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const abortRef = useRef(null);

  const fetchByCoords = useCallback(async (lat, lon) => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;

    setLoading(true);
    setError(null);
    try {
      const [currentRes, forecastRes] = await Promise.all([
        fetch(`${BASE}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`, { signal }),
        fetch(`${BASE}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`, { signal }),
      ]);

      if (!currentRes.ok || !forecastRes.ok) {
        const msg = !currentRes.ok ? (await currentRes.json()).message : 'Forecast error';
        throw new Error(msg || 'Failed to fetch weather');
      }

      const current = await currentRes.json();
      const forecast = await forecastRes.json();
      const data = buildWeatherData(current, forecast);
      setWeatherData(data);
      return data;
    } catch (err) {
      if (err.name !== 'AbortError') setError(err.message || 'Network error');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchByCity = useCallback(async (city) => {
    if (!city.trim()) return;
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;

    setLoading(true);
    setError(null);
    try {
      const [currentRes, forecastRes] = await Promise.all([
        fetch(`${BASE}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`, { signal }),
        fetch(`${BASE}/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`, { signal }),
      ]);

      if (!currentRes.ok) {
        const errData = await currentRes.json();
        throw new Error(errData.message === 'city not found' ? `City "${city}" not found` : errData.message || 'Failed to fetch weather');
      }
      if (!forecastRes.ok) throw new Error('Failed to fetch forecast');

      const current = await currentRes.json();
      const forecast = await forecastRes.json();
      const data = buildWeatherData(current, forecast);
      setWeatherData(data);

      // Update recent searches (in-memory, max 5)
      setRecentSearches((prev) => {
        const filtered = prev.filter((s) => s.toLowerCase() !== data.city.toLowerCase());
        return [data.city, ...filtered].slice(0, 5);
      });

      return data;
    } catch (err) {
      if (err.name !== 'AbortError') setError(err.message || 'Network error');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { weatherData, loading, error, recentSearches, fetchByCity, fetchByCoords };
}
