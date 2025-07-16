import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import Sidebar from './Sidebar'
import SensorMap from './SensorMap'
import SensorDashboard from './SensorDashboard'
import { fetchSensors } from '../features/sensors/sensorsThunks'

const Dashboard = () => {
  const dispatch = useDispatch()
  const [selectedSensorType, setSelectedSensorType] = useState('purpleair')
  const [selectedSensorsFromMap, setSelectedSensorsFromMap] = useState([])

  console.log('📊 Dashboard rendered - Selected type:', selectedSensorType);
  console.log('🗺️ Selected sensors from map:', selectedSensorsFromMap);

  useEffect(() => {
    console.log('📡 Dashboard: Fetching sensors...');
    dispatch(fetchSensors())
      .then((result) => {
        console.log('✅ Dashboard: Sensors fetched:', result);
      })
      .catch((error) => {
        console.error('❌ Dashboard: Error fetching sensors:', error);
      });
  }, [dispatch])

  const handleSensorTypeSelect = (type) => {
    setSelectedSensorType(type)
    // DON'T clear selected sensors when switching types - preserve them!
    // setSelectedSensorsFromMap([]) // Remove this line
    console.log(`🔄 Dashboard: Changed sensor type to ${type}, preserving ${selectedSensorsFromMap.length} sensors`);
  }

  const handleMapSensorSelect = (sensor) => {
    setSelectedSensorsFromMap((prev) => {
      // Toggle sensor selection
      const isSelected = prev.find((s) => s.sensor_index === sensor.sensor_index)
      if (isSelected) {
        return prev.filter((s) => s.sensor_index !== sensor.sensor_index)
      } else {
        return [...prev, sensor]
      }
    })
  }

  return (
    <div className="flex h-screen w-full bg-gray-100">
      <Sidebar onSensorTypeSelect={handleSensorTypeSelect} />
      <div className="flex-1 flex overflow-hidden">
        {/* Left side - Charts (2/3 width when sensors of current type selected) */}
        {selectedSensorsFromMap.filter(sensor => sensor.type === selectedSensorType).length > 0 && (
          <div className="w-2/3 h-full overflow-auto p-4">
            <SensorDashboard
              selectedSensorType={selectedSensorType}
              selectedSensorsFromMap={selectedSensorsFromMap}
              setSelectedSensorsFromMap={setSelectedSensorsFromMap}
            />
          </div>
        )}
        
        {/* Right side - Map (1/3 width when sensors of current type selected, full width otherwise) */}
        <div className={`h-full p-4 ${selectedSensorsFromMap.filter(sensor => sensor.type === selectedSensorType).length > 0 ? "w-1/3" : "w-full"}`}>
          <SensorMap
            selectedSensorType={selectedSensorType}
            onSensorSelect={handleMapSensorSelect}
            selectedSensors={selectedSensorsFromMap}
          />
        </div>
      </div>
    </div>
  )
}

export default Dashboard