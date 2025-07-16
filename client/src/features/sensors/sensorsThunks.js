import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Update to use the correct API URL from your .env file
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Fetch all sensors from backend (using your new endpoint structure)
export const fetchSensors = createAsyncThunk(
  'sensors/fetchSensors',
  async (_, { rejectWithValue }) => {
    try {
      // Use both purpleair and acurite endpoints to get all sensors
      const [purpleAirResponse, acuriteResponse] = await Promise.all([
        apiClient.get('/purpleair/sensors'),
        apiClient.get('/acurite/sensors')
      ]);
      return [...purpleAirResponse.data, ...acuriteResponse.data];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Fetch PurpleAir sensors from backend
export const fetchPurpleAirSensors = createAsyncThunk(
  'sensors/fetchPurpleAirSensors',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/purpleair/sensors');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Fetch AcuRite sensors from backend
export const fetchAcuriteSensors = createAsyncThunk(
  'sensors/fetchAcuriteSensors',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/acurite/sensors');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Fetch sensor by ID
export const fetchSensorById = createAsyncThunk(
  'sensors/fetchSensorById',
  async ({ sensorId, sensorType }, { rejectWithValue }) => {
    try {
      const endpoint = sensorType === 'purpleair' 
        ? `/purpleair/sensors/${sensorId}` 
        : `/acurite/sensors/${sensorId}`;
      const response = await apiClient.get(endpoint);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Updated fetchSensorData with time range support
export const fetchSensorData = createAsyncThunk(
  'sensors/fetchSensorData',
  async ({ sensorId, sensorType, timeRange = '6h' }, { rejectWithValue }) => {
    try {
      console.log(`📡 Fetching ${sensorType} sensor data for ${sensorId} (${timeRange})`);
      
      let endpoint;
      let params = {};
      
      if (sensorType === 'purpleair') {
        let startTimestamp;
        let average;
        
        switch (timeRange) {
          case '6h':
            startTimestamp = Math.floor((Date.now() - 6 * 60 * 60 * 1000) / 1000);
            average = 10;
            break;
          case '24h':
            startTimestamp = Math.floor((Date.now() - 24 * 60 * 60 * 1000) / 1000);
            average = 60;
            break;
          case '7d':
            startTimestamp = Math.floor((Date.now() - 7 * 24 * 60 * 60 * 1000) / 1000);
            average = 360;
            break;
          default:
            startTimestamp = Math.floor((Date.now() - 6 * 60 * 60 * 1000) / 1000);
            average = 10;
        }
        
        endpoint = `/purpleair/sensors/${sensorId}/history`;
        params = {
          start_timestamp: startTimestamp,
          average: average,
          fields: 'temperature, humidity, pm2.5_alt, pressure'
        };
      } else if (sensorType === 'acurite') {
        const today = new Date().toISOString().split('T')[0];
        endpoint = `/acurite/sensors/${sensorId}/live/${today}`;
        params = { range: timeRange };
      }
      
      const url = new URL(endpoint, API_BASE_URL);
      Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
      
      const response = await apiClient.get(url.pathname + url.search);
      console.log(`✅ ${sensorType} data fetched: ${response.data.historical?.length || 0} points`);
      return { sensorId, sensorType, timeRange, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Updated fetchMultipleSensorsData with time range support
export const fetchMultipleSensorsData = createAsyncThunk(
  'sensors/fetchMultipleSensorsData',
  async ({ sensors, timeRange = '6h' }, { dispatch, rejectWithValue }) => {
    try {
      console.log(`📡 Fetching data for ${sensors.length} sensors (${timeRange})`);
      
      const promises = sensors.map(sensor => 
        dispatch(fetchSensorData({ 
          sensorId: sensor.sensor_index, 
          sensorType: sensor.type,
          timeRange: timeRange
        }))
      );
      
      const results = await Promise.allSettled(promises);
      const successful = results.filter(result => result.status === 'fulfilled');
      console.log(`✅ Successfully fetched data for ${successful.length}/${sensors.length} sensors`);
      
      return successful.map(result => result.value.payload);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
