import React, { useState, useEffect } from 'react';
import { MapPin, Wind, Droplets, Eye, Sun, Moon, Search } from 'lucide-react';

const WeatherDashboard = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchCity, setSearchCity] = useState('');
  const [lat, setLat] = useState(null);
  const [lon, setLon] = useState(null);
  const [error, setError] = useState(null);

  // ============ CORRECT WEATHER EMOJI MAPPING ============
  const getWeatherEmoji = (code, isDay) => {
    // WMO Weather interpretation codes
    if (code === 0) return isDay ? '☀️' : '🌙';
    if (code === 1 || code === 2) return isDay ? '🌤️' : '🌥️';
    if (code === 3) return '☁️';
    if (code === 45 || code === 48) return '🌫️';
    if (code === 51 || code === 53 || code === 55) return '🌧️';
    if (code === 61 || code === 63 || code === 65) return '🌧️';
    if (code === 71 || code === 73 || code === 75) return '❄️';
    if (code === 77) return '❄️';
    if (code === 80 || code === 81 || code === 82) return '⛈️';
    if (code === 85 || code === 86) return '❄️';
    if (code === 95 || code === 96 || code === 99) return '⛈️';
    return '🌤️';
  };

  const getWeatherDescription = (code) => {
    const codes = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Foggy',
      48: 'Foggy',
      51: 'Light drizzle',
      53: 'Drizzle',
      55: 'Heavy drizzle',
      61: 'Slight rain',
      63: 'Moderate rain',
      65: 'Heavy rain',
      71: 'Slight snow',
      73: 'Moderate snow',
      75: 'Heavy snow',
      77: 'Snow grains',
      80: 'Rain showers',
      81: 'Heavy rain showers',
      82: 'Violent rain showers',
      85: 'Snow showers',
      86: 'Heavy snow showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with hail',
      99: 'Thunderstorm with heavy hail',
    };
    return codes[code] || 'Unknown';
  };

  const fetchWeather = async (latitude, longitude) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        latitude: latitude,
        longitude: longitude,
        current: 'temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m,is_day,apparent_temperature',
        daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum',
        hourly: 'temperature_2m,weather_code,is_day',
        timezone: 'auto'
      });

      const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.reason || 'Weather data not available');
      }

      const data = await res.json();
      const current = data.current;
      const daily = data.daily;
      const hourly = data.hourly;

      const weatherData = {
        temperature: Math.round(current.temperature_2m),
        feelsLike: Math.round(current.apparent_temperature),
        description: getWeatherDescription(current.weather_code),
        weatherCode: current.weather_code,
        humidity: current.relative_humidity_2m,
        windSpeed: Math.round(current.wind_speed_10m),
        isDay: current.is_day,
        timezone: data.timezone,
        daily: {
          weather: daily.weather_code.slice(0, 7),
          maxTemp: daily.temperature_2m_max.slice(0, 7),
          minTemp: daily.temperature_2m_min.slice(0, 7),
          sunrise: daily.sunrise.slice(0, 7),
          sunset: daily.sunset.slice(0, 7),
          precipitation: daily.precipitation_sum.slice(0, 7),
        },
        hourly: {
          time: hourly.time.slice(0, 24),
          temperature: hourly.temperature_2m.slice(0, 24),
          weather: hourly.weather_code.slice(0, 24),
          isDay: hourly.is_day.slice(0, 24),
        },
      };

      setWeather(weatherData);
    } catch (err) {
      setError(err.message || 'Could not fetch weather data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const searchLocation = async (e) => {
    e.preventDefault();
    if (!searchCity.trim()) return;

    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${searchCity}&count=1&language=en&format=json`
      );
      const data = await res.json();

      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        setLat(result.latitude);
        setLon(result.longitude);
        fetchWeather(result.latitude, result.longitude);
      } else {
        setError('City not found');
      }
    } catch (err) {
      setError('Could not find city');
    }
  };

  useEffect(() => {
    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setLat(latitude);
            setLon(longitude);
            fetchWeather(latitude, longitude);
          },
          () => {
            setError('Could not get your location');
            setLoading(false);
            fetchWeather(24.8607, 67.0011); // Karachi coordinates
          }
        );
      } else {
        fetchWeather(24.8607, 67.0011); // Karachi coordinates
      }
    };

    getLocation();
  }, []);

  const addKeyframesStyle = () => {
    return `
      @keyframes fadeInDown {
        from {
          opacity: 0;
          transform: translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes slideInLeft {
        from {
          opacity: 0;
          transform: translateX(-30px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      @keyframes float {
        0%, 100% {
          transform: translateY(0px);
        }
        50% {
          transform: translateY(-10px);
        }
      }
      @keyframes pulse {
        0%, 100% {
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
      }
      @keyframes bokeh {
        0% {
          transform: translateY(0px) scale(1);
          opacity: 0.4;
        }
        50% {
          opacity: 0.6;
        }
        100% {
          transform: translateY(20px) scale(1.1);
          opacity: 0.3;
        }
      }
    `;
  };

  if (loading) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #1a2a5e 0%, #2d1b3d 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* Bokeh blurs in background */}
        <div style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          background: 'rgba(95, 125, 217, 0.15)',
          borderRadius: '50%',
          filter: 'blur(80px)',
          top: '10%',
          left: '10%',
          animation: 'bokeh 6s ease-in-out infinite',
        }}></div>
        <div style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          background: 'rgba(123, 104, 238, 0.1)',
          borderRadius: '50%',
          filter: 'blur(100px)',
          bottom: '5%',
          right: '5%',
          animation: 'bokeh 8s ease-in-out infinite 1s',
        }}></div>

        <style>{addKeyframesStyle()}</style>
        <div style={{
          fontSize: '3rem',
          animation: 'float 2s ease-in-out infinite',
          color: '#fff',
          zIndex: 10,
        }}>
          ☁️
        </div>
      </div>
    );
  }

  if (!weather) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #1a2a5e 0%, #2d1b3d 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#b0a5c5',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        fontSize: '1.1rem',
        overflow: 'hidden',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          background: 'rgba(95, 125, 217, 0.15)',
          borderRadius: '50%',
          filter: 'blur(80px)',
          top: '20%',
          left: '20%',
          animation: 'bokeh 6s ease-in-out infinite',
        }}></div>
        <style>{addKeyframesStyle()}</style>
        <div style={{ textAlign: 'center', zIndex: 10 }}>
          <p style={{ margin: '0 0 0.5rem' }}>⚠️</p>
          <p>{error || 'Could not load weather'}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: '#linear-gradient(135deg, #4b79a1 0%, #283e51 100%)',
      minHeight: '100vh',
      padding: '2rem 1rem',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      overflow: 'hidden',
      position: 'relative',
    }}>
      <style>{addKeyframesStyle()}</style>

      {/* Bokeh background elements */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 0,
      }}>
        <div style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          background: 'rgba(95, 125, 217, 0.15)',
          borderRadius: '50%',
          filter: 'blur(90px)',
          top: '-50px',
          left: '-100px',
          animation: 'bokeh 8s ease-in-out infinite',
        }}></div>
        <div style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          background: 'rgba(123, 104, 238, 0.12)',
          borderRadius: '50%',
          filter: 'blur(100px)',
          bottom: '-150px',
          right: '-150px',
          animation: 'bokeh 10s ease-in-out infinite 2s',
        }}></div>
        <div style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          background: 'rgba(138, 43, 226, 0.08)',
          borderRadius: '50%',
          filter: 'blur(80px)',
          top: '50%',
          right: '10%',
          animation: 'bokeh 7s ease-in-out infinite 1s',
        }}></div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        <form onSubmit={searchLocation} style={{
          marginBottom: '2.5rem',
          animation: 'fadeInDown 0.6s ease-out',
        }}>
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            background: 'rgba(255,255,255,0.96)',
            padding: '1rem 1.25rem',
            borderRadius: '16px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          }}>
            <input
              type="text"
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              placeholder="Search location..."
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                fontSize: '1rem',
                fontFamily: 'inherit',
                background: 'transparent',
                color: '#1a2a5e',
              }}
            />
            <button
              type="submit"
              style={{
                background: 'linear-gradient(135deg, #5f7dd9 0%, #7b68ee 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                padding: '0.6rem 1.2rem',
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.95rem',
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 16px rgba(95, 125, 217, 0.35)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <Search size={16} />
              Search
            </button>
          </div>
        </form>

        {/* Current Weather Card */}
        <div style={{
          background: 'rgba(218,239,265,0.95)',
          borderRadius: '24px',
          padding: '2.5rem',
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
          marginBottom: '2rem',
          animation: 'fadeInUp 0.6s ease-out 0.1s both',
          backdropFilter: 'blur(10px)',
        }}>
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#5f7dd9' }}>
              <MapPin size={20} />
              <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: '500' }}>
                {weather.timezone}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '2rem', flexWrap: 'wrap' }}>
              <div>
                <p style={{ fontSize: '4.5rem', fontWeight: '700', margin: '0 0 0.5rem', color: '#1a2a5e' }}>
                  {weather.temperature}°
                </p>
                <p style={{ fontSize: '1.3rem', margin: 0, color: '#5f7dd9', fontWeight: '500' }}>
                  {weather.description}
                </p>
                <p style={{ fontSize: '0.95rem', margin: '0.5rem 0 0', color: '#8b9dc7' }}>
                  Feels like {weather.feelsLike}°
                </p>
              </div>
              <div style={{ fontSize: '6rem', animation: 'float 3s ease-in-out infinite' }}>
                {getWeatherEmoji(weather.weatherCode, weather.isDay)}
              </div>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '1.25rem',
            paddingTop: '2rem',
            borderTop: '1px solid #e8e8f0',
          }}>
            <div style={{ animation: 'fadeInUp 0.6s ease-out 0.2s both' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Droplets size={18} style={{ color: '#5f7dd9' }} />
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#8b9dc7', fontWeight: '500' }}>Humidity</p>
              </div>
              <p style={{ fontSize: '1.8rem', fontWeight: '700', margin: 0, color: '#1a2a5e' }}>
                {weather.humidity}%
              </p>
            </div>

            <div style={{ animation: 'fadeInUp 0.6s ease-out 0.25s both' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Wind size={18} style={{ color: '#5f7dd9' }} />
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#8b9dc7', fontWeight: '500' }}>Wind</p>
              </div>
              <p style={{ fontSize: '1.8rem', fontWeight: '700', margin: 0, color: '#1a2a5e' }}>
                {weather.windSpeed} km/h
              </p>
            </div>

            <div style={{ animation: 'fadeInUp 0.6s ease-out 0.3s both' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Sun size={18} style={{ color: '#f4a261' }} />
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#8b9dc7', fontWeight: '500' }}>Sunrise</p>
              </div>
              <p style={{ fontSize: '1.4rem', fontWeight: '600', margin: 0, color: '#1a2a5e' }}>
                {weather.daily.sunrise[0]?.slice(-5)}
              </p>
            </div>

            <div style={{ animation: 'fadeInUp 0.6s ease-out 0.35s both' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Moon size={18} style={{ color: '#a8a8c0' }} />
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#8b9dc7', fontWeight: '500' }}>Sunset</p>
              </div>
              <p style={{ fontSize: '1.4rem', fontWeight: '600', margin: 0, color: '#1a2a5e' }}>
                {weather.daily.sunset[0]?.slice(-5)}
              </p>
            </div>
          </div>
        </div>

        {/* Hourly Forecast */}
        <div style={{
          background: 'rgba(218,239,265,0.95)',
          borderRadius: '20px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
          animation: 'fadeInUp 0.6s ease-out 0.2s both',
          backdropFilter: 'blur(10px)',
        }}>
          <h3 style={{ color: '#1a2a5e', margin: '0 0 1.5rem', fontSize: '1.3rem', fontWeight: '700' }}>
            Hourly Forecast
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))',
            gap: '1rem',
          }}>
            {weather.hourly.time.slice(0, 12).map((time, idx) => (
              <div
                key={idx}
                style={{
                  boxShadow: '0 8px 20px rgba(95, 125, 217, 0.12)',
                  background: 'linear-gradient(135deg, #f0f2ff 0%, #ece8ff 100%)',
                  padding: '1.25rem',
                  borderRadius: '12px',
                  textAlign: 'center',
                  border: '1px solid #e0d9f5',
                  transition: 'all 0.3s',
                  animation: `fadeInUp 0.6s ease-out ${0.03 * idx}s both`,
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.boxShadow = '0 12px 28px rgba(95, 125, 217, 0.2)';
                  e.currentTarget.style.background = 'linear-gradient(135deg, #e0e7ff 0%, #ddd6fe 100%)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(95, 125, 217, 0.12)';
                  e.currentTarget.style.background = 'linear-gradient(135deg, #f0f2ff 0%, #ece8ff 100%)';
                }}
              >
                <p style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', color: '#5f7dd9', fontWeight: '600' }}>
                  {time.slice(-5)}
                </p>
                <p style={{ fontSize: '1.8rem', margin: '0.5rem 0' }}>
                  {getWeatherEmoji(weather.hourly.weather[idx], weather.hourly.isDay[idx])}
                </p>
                <p style={{ margin: '0.5rem 0 0', fontSize: '1.2rem', fontWeight: '700', color: '#1a2a5e' }}>
                  {Math.round(weather.hourly.temperature[idx])}°
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 7-Day Forecast */}
        <div style={{
          background: 'rgba(218,239,265,0.95)',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
          animation: 'fadeInUp 0.6s ease-out 0.3s both',
          backdropFilter: 'blur(10px)',
        }}>
          <h3 style={{ color: '#1a2a5e', margin: '0 0 1.5rem', fontSize: '1.3rem', fontWeight: '700' }}>
            7-Day Forecast
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '1rem',
          }}>
            {weather.daily.weather.map((weatherCode, idx) => {
              const date = new Date();
              date.setDate(date.getDate() + idx);
              const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
              const dayDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

              return (
                <div
                  key={idx}
                  style={{
                    boxShadow: '0 8px 20px rgba(95, 125, 217, 0.12)',
                    background: 'linear-gradient(135deg, #f0f2ff 0%, #ece8ff 100%)',
                    padding: '1.5rem',
                    borderRadius: '14px',
                    textAlign: 'center',
                    border: '1px solid #e0d9f5',
                    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    animation: `fadeInUp 0.6s ease-out ${0.05 * idx}s both`,
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-6px)';
                    e.currentTarget.style.boxShadow = '0 12px 28px rgba(95, 125, 217, 0.2)';
                    e.currentTarget.style.background = 'linear-gradient(135deg, #e0e7ff 0%, #ddd6fe 100%)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(95, 125, 217, 0.12)';
                    e.currentTarget.style.background = 'linear-gradient(135deg, #f0f2ff 0%, #ece8ff 100%)';
                  }}
                >
                  <p style={{ margin: '0 0 0.25rem', fontWeight: '700', fontSize: '0.95rem', color: '#1a2a5e' }}>
                    {dayName}
                  </p>
                  <p style={{ margin: '0 0 0.75rem', fontSize: '0.8rem', color: '#8b9dc7' }}>
                    {dayDate}
                  </p>
                  <p style={{ fontSize: '2.5rem', margin: '0.5rem 0' }}>
                    {getWeatherEmoji(weatherCode, true)}
                  </p>
                  <div style={{ marginTop: '0.75rem' }}>
                    <p style={{ margin: '0.25rem 0', fontWeight: '700', color: '#1a2a5e', fontSize: '1.1rem' }}>
                      {Math.round(weather.daily.maxTemp[idx])}°
                    </p>
                    <p style={{ margin: '0.25rem 0', color: '#8b9dc7', fontSize: '0.9rem' }}>
                      {Math.round(weather.daily.minTemp[idx])}°
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherDashboard;