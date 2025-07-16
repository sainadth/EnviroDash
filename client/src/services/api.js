// Use Vite environment variables (import.meta.env) instead of process.env
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Add time calculation helpers
const getTimeRangeTimestamp = (range) => {
  const now = new Date();
  let hoursBack;
  
  switch (range) {
    case '6h':
      hoursBack = 6;
      break;
    case '24h':
      hoursBack = 24;
      break;
    case '7d':
      hoursBack = 24 * 7; // 7 days
      break;
    default:
      hoursBack = 6;
  }
  
  const timestamp = new Date(now.getTime() - (hoursBack * 60 * 60 * 1000));
  return timestamp.toISOString();
};

const getSixHoursAgo = () => {
  return getTimeRangeTimestamp('6h');
};

export const sensorAPI = {
  // Get all sensors by type - use the correct backend routes
  getPurpleAirSensors: async () => {
    console.log('📡 Fetching PurpleAir sensors...');
    const response = await fetch(`${API_BASE_URL}/purpleair/sensors`);
    if (!response.ok) throw new Error('Failed to fetch PurpleAir sensors');
    const data = await response.json();
    console.log('✅ PurpleAir sensors received:', data);
    return data;
  },

  getAcuriteSensors: async () => {
    console.log('📡 Fetching AcuRite sensors...');
    const response = await fetch(`${API_BASE_URL}/acurite/sensors`);
    if (!response.ok) throw new Error('Failed to fetch AcuRite sensors');
    const data = await response.json();
    console.log('✅ AcuRite sensors received:', data);
    return data;
  },

  // Updated PurpleAir data method with time range support
  getPurpleAirData: async (sensorIndex, options = {}) => {
    const timeRange = options.timeRange || '6h';
    console.log(`📡 Fetching PurpleAir data for sensor ${sensorIndex} (${timeRange})...`);
    
    // Calculate timestamp based on time range
    let startTimestamp;
    let average;
    
    switch (timeRange) {
      case '6h':
        startTimestamp = Math.floor((Date.now() - 6 * 60 * 60 * 1000) / 1000);
        average = 10; // 10-minute averages
        break;
      case '24h':
        startTimestamp = Math.floor((Date.now() - 24 * 60 * 60 * 1000) / 1000);
        average = 60; // 1-hour averages
        break;
      case '7d':
        startTimestamp = Math.floor((Date.now() - 7 * 24 * 60 * 60 * 1000) / 1000);
        average = 360; // 6-hour averages
        break;
      default:
        startTimestamp = Math.floor((Date.now() - 6 * 60 * 60 * 1000) / 1000);
        average = 10;
    }
    
    const params = new URLSearchParams({
      start_timestamp: options.startTimestamp || startTimestamp,
      average: options.average || average,
      fields: options.fields || 'temperature, humidity, pm2.5_alt, pressure'
    });
    
    const startDate = new Date(startTimestamp * 1000);
    const endDate = new Date();
    console.log(`📅 Time range (${timeRange}): ${startDate.toISOString()} to ${endDate.toISOString()}`);
    
    const response = await fetch(`${API_BASE_URL}/purpleair/sensors/${sensorIndex}/history?${params}`);
    if (!response.ok) throw new Error('Failed to fetch PurpleAir data');
    const data = await response.json();
    
    // Filter data to ensure it's within the requested time range
    if (data.historical) {
      data.historical = data.historical.filter(reading => {
        const readingTime = new Date(reading.timestamp);
        return readingTime >= startDate && readingTime <= endDate;
      });
    }
    
    console.log(`✅ PurpleAir data received for ${timeRange}: ${data.historical?.length || 0} historical points`);
    return data;
  },

  // Updated AcuRite data method with time range support
  getAcuriteData: async (sensorIndex, options = {}) => {
    const timeRange = options.timeRange || '6h';
    console.log(`📡 Fetching AcuRite data for sensor ${sensorIndex} (${timeRange})...`);
    
    let targetDate;
    let startTime;
    
    switch (timeRange) {
      case '6h':
        targetDate = options.date || new Date().toISOString().split('T')[0];
        startTime = new Date(Date.now() - 6 * 60 * 60 * 1000);
        break;
      case '24h':
        targetDate = options.date || new Date().toISOString().split('T')[0];
        startTime = new Date(Date.now() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        targetDate = options.date || new Date().toISOString().split('T')[0];
        startTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      default:
        targetDate = options.date || new Date().toISOString().split('T')[0];
        startTime = new Date(Date.now() - 6 * 60 * 60 * 1000);
    }
    
    console.log(`📅 Fetching AcuRite data for date: ${targetDate} (${timeRange}), start time: ${startTime.toISOString()}`);
    
    // Add time range as query parameter
    const params = new URLSearchParams({
      range: timeRange
    });
    
    const response = await fetch(`${API_BASE_URL}/acurite/sensors/${sensorIndex}/live/${targetDate}?${params}`);
    if (!response.ok) throw new Error('Failed to fetch AcuRite data');
    const data = await response.json();
    
    // Filter data to ensure it's within the requested time range
    if (data.historical) {
      data.historical = data.historical.filter(reading => {
        const readingTime = new Date(reading.timestamp);
        return readingTime >= startTime;
      });
    }
    
    console.log(`✅ AcuRite data received for ${timeRange}: ${data.historical?.length || 0} historical points`);
    return data;
  },

  // Legacy methods - updated to use 6-hour window
  fetchPurpleAirData: async (latitude, longitude) => {
    try {
      const sixHoursAgo = getSixHoursAgo();
      const response = await fetch(`${API_BASE_URL}/purpleair`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lat: latitude,
          lng: longitude,
          start_timestamp: Math.floor(new Date(sixHoursAgo).getTime() / 1000),
        })
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching PurpleAir data:', error);
      throw error;
    }
  },

  fetchAcuRiteData: async (stationId) => {
    try {
      const sixHoursAgo = getSixHoursAgo();
      const response = await fetch(`${API_BASE_URL}/acurite`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          station_id: stationId,
          start_time: sixHoursAgo,
        })
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching AcuRite data:', error);
      throw error;
    }
  }
};
