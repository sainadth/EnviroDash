import React, { useState, useCallback } from 'react';
import SensorMap from './components/SensorMap';
import SensorDashboard from './components/SensorDashboard';
import './App.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [selectedSensorType, setSelectedSensorType] = useState('purpleair');
  const [selectedSensorsFromMap, setSelectedSensorsFromMap] = useState([]);

  const handleSensorSelect = useCallback((sensor) => {
    console.log(`📍 Selecting sensor: ${sensor.name} (${sensor.type})`);
    
    // Allow selecting sensors of any type, not just current type
    setSelectedSensorsFromMap(prev => {
      const exists = prev.find(s => s.sensor_index === sensor.sensor_index);
      if (!exists) {
        console.log(`✅ Added sensor ${sensor.sensor_index} to selection`);
        return [...prev, sensor];
      }
      console.log(`⚠️ Sensor ${sensor.sensor_index} already selected`);
      return prev;
    });
  }, []); // Remove selectedSensorType dependency

  const handleSensorTypeChange = useCallback((newType) => {
    console.log(`🔄 App: Changing sensor type from ${selectedSensorType} to ${newType}`);
    console.log(`📊 Preserving ${selectedSensorsFromMap.length} total sensors`);
    setSelectedSensorType(newType);
    
    // Don't clear sensors - preserve all selected sensors
    console.log(`📊 SensorDashboard will filter display by type`);
  }, [selectedSensorType, selectedSensorsFromMap.length]);

  // Check if there are sensors of the current type to show
  const currentTypeSensors = selectedSensorsFromMap.filter(sensor => sensor.type === selectedSensorType);
  const showDashboard = currentTypeSensors.length > 0;

  return (
    <div className="App">
      <div className="app-container">
        <header className="app-header">
          <h1>EnviroDash</h1>
          <div className="sensor-type-toggle">
            <button 
              className={selectedSensorType === 'purpleair' ? 'active' : ''}
              onClick={() => handleSensorTypeChange('purpleair')}
            >
              PurpleAir ({selectedSensorsFromMap.filter(s => s.type === 'purpleair').length})
            </button>
            <button 
              className={selectedSensorType === 'acurite' ? 'active' : ''}
              onClick={() => handleSensorTypeChange('acurite')}
            >
              AcuRite ({selectedSensorsFromMap.filter(s => s.type === 'acurite').length})
            </button>
          </div>
        </header>
        
        <div className={`main-content ${showDashboard ? 'with-dashboard' : 'map-only'}`}>
          <div className={`map-section ${showDashboard ? '' : 'full-width'}`}>
            <SensorMap 
              selectedSensorType={selectedSensorType}
              onSensorSelect={handleSensorSelect}
              selectedSensorsFromMap={selectedSensorsFromMap}
            />
          </div>
          
          {showDashboard && (
            <div className="dashboard-section">
              <SensorDashboard 
                selectedSensorType={selectedSensorType}
                selectedSensorsFromMap={selectedSensorsFromMap}
                setSelectedSensorsFromMap={setSelectedSensorsFromMap}
              />
            </div>
          )}
        </div>
      </div>
      
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

export default App;