# conan-skill-weather

> Real-time weather skill for [Conan AI](https://github.com/AmrLotfy/Conan-ai).

[![npm](https://img.shields.io/npm/v/conan-skill-weather?color=crimson)](https://www.npmjs.com/package/conan-skill-weather)
[![License: MIT](https://img.shields.io/badge/license-MIT-gold.svg)](LICENSE)

Current weather + 3-day forecast for any city in the world, powered by [OpenWeatherMap](https://openweathermap.org).

```
You: what's the weather in Cairo?
Conan: ☀️ Cairo, EG — 28°C, clear sky
       Feels like 27°C · Humidity 30% · Wind 12 km/h

       📅 Next 3 days:
       ☀️ Sun, Mar 16: 30°C / 18°C — clear sky
       ⛅ Mon, Mar 17: 26°C / 16°C — partly cloudy
       🌧️ Tue, Mar 18: 22°C / 14°C — light rain
```

---

## Install

```bash
conan skill install conan-skill-weather
```

## Setup

Get a free API key at [openweathermap.org](https://openweathermap.org) (1000 calls/day free), then:

```bash
conan config set weatherKey YOUR_KEY
```

---

## Usage

Just ask naturally:

```
"what's the weather in London?"
"how's the weather in New York in Fahrenheit?"
"weather forecast for Dubai"
```

---

## Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `city` | string | ✅ | City name. Can include country code: `"Cairo,EG"` |
| `units` | string | — | `metric` (°C, default) or `imperial` (°F) |

---

## License

MIT · [Amr Lotfy](https://github.com/AmrLotfy)
