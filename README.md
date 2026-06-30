# 🌤️ WeatherScape

A modern, visually immersive weather application built with **React + Vite**, featuring **live animated backgrounds** that reflect real-time weather conditions in any city — sunny, cloudy, rainy, snowy, hazy, stormy, or a calm spring sky.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)
![License](https://img.shields.io/badge/license-MIT-green)

---

## ✨ Features

- 🔍 **City search** with geolocation ("use my location") support
- 🌡️ Current conditions: temperature, feels-like, humidity, wind speed, sunrise/sunset
- 📅 5-day forecast strip
- 🌗 **Day/night aware** backgrounds based on sunrise/sunset data
- 🎨 **Canvas-animated weather backgrounds**:
  - ☀️ Clear / Sunny — glowing pulsing sun, warm gradient sky
  - 🌙 Clear Night — twinkling stars, glowing moon
  - ☁️ Clouds — drifting parallax cloud layers
  - 🌧️ Rain — diagonal raindrop streaks with splash effects
  - ⛈️ Thunderstorm — heavy rain + randomized lightning flashes
  - ❄️ Snow — drifting snowflakes with sine-wave sway
  - 🌫️ Haze/Mist — muted, low-visibility overlay
  - 🌸 Spring/Mild — soft clouds, floating petals, gentle sun
- 🧊 Glassmorphism UI — frosted glass cards over animated backgrounds
- 🌡️ Celsius / Fahrenheit toggle
- 📱 Fully responsive (mobile + desktop)
- ⚡ Smooth cross-fade transitions between weather scenes

---

## 🛠️ Tech Stack

| Layer        | Technology              |
|--------------|--------------------------|
| Framework    | React 18 (JSX)           |
| Build Tool   | Vite 5                   |
| Styling      | CSS / Tailwind CSS        |
| Animation    | HTML5 Canvas API          |
| Weather Data | OpenWeatherMap API        |

---

## 📂 Project Structure

```
weatherscape/
├── src/
│   ├── components/
│   │   ├── WeatherCanvas.jsx     # Animated weather backgrounds
│   │   ├── SearchBar.jsx         # City search + geolocation
│   │   ├── CurrentWeather.jsx    # Current conditions card
│   │   └── ForecastStrip.jsx     # 5-day forecast
│   ├── hooks/
│   │   └── useWeather.js         # API fetching logic
│   ├── utils/
│   │   └── weatherMap.js         # Maps API codes to animation types
│   ├── App.jsx
│   └── main.jsx
├── public/
├── .env.example
├── index.html
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/weatherscape.git
cd weatherscape
```

### 2. Install dependencies

```bash
npm install
```

### 3. Add your API key

Create a `.env` file in the root directory:

```env
VITE_WEATHER_API_KEY=your_openweathermap_api_key_here
```

> Get a free API key at [openweathermap.org/api](https://openweathermap.org/api)

### 4. Run the dev server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 5. Build for production

```bash
npm run build
```

---

## 🎮 Usage

1. Type a city name into the search bar and press **Enter**, or click **📍 Use My Location**.
2. The background instantly animates to match the live weather condition and time of day.
3. Toggle **°C / °F** in the top corner.
4. View the 5-day forecast strip at the bottom of the weather card.

---

## 🎨 Design Philosophy

WeatherScape uses **glassmorphism** — translucent, blurred UI cards — layered over fully animated canvas backgrounds, so the interface itself feels like a window into the weather outside. Colors and accent tones shift subtly depending on conditions (warm golds for sun, cool blues for rain/snow) to reinforce the mood at a glance.

---

## 🗺️ Roadmap

- [ ] Hourly forecast view
- [ ] Multi-city saved dashboard
- [ ] Dark mode toggle independent of weather
- [ ] PWA support for offline caching

---

## 📄 License

This project is licensed under the MIT License — feel free to use, modify, and share.

---

## 🙌 Acknowledgements

- Weather data powered by [OpenWeatherMap](https://openweathermap.org/)
- Built with [React](https://react.dev/) + [Vite](https://vitejs.dev/)
