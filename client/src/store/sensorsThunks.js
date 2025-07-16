import { createAsyncThunk } from '@reduxjs/toolkit';

// Replace process.env with import.meta.env for Vite
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export const fetchSensors = createAsyncThunk(
  'sensors/fetchSensors',
  async () => {
    const response = await fetch(`${API_BASE_URL}/sensors`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  }
);