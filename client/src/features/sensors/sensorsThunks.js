import { createAsyncThunk } from '@reduxjs/toolkit';

export const fetchSensors = createAsyncThunk(
  'sensors/fetchSensors',
  async () => {
    const response = await fetch('/sensors.json');
    if (!response.ok) {
      throw new Error('Failed to fetch sensors');
    }
    return response.json();
  }
);
