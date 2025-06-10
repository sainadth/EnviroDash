import { createSlice } from '@reduxjs/toolkit';
import { sensorData } from './sensorData';

const sensorsSlice = createSlice({
  name: 'sensors',
  initialState: {
    items: sensorData,
    selectedSensor: null
  },
  reducers: {
    selectSensor: (state, action) => {
      state.selectedSensor = action.payload;
    }
  }
});

export const { selectSensor } = sensorsSlice.actions;
export default sensorsSlice.reducer;
