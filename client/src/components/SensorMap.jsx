import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSensors } from '../features/sensors/sensorsThunks';
import { sensorAPI } from '../services/api';
import { toast } from 'react-toastify';

// Create custom marker icons for different sensor types and states
const createCustomIcon = (sensorType, isSelected = false, clusterSize = 0) => {
  const colors = {
    purpleair: {
      normal: '#8B5CF6',
      selected: '#4C1D95',
      border: '#FFFFFF'
    },
    acurite: {
      normal: '#10B981',
      selected: '#047857',
      border: '#FFFFFF'
    }
  };

  const color = colors[sensorType];
  const fillColor = isSelected ? color.selected : color.normal;
  
  if (clusterSize > 0) {
    // Cluster marker
    return L.divIcon({
      html: `
        <div style="
          background: ${fillColor};
          border: 3px solid ${color.border};
          border-radius: 50%;
          width: ${Math.min(40 + clusterSize * 2, 60)}px;
          height: ${Math.min(40 + clusterSize * 2, 60)}px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        ">
          ${clusterSize}
        </div>
      `,
      className: 'custom-cluster-icon',
      iconSize: [Math.min(40 + clusterSize * 2, 60), Math.min(40 + clusterSize * 2, 60)],
      iconAnchor: [Math.min(20 + clusterSize, 30), Math.min(20 + clusterSize, 30)],
    });
  }

  // Individual sensor marker
  return L.divIcon({
    html: `
      <div style="
        background: ${fillColor};
        border: 3px solid ${color.border};
        border-radius: 50%;
        width: 24px;
        height: 24px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        ${isSelected ? 'animation: pulse 2s infinite;' : ''}
      "></div>
      <style>
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
      </style>
    `,
    className: 'custom-sensor-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

// Clustering utility function
const clusterSensors = (sensors, zoomLevel, pixelThreshold = 40) => {
  if (zoomLevel >= 15) return sensors.map(s => ({ ...s, isCluster: false, clusterSize: 0 }));
  
  const clusters = [];
  const processed = new Set();
  
  sensors.forEach(sensor => {
    if (processed.has(sensor.sensor_index)) return;
    
    const nearby = sensors.filter(other => {
      if (processed.has(other.sensor_index) || sensor.sensor_index === other.sensor_index) return false;
      
      const distance = Math.sqrt(
        Math.pow(sensor.latitude - other.latitude, 2) + 
        Math.pow(sensor.longitude - other.longitude, 2)
      );
      
      // Adjust threshold based on zoom level
      const threshold = (pixelThreshold / Math.pow(2, zoomLevel)) * 0.01;
      return distance < threshold;
    });
    
    if (nearby.length > 0) {
      // Create cluster
      const clusterSensors = [sensor, ...nearby];
      const avgLat = clusterSensors.reduce((sum, s) => sum + s.latitude, 0) / clusterSensors.length;
      const avgLng = clusterSensors.reduce((sum, s) => sum + s.longitude, 0) / clusterSensors.length;
      
      clusters.push({
        ...sensor,
        latitude: avgLat,
        longitude: avgLng,
        isCluster: true,
        clusterSize: clusterSensors.length,
        clusterSensors: clusterSensors,
        sensor_index: `cluster_${sensor.sensor_index}`
      });
      
      clusterSensors.forEach(s => processed.add(s.sensor_index));
    } else {
      clusters.push({ ...sensor, isCluster: false, clusterSize: 0 });
      processed.add(sensor.sensor_index);
    }
  });
  
  return clusters;
};

// Viewport manager component with clustering
const ViewportSensors = ({ sensors, onSensorClick, selectedSensors, selectedSensorType }) => {
  const [visibleSensors, setVisibleSensors] = useState([]);
  const [zoomLevel, setZoomLevel] = useState(13);
  const [isMapReady, setIsMapReady] = useState(false);
  const map = useMap();

  const updateVisibleSensors = useCallback(() => {
    if (!map || !isMapReady) return;
    try {
      const bounds = map.getBounds();
      const zoom = map.getZoom();
      setZoomLevel(zoom);
      
      const visible = sensors
        .filter(
          (sensor) =>
            sensor.latitude &&
            sensor.longitude &&
            bounds.contains([sensor.latitude, sensor.longitude])
        )
        .slice(0, 200); // Increase limit but still prevent performance issues
      
      // Apply clustering
      const clustered = clusterSensors(visible, zoom);
      setVisibleSensors(clustered);
    } catch (error) {
      console.error('Error updating visible sensors:', error);
    }
  }, [map, sensors, isMapReady]);

  useEffect(() => {
    if (map) {
      setIsMapReady(true);
      updateVisibleSensors();
      map.on('moveend', updateVisibleSensors);
      map.on('zoomend', updateVisibleSensors);

      return () => {
        map.off('moveend', updateVisibleSensors);
        map.off('zoomend', updateVisibleSensors);
      };
    }
  }, [map, updateVisibleSensors]);

  return (
    <>
      {visibleSensors.map((sensor) => {
        const isSelected = selectedSensors.some(s => s.sensor_index === sensor.sensor_index);
        const icon = createCustomIcon(sensor.type, isSelected, sensor.clusterSize);
        
        return (
          <Marker
            key={sensor.sensor_index}
            position={[sensor.latitude, sensor.longitude]}
            icon={icon}
            eventHandlers={{
              click: () => {
                if (sensor.isCluster && sensor.clusterSensors) {
                  // Handle cluster click - zoom in or show cluster popup
                  if (zoomLevel < 18) {
                    map.setView([sensor.latitude, sensor.longitude], Math.min(zoomLevel + 3, 18));
                  }
                } else {
                  onSensorClick && onSensorClick(sensor);
                }
              },
            }}
          >
            <Popup maxWidth={400}>
              {sensor.isCluster ? (
                <div className="p-3">
                  <h3 className="font-bold text-lg mb-3">
                    Sensor Cluster ({sensor.clusterSize} sensors)
                  </h3>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {sensor.clusterSensors.map((clusterSensor) => (
                      <div 
                        key={clusterSensor.sensor_index}
                        className="p-2 border rounded hover:bg-gray-50 cursor-pointer"
                        onClick={() => onSensorClick && onSensorClick(clusterSensor)}
                      >
                        <div className="font-medium text-sm">{clusterSensor.name}</div>
                        <div className="text-xs text-gray-600">
                          Type: {clusterSensor.type} | Index: {clusterSensor.sensor_index}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-xs text-gray-500">
                    Click a sensor above to select it, or zoom in to see individual markers
                  </div>
                </div>
              ) : (
                <div className="text-sm">
                  <strong className="block mb-1">{sensor.name}</strong>
                  <span>Type: {sensor.type}</span>
                  <br />
                  <span>Index: {sensor.sensor_index}</span>
                </div>
              )}
            </Popup>
          </Marker>
        );
      })}
    </>
  );
};

const SensorMap = ({ selectedSensorType, onSensorSelect, selectedSensors = [] }) => {
  const dispatch = useDispatch();
  const { items: sensors, loading, error } = useSelector((state) => state.sensors.allSensors);
  const [data, setData] = useState({});
  const [loadingData, setLoadingData] = useState({});

  // Filter sensors based on selected type
  const filteredSensors = useMemo(() => 
    sensors.filter((sensor) => sensor.type === selectedSensorType),
    [sensors, selectedSensorType]
  );

  useEffect(() => {
    console.log('🗺️ Fetching sensors from backend...');
    dispatch(fetchSensors())
      .then((result) => {
        console.log('✅ Sensors fetched successfully:', result);
      })
      .catch((error) => {
        console.error('❌ Error fetching sensors:', error);
      });
  }, [dispatch]);

  const handleSensorClick = async (sensor) => {
    console.log('🖱️ Sensor clicked:', sensor.name, sensor.sensor_index);
    
    // Always select the sensor regardless of current type
    onSensorSelect(sensor);

    // Then fetch and display sensor data (default to 6h for popup)
    const dataKey = `${sensor.sensor_index}_6h`;
    if (!data[dataKey]) {
      setLoadingData(prev => ({ ...prev, [sensor.sensor_index]: true }));

      try {
        console.log(`📡 Fetching data for ${sensor.type} sensor ${sensor.sensor_index}`);
        let sensorData;
        if (sensor.type === 'purpleair') {
          sensorData = await sensorAPI.getPurpleAirData(sensor.sensor_index, { timeRange: '6h' });
        } else if (sensor.type === 'acurite') {
          sensorData = await sensorAPI.getAcuriteData(sensor.sensor_index, { timeRange: '6h' });
        }

        console.log('✅ Sensor data received:', sensorData);
        setData(prev => ({
          ...prev,
          [dataKey]: sensorData,
          [sensor.sensor_index]: sensorData // Keep legacy key for popup compatibility
        }));
      } catch (error) {
        console.error('❌ Failed to fetch sensor data:', error);
      } finally {
        setLoadingData(prev => ({ ...prev, [sensor.sensor_index]: false }));
      }
    }
  };

  const handleMarkerClick = (sensor) => {
    console.log('🖱️ Marker clicked:', sensor);
    
    if (selectedSensors.some(s => s.sensor_index === sensor.sensor_index)) {
      toast.info(`${sensor.name} is already selected`);
      return;
    }
    
    // Allow selecting any sensor type, not just current type
    onSensorSelect(sensor);
    toast.success(`Added ${sensor.name} to dashboard`);
  };

  const renderSensorPopup = (sensor) => {
    const sensorData = data[sensor.sensor_index];
    const isLoading = loadingData[sensor.sensor_index];
    const isSelected = selectedSensors.find((s) => s.sensor_index === sensor.sensor_index);

    return (
      <Popup maxWidth={300}>
        <div className="p-2">
          <h3 className="font-bold text-lg mb-2">{sensor.name}</h3>
          <p className="text-sm text-gray-600 mb-2">
            Type: <span className="font-medium">{sensor.type}</span>
          </p>
          <p className="text-sm text-gray-600 mb-3">
            Location: {sensor.latitude.toFixed(4)}, {sensor.longitude.toFixed(4)}
          </p>

          {isSelected && (
            <div className="mb-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
              ✓ Selected for charts
            </div>
          )}

          {isLoading && <div className="text-sm text-gray-600">Loading sensor data...</div>}

          {sensorData && !isLoading && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Latest Readings:</h4>

              {sensor.type === 'purpleair' && sensorData.historical && sensorData.historical[0] && (
                <div className="text-xs space-y-1">
                  <div>
                    PM2.5:{' '}
                    <span className="font-medium">{sensorData.historical[0].pm25 || 'N/A'} μg/m³</span>
                  </div>
                  <div>
                    Temperature:{' '}
                    <span className="font-medium">{sensorData.historical[0].temperature || 'N/A'}°F</span>
                  </div>
                  <div>
                    Humidity:{' '}
                    <span className="font-medium">{sensorData.historical[0].humidity || 'N/A'}%</span>
                  </div>
                  <div>
                    Pressure:{' '}
                    <span className="font-medium">{sensorData.historical[0].pressure || 'N/A'} hPa</span>
                  </div>
                </div>
              )}

              {sensor.type === 'acurite' && sensorData.historical && sensorData.historical[0] && (
                <div className="text-xs space-y-1">
                  <div>
                    Temperature:{' '}
                    <span className="font-medium">{sensorData.historical[0].temperature || 'N/A'}°F</span>
                  </div>
                  <div>
                    Humidity:{' '}
                    <span className="font-medium">{sensorData.historical[0].humidity || 'N/A'}%</span>
                  </div>
                  <div>
                    Wind Speed:{' '}
                    <span className="font-medium">{sensorData.historical[0].windSpeed || 'N/A'} mph</span>
                  </div>
                  <div>
                    Pressure:{' '}
                    <span className="font-medium">{sensorData.historical[0].pressure || 'N/A'} inHg</span>
                  </div>
                </div>
              )}

              {sensorData.timestamp && (
                <div className="text-xs text-gray-500 mt-2">
                  Updated: {new Date(sensorData.timestamp).toLocaleString()}
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => handleSensorClick(sensor)}
            className="mt-3 w-full px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
          >
            {isSelected ? 'Remove from Charts' : 'Add to Charts'}
          </button>
        </div>
      </Popup>
    );
  };

  if (loading) {
    return (
      <div className="relative h-[calc(100vh-2rem)] w-full rounded-lg shadow-md overflow-hidden flex items-center justify-center">
        <div className="text-lg">Loading sensors...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative h-[calc(100vh-2rem)] w-full rounded-lg shadow-md overflow-hidden flex items-center justify-center">
        <div className="text-lg text-red-600">Error loading sensors: {error}</div>
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-2rem)] w-full rounded-lg shadow-md overflow-hidden">
      {/* Map Legend */}
      <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-lg p-3">
        <h4 className="font-semibold text-sm mb-2">Map Legend</h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ 
              background: selectedSensorType === 'purpleair' ? '#8B5CF6' : '#10B981' 
            }}></div>
            <span>Available {selectedSensorType}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full border-2 border-white" style={{ 
              background: selectedSensorType === 'purpleair' ? '#4C1D95' : '#047857',
              animation: 'pulse 2s infinite'
            }}></div>
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gray-600 text-white flex items-center justify-center text-xs font-bold">
              5
            </div>
            <span>Clustered (zoom to expand)</span>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t text-xs text-gray-600">
          {filteredSensors.length} {selectedSensorType} sensors
        </div>
      </div>

      <MapContainer
        center={[27.745824567472003, -97.40527804827704]}
        zoom={13}
        className="h-full w-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ViewportSensors
          sensors={filteredSensors}
          onSensorClick={handleSensorClick}
          selectedSensors={selectedSensors}
          selectedSensorType={selectedSensorType}
        />
      </MapContainer>
    </div>
  );
};

export default SensorMap;