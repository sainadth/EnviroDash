import { createSlice } from '@reduxjs/toolkit';
import { fetchSensors, fetchPurpleAirSensors, fetchAcuriteSensors } from './sensorsThunks';

const initialState = {
  allSensors: {
    items: [],
    loading: false,
    error: null
  },
  purpleAirSensors: {
    items: [],
    loading: false,
    error: null
  },
  acuriteSensors: {
    items: [],
    loading: false,
    error: null
  },
  selectedSensor: null,
  sensors: [] // Keep for compatibility
};

const sensorsSlice = createSlice({
  name: 'sensors',
  initialState,
  reducers: {
    selectSensor: (state, action) => {
      state.selectedSensor = action.payload;
    },
    clearSensors: (state) => {
      state.allSensors.items = [];
      state.purpleAirSensors.items = [];
      state.acuriteSensors.items = [];
      state.sensors = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all sensors
      .addCase(fetchSensors.pending, (state) => {
        state.allSensors.loading = true;
        state.allSensors.error = null;
      })
      .addCase(fetchSensors.fulfilled, (state, action) => {
        state.allSensors.loading = false;
        state.allSensors.items = action.payload;
        state.sensors = action.payload; // For compatibility
        console.log('✅ Redux: All sensors loaded:', action.payload);
      })
      .addCase(fetchSensors.rejected, (state, action) => {
        state.allSensors.loading = false;
        state.allSensors.error = action.payload;
        console.error('❌ Redux: Error loading sensors:', action.payload);
      })
      // Fetch PurpleAir sensors
      .addCase(fetchPurpleAirSensors.pending, (state) => {
        state.purpleAirSensors.loading = true;
        state.purpleAirSensors.error = null;
      })
      .addCase(fetchPurpleAirSensors.fulfilled, (state, action) => {
        state.purpleAirSensors.loading = false;
        state.purpleAirSensors.items = action.payload;
        console.log('✅ Redux: PurpleAir sensors loaded:', action.payload);
      })
      .addCase(fetchPurpleAirSensors.rejected, (state, action) => {
        state.purpleAirSensors.loading = false;
        state.purpleAirSensors.error = action.payload;
      })
      // Fetch AcuRite sensors
      .addCase(fetchAcuriteSensors.pending, (state) => {
        state.acuriteSensors.loading = true;
        state.acuriteSensors.error = null;
      })
      .addCase(fetchAcuriteSensors.fulfilled, (state, action) => {
        state.acuriteSensors.loading = false;
        state.acuriteSensors.items = action.payload;
        console.log('✅ Redux: AcuRite sensors loaded:', action.payload);
      })
      .addCase(fetchAcuriteSensors.rejected, (state, action) => {
        state.acuriteSensors.loading = false;
        state.acuriteSensors.error = action.payload;
      });
  }
});

export const { selectSensor, clearSensors } = sensorsSlice.actions;
export default sensorsSlice.reducer;
