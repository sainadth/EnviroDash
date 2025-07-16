// Selectors for sensor state
export const selectActiveSensorType = (state) => state.sensors.activeSensorType;

export const selectAllSensors = (state) => state.sensors.allSensors.items;
export const selectAllSensorsLoading = (state) => state.sensors.allSensors.loading;
export const selectAllSensorsError = (state) => state.sensors.allSensors.error;

export const selectPurpleAirSensors = (state) => state.sensors.purpleAir.items;
export const selectPurpleAirLoading = (state) => state.sensors.purpleAir.loading;
export const selectPurpleAirError = (state) => state.sensors.purpleAir.error;
export const selectPurpleAirSelectedSensor = (state) => state.sensors.purpleAir.selectedSensor;

export const selectAcuriteSensors = (state) => state.sensors.acurite.items;
export const selectAcuriteLoading = (state) => state.sensors.acurite.loading;
export const selectAcuriteError = (state) => state.sensors.acurite.error;
export const selectAcuriteSelectedSensor = (state) => state.sensors.acurite.selectedSensor;

// Get active sensor data based on current sensor type
export const selectActiveSensors = (state) => {
  const activeSensorType = selectActiveSensorType(state);
  return state.sensors[activeSensorType].items;
};

export const selectActiveSelectedSensor = (state) => {
  const activeSensorType = selectActiveSensorType(state);
  return state.sensors[activeSensorType].selectedSensor;
};

export const selectActiveLoading = (state) => {
  const activeSensorType = selectActiveSensorType(state);
  return state.sensors[activeSensorType].loading;
};

export const selectActiveError = (state) => {
  const activeSensorType = selectActiveSensorType(state);
  return state.sensors[activeSensorType].error;
};
