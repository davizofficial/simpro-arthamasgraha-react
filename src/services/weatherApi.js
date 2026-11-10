import axios from 'axios';

export const fetchProjectWeather = async (lat = -5.3582, lon = 104.9754) => {
  try {
    const res = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude: lat,
        longitude: lon,
        current_weather: true,
        hourly: 'relativehumidity_2m,precipitation_probability',
        timezone: 'Asia/Jakarta',
      },
      timeout: 6000,
    });

    const current = res.data.current_weather;

    const weatherCodes = {
      0: 'Cerah Berawan',
      1: 'Cerah',
      2: 'Sebagian Berawan',
      3: 'Mendung Berawan',
      45: 'Berkabut Tebal',
      48: 'Kabut Rime',
      51: 'Gerimis Ringan',
      61: 'Hujan Ringan',
      63: 'Hujan Sedang',
      65: 'Hujan Lebat',
      80: 'Hujan Lokal',
      95: 'Badai Petir',
    };

    const conditionText = weatherCodes[current.weathercode] || 'Kondisi Normal';
    const isOutdoorWorkSafe = current.weathercode < 60;

    return {
      success: true,
      data: {
        temperature: Math.round(current.temperature),
        windspeed: current.windspeed,
        condition: conditionText,
        isSafeForOutdoor: isOutdoorWorkSafe,
        time: current.time,
        source: 'Open-Meteo Live API',
      },
    };
  } catch (err) {
    console.warn('Weather API fetch failed, using fallback status:', err.message);
    return {
      success: false,
      data: {
        temperature: 29,
        windspeed: 12,
        condition: 'Cerah Berawan (Data Cache)',
        isSafeForOutdoor: true,
        source: 'Simulasi Terkendala Jaringan',
      },
    };
  }
};
