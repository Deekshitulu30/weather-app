/**
 * Maps OpenWeatherMap condition codes to internal condition strings.
 * https://openweathermap.org/weather-conditions
 */
export function mapCondition(weatherId) {
  if (weatherId >= 200 && weatherId < 300) return 'thunderstorm';
  if (weatherId >= 300 && weatherId < 400) return 'rain';       // drizzle → rain
  if (weatherId >= 500 && weatherId < 600) return 'rain';
  if (weatherId >= 600 && weatherId < 700) return 'snow';
  if (weatherId === 701) return 'haze';   // mist
  if (weatherId === 711) return 'haze';   // smoke
  if (weatherId === 721) return 'haze';   // haze
  if (weatherId === 731) return 'haze';   // dust whirls
  if (weatherId === 741) return 'haze';   // fog
  if (weatherId === 751) return 'haze';   // sand
  if (weatherId === 761) return 'haze';   // dust
  if (weatherId === 762) return 'haze';   // volcanic ash
  if (weatherId === 771) return 'rain';   // squalls
  if (weatherId === 781) return 'thunderstorm'; // tornado
  if (weatherId === 800) return 'clear';
  if (weatherId >= 801 && weatherId <= 804) return 'clouds';
  return 'clear';
}

/**
 * Returns accent color palette for a given condition + day state.
 */
export function getAccentPalette(condition, isDay) {
  const palettes = {
    clear: isDay
      ? { primary: '#f7b733', secondary: '#fc4a1a', text: '#fff8e7', card: 'rgba(255,220,120,0.15)' }
      : { primary: '#a8c8e8', secondary: '#5b7fa6', text: '#e8f0ff', card: 'rgba(80,120,180,0.15)' },
    spring: { primary: '#f9c46b', secondary: '#f0905a', text: '#fff8ef', card: 'rgba(249,196,107,0.14)' },
    clouds: { primary: '#b0bec5', secondary: '#78909c', text: '#f5f5f5', card: 'rgba(176,190,197,0.18)' },
    rain: { primary: '#4fc3f7', secondary: '#0288d1', text: '#e3f2fd', card: 'rgba(79,195,247,0.15)' },
    snow: { primary: '#e0f7fa', secondary: '#80deea', text: '#f0faff', card: 'rgba(224,247,250,0.18)' },
    haze: { primary: '#c5b99a', secondary: '#8d8068', text: '#f5f0e8', card: 'rgba(197,185,154,0.18)' },
    thunderstorm: { primary: '#7e57c2', secondary: '#4527a0', text: '#ede7f6', card: 'rgba(126,87,194,0.18)' },
  };
  return palettes[condition] ?? palettes[isDay ? 'clear' : 'clear'];
}
