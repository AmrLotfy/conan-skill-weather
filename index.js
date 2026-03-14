/**
 * conan-skill-weather
 * Real-time weather skill for Conan AI agent.
 * Uses OpenWeatherMap API (free tier — 1000 calls/day).
 *
 * Setup:
 *   1. Get a free API key at openweathermap.org
 *   2. conan config set weatherKey YOUR_KEY
 *   3. conan skill install conan-skill-weather
 */

const axios = require('axios')

const BASE_URL = 'https://api.openweathermap.org/data/2.5'

// Weather condition code → emoji
function weatherEmoji(code) {
  if (code >= 200 && code < 300) return '⛈️'   // Thunderstorm
  if (code >= 300 && code < 400) return '🌦️'   // Drizzle
  if (code >= 500 && code < 600) return '🌧️'   // Rain
  if (code >= 600 && code < 700) return '❄️'   // Snow
  if (code >= 700 && code < 800) return '🌫️'   // Fog/mist
  if (code === 800)               return '☀️'   // Clear
  if (code > 800)                 return '⛅️'   // Clouds
  return '🌡️'
}

function formatWind(speed) {
  // Convert m/s to km/h
  const kmh = Math.round(speed * 3.6)
  if (kmh < 10)  return `${kmh} km/h (calm)`
  if (kmh < 30)  return `${kmh} km/h (light breeze)`
  if (kmh < 60)  return `${kmh} km/h (moderate wind)`
  return `${kmh} km/h (strong wind)`
}

module.exports = {
  name: 'get_weather',
  description: 'Get current weather and a short forecast for any city in the world.',
  parameters: {
    type: 'object',
    properties: {
      city: {
        type: 'string',
        description: 'City name (e.g. "Cairo", "London", "New York"). Can include country code: "Cairo,EG".'
      },
      units: {
        type: 'string',
        enum: ['metric', 'imperial'],
        description: 'Temperature units. metric = Celsius, imperial = Fahrenheit. Default: metric.'
      }
    },
    required: ['city']
  },

  async execute(args, context) {
    const city  = args.city
    const units = args.units || 'metric'
    const unit  = units === 'imperial' ? '°F' : '°C'

    // Get API key from context config
    const apiKey = context?.config?.weatherKey

    if (!apiKey) {
      return (
        'Weather skill needs an API key.\n' +
        'Get a free one at openweathermap.org then run:\n' +
        '  conan config set weatherKey YOUR_KEY'
      )
    }

    try {
      // Current weather
      const current = await axios.get(`${BASE_URL}/weather`, {
        params: { q: city, appid: apiKey, units },
        timeout: 10000,
      })

      const d        = current.data
      const emoji    = weatherEmoji(d.weather[0].id)
      const temp     = Math.round(d.main.temp)
      const feels    = Math.round(d.main.feels_like)
      const humidity = d.main.humidity
      const desc     = d.weather[0].description
      const wind     = formatWind(d.wind.speed)
      const cityName = d.name
      const country  = d.sys.country

      // 5-day forecast (3-hour intervals) — just grab next 3 days
      const forecast = await axios.get(`${BASE_URL}/forecast`, {
        params: { q: city, appid: apiKey, units, cnt: 24 },
        timeout: 10000,
      })

      // Group by day and get daily high/low
      const days = {}
      for (const item of forecast.data.list) {
        const date = new Date(item.dt * 1000)
        const day  = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
        if (!days[day]) days[day] = { temps: [], desc: item.weather[0].description, code: item.weather[0].id }
        days[day].temps.push(item.main.temp)
      }

      const forecastLines = Object.entries(days)
        .slice(1, 4) // skip today, show next 3 days
        .map(([day, data]) => {
          const high = Math.round(Math.max(...data.temps))
          const low  = Math.round(Math.min(...data.temps))
          const em   = weatherEmoji(data.code)
          return `  ${em} ${day}: ${high}${unit} / ${low}${unit} — ${data.desc}`
        })
        .join('\n')

      return (
        `${emoji} ${cityName}, ${country}\n` +
        `${temp}${unit} — ${desc}\n` +
        `Feels like ${feels}${unit} · Humidity ${humidity}% · Wind ${wind}\n` +
        (forecastLines ? `\n📅 Next 3 days:\n${forecastLines}` : '')
      )
    } catch (err) {
      if (err.response?.status === 404) {
        return `Couldn't find weather for "${city}". Try a different city name or add the country code (e.g. "Alexandria,EG").`
      }
      if (err.response?.status === 401) {
        return `Invalid weather API key. Check your key at openweathermap.org and update it:\n  conan config set weatherKey YOUR_KEY`
      }
      return `Weather fetch failed: ${err.message}`
    }
  }
}
