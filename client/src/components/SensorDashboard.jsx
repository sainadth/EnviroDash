import React, { useState, useEffect } from 'react';
import SensorChart from './SensorChart';
import { sensorAPI } from '../services/api';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { toast } from 'react-toastify';

const SensorDashboard = ({ selectedSensorType, selectedSensorsFromMap = [], setSelectedSensorsFromMap }) => {
  const [sensorsData, setSensorsData] = useState({});
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('6h');

  // Filter sensors to show only those matching current type, but don't modify the parent state
  const currentTypeSensors = selectedSensorsFromMap.filter(sensor => sensor.type === selectedSensorType);

  useEffect(() => {
    console.log(`🔄 SensorDashboard: Sensor type changed to ${selectedSensorType}`);
    console.log(`📊 Current type sensors: ${currentTypeSensors.length}/${selectedSensorsFromMap.length}`);
    
    // Load data for any new sensors of the current type that don't have data yet
    currentTypeSensors.forEach(sensor => {
      if (!sensorsData[`${sensor.sensor_index}_${timeRange}`]) {
        console.log(`📡 Loading data for new sensor: ${sensor.sensor_index} (${timeRange})`);
        loadSensorData(sensor);
      }
    });
  }, [selectedSensorType, selectedSensorsFromMap, timeRange]);

  const loadSensorData = async (sensor) => {
    setLoading(true);
    try {
      console.log(`🔄 Loading ${timeRange} data for ${sensor.type} sensor ${sensor.sensor_index}: ${sensor.name}`);
      let data;
      
      if (sensor.type === 'purpleair') {
        data = await sensorAPI.getPurpleAirData(sensor.sensor_index, { timeRange });
      } else if (sensor.type === 'acurite') {
        data = await sensorAPI.getAcuriteData(sensor.sensor_index, { timeRange });
      }

      console.log(`✅ Received ${timeRange} sensor data:`, data);
      setSensorsData(prev => ({
        ...prev,
        [`${sensor.sensor_index}_${timeRange}`]: data
      }));
      
      toast.success(`Successfully loaded ${timeRange} data for ${sensor.name}`);
    } catch (err) {
      console.error('❌ Error loading sensor data:', err);
      toast.error(`Failed to load data for ${sensor.name}: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeRangeChange = (newTimeRange) => {
    console.log(`🕐 Time range changed to: ${newTimeRange}`);
    setTimeRange(newTimeRange);
    
    // Clear existing data to force reload for new time range
    setSensorsData(prev => {
      const newData = {};
      // Only keep data that matches the new time range (if any exists)
      Object.keys(prev).forEach(key => {
        if (key.endsWith(`_${newTimeRange}`)) {
          newData[key] = prev[key];
        }
      });
      return newData;
    });
    
    // Force reload data for current sensors with new time range
    currentTypeSensors.forEach(sensor => {
      loadSensorData(sensor);
    });
  };

  const removeSensor = (sensorIndex) => {
    console.log(`🗑️ Removing sensor ${sensorIndex}`);
    // Remove from parent state (all sensors)
    setSelectedSensorsFromMap(prev => prev.filter(s => s.sensor_index !== sensorIndex));
    // Remove data for all time ranges
    setSensorsData(prev => {
      const newData = { ...prev };
      Object.keys(newData).forEach(key => {
        if (key.startsWith(`${sensorIndex}_`)) {
          delete newData[key];
        }
      });
      return newData;
    });
  };

  const formatChartData = (field, sensorTypes = null) => {
    return currentTypeSensors
      .filter(sensor => !sensorTypes || sensorTypes.includes(sensor.type))
      .map(sensor => {
        // Only get data for the current time range
        const dataKey = `${sensor.sensor_index}_${timeRange}`;
        const data = sensorsData[dataKey];
        
        if (!data?.historical) {
          console.log(`⚠️ No data found for sensor ${sensor.sensor_index} with time range ${timeRange}`);
          return null;
        }

        const chartData = data.historical.map(reading => ({
          x: new Date(reading.timestamp),
          y: reading[field]
        })).filter(point => point.y !== null && point.y !== undefined);

        console.log(`📊 Chart data for ${sensor.name} (${timeRange}): ${chartData.length} points`);

        return {
          sensorId: sensor.sensor_index,
          sensorName: sensor.name,
          sensorType: sensor.type,
          data: chartData
        };
      })
      .filter(Boolean);
  };

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case '6h': return 'Past 6 Hours';
      case '24h': return 'Past 24 Hours';
      case '7d': return 'Past 7 Days';
      default: return 'Past 6 Hours';
    }
  };

  const renderCommonLegend = () => {
    if (currentTypeSensors.length === 0) return null;

    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
      '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
    ];

    return (
      <div className="w-full p-4 bg-white rounded-lg shadow-md border border-gray-100">
        <h4 className="text-sm font-semibold mb-3 text-gray-800">Selected Sensors</h4>
        <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
          {currentTypeSensors.map((sensor, index) => (
            <div key={sensor.sensor_index} className="flex items-center gap-3 text-xs p-2 hover:bg-gray-50 rounded transition-colors">
              <div 
                className="w-4 h-4 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                style={{ backgroundColor: colors[index % colors.length] }}
              ></div>
              <span className="truncate flex-1 text-gray-700">{sensor.name}</span>
              <button
                onClick={() => removeSensor(sensor.sensor_index)}
                className="bg-red-500 text-white border-0 rounded-full w-5 h-5 cursor-pointer text-xs flex items-center justify-center hover:bg-red-600 flex-shrink-0 shadow-sm transition-colors"
              >
                <span className="material-icons" style={{ fontSize: '12px' }}>delete</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCommonCharts = () => {
    const tempData = formatChartData('temperature');
    const humidityData = formatChartData('humidity');
    const pressureData = formatChartData('pressure');

    return (
      <div className="mb-6">
        <h3 className="mb-4 text-gray-800 border-b border-gray-200 pb-2 text-base font-semibold">
          Environmental Data
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {tempData.length > 0 && (
            <div className="h-56 bg-white rounded-xl shadow-lg border border-gray-100 p-1">
              <SensorChart
                sensorsData={tempData}
                title="Temperature"
                yAxisLabel="°F"
                field="temperature"
                onRemoveSensor={removeSensor}
                compact={true}
                showLegend={false}
              />
            </div>
          )}
          {humidityData.length > 0 && (
            <div className="h-56 bg-white rounded-xl shadow-lg border border-gray-100 p-1">
              <SensorChart
                sensorsData={humidityData}
                title="Humidity"
                yAxisLabel="%"
                field="humidity"
                onRemoveSensor={removeSensor}
                compact={true}
                showLegend={false}
              />
            </div>
          )}
          {pressureData.length > 0 && (
            <div className="h-56 bg-white rounded-xl shadow-lg border border-gray-100 p-1">
              <SensorChart
                sensorsData={pressureData}
                title="Pressure"
                yAxisLabel="hPa"
                field="pressure"
                onRemoveSensor={removeSensor}
                compact={true}
                showLegend={false}
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPurpleAirCharts = () => {
    const pm25Data = formatChartData('pm25', ['purpleair']);
    
    if (pm25Data.length === 0) return null;

    return (
      <div className="mb-6">
        <h3 className="mb-4 text-gray-800 border-b border-gray-200 pb-2 text-base font-semibold">
          Air Quality
        </h3>
        <div className="flex gap-4">
          {/* Chart - 80% width */}
          <div className="w-4/5 h-72 bg-white rounded-xl shadow-lg border border-gray-100 p-1">
            <SensorChart
              sensorsData={pm25Data}
              title="PM2.5 Air Quality"
              yAxisLabel="μg/m³"
              field="pm25"
              onRemoveSensor={removeSensor}
              compact={false}
              showLegend={false}
            />
          </div>
          {/* Legend - 20% width */}
          <div className="w-1/5">
            {renderCommonLegend()}
          </div>
        </div>
      </div>
    );
  };

  const renderAcuriteCharts = () => {
    const windData = formatChartData('wind_speed', ['acurite']);
    
    if (windData.length === 0) return null;

    return (
      <div className="mb-6">
        <h3 className="mb-4 text-gray-800 border-b border-gray-200 pb-2 text-base font-semibold">
          Weather Data
        </h3>
        <div className="flex gap-4">
          {/* Chart - 80% width */}
          <div className="w-4/5 h-72 bg-white rounded-xl shadow-lg border border-gray-100 p-1">
            <SensorChart
              sensorsData={windData}
              title="Wind Speed"
              yAxisLabel="mph"
              field="wind_speed"
              onRemoveSensor={removeSensor}
              compact={false}
              showLegend={false}
            />
          </div>
          {/* Legend - 20% width */}
          <div className="w-1/5">
            {renderCommonLegend()}
          </div>
        </div>
      </div>
    );
  };

  const downloadAllData = () => {
    if (currentTypeSensors.length === 0) return;

    const allData = [];
    currentTypeSensors.forEach(sensor => {
      const data = sensorsData[`${sensor.sensor_index}_${timeRange}`];
      if (data?.historical) {
        data.historical.forEach(reading => {
          allData.push({
            timestamp: new Date(reading.timestamp).toISOString(),
            sensor_name: sensor.name,
            sensor_type: sensor.type,
            sensor_index: sensor.sensor_index,
            time_range: timeRange,
            ...reading
          });
        });
      }
    });

    if (allData.length === 0) return;

    const headers = Object.keys(allData[0]);
    const csvContent = [
      headers,
      ...allData.map(row => headers.map(header => row[header] || ''))
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `envirodash_${selectedSensorType}_${timeRange}_data.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 h-full overflow-y-auto bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 bg-white rounded-lg p-4 shadow-sm border border-gray-100">
        <div>
          <h2 className="text-xl font-bold mb-1 text-gray-800">
            {selectedSensorType === 'purpleair' ? 'PurpleAir Sensors' : 'AcuRite Sensors'}
          </h2>
          <p className="text-gray-600 text-sm">
            {getTimeRangeLabel()} • Click map markers to view charts
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Time Range Selector */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {[
              {
                value: '6h',
                label: '6H'
              }, {
                value: '24h',
                label: '24H'
              }, {
                value: '7d',
                label: '7D'
              }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleTimeRangeChange(option.value)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  timeRange === option.value
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {currentTypeSensors.length > 0 && (
            <>
              <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                {currentTypeSensors.length} selected
              </span>
              <button 
                className="bg-blue-500 text-white border-0 p-3 rounded-lg cursor-pointer text-sm hover:bg-blue-600 transition-colors shadow-md flex items-center justify-center"
                onClick={downloadAllData}
                title="Download data"
              >
                <FileDownloadIcon style={{ fontSize: '16px' }} />
              </button>
              <button 
                className="bg-red-500 text-white border-0 p-3 rounded-lg cursor-pointer text-sm hover:bg-red-600 transition-colors flex items-center justify-center shadow-md"
                onClick={() => {
                  setSensorsData({});
                  if (setSelectedSensorsFromMap) {
                    setSelectedSensorsFromMap([]);
                  }
                }}
                title="Clear all"
              >
                <span className="material-icons" style={{ fontSize: '16px' }}>delete</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center p-6 text-gray-600 text-sm bg-white rounded-lg shadow-sm border border-gray-100">
          Loading {getTimeRangeLabel().toLowerCase()} data...
        </div>
      )}

      {/* Charts - Only show when sensors are selected from map and have data for current time range */}
      {currentTypeSensors.length > 0 && Object.keys(sensorsData).some(key => {
        const hasCurrentTimeRangeData = key.includes(`_${timeRange}`);
        const belongsToCurrentSensor = currentTypeSensors.some(s => key.startsWith(`${s.sensor_index}_`));
        return hasCurrentTimeRangeData && belongsToCurrentSensor;
      }) ? (
        <>
          {/* Wind Speed Chart at the top with legend */}
          {currentTypeSensors.some(s => s.type === 'acurite') && renderAcuriteCharts()}
          
          {/* Air Quality Chart */}
          {currentTypeSensors.some(s => s.type === 'purpleair') && renderPurpleAirCharts()}
          
          {/* Common Environmental Charts below */}
          {renderCommonCharts()}
        </>
      ) : (
        /* Empty State - Always show this when no sensors selected */
        <div className="text-center p-12 text-gray-600 bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="mb-4">
            <span className="material-icons text-6xl text-gray-300 mb-4 block">
              {selectedSensorType === 'purpleair' ? 'air' : 'device_thermostat'}
            </span>
          </div>
          <h3 className="text-lg font-semibold mb-2 text-gray-700">
            No {selectedSensorType === 'purpleair' ? 'PurpleAir' : 'AcuRite'} Sensors Selected
          </h3>
          <p className="text-gray-500 mb-4">
            Click on {selectedSensorType === 'purpleair' ? 'purple' : 'green'} sensor markers on the map to view their data and charts.
          </p>
          <div className="text-sm text-gray-400">
            {selectedSensorType === 'purpleair' 
              ? 'PurpleAir sensors show air quality data including PM2.5, temperature, humidity, and pressure.'
              : 'AcuRite sensors show weather data including wind speed, temperature, humidity, and pressure.'
            }
          </div>
        </div>
      )}
    </div>
  );
};

export default SensorDashboard;
