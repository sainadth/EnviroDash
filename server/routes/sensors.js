const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Load sensor data from JSON file
const loadSensorData = () => {
  try {
    const dataPath = path.join(__dirname, '../data/sensors.json');
    const data = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading sensor data:', error);
    return [];
  }
};

// GET /api/sensors - Get all sensors
router.get('/', (req, res) => {
  try {
    const sensors = loadSensorData();
    res.json(sensors);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sensors' });
  }
});

// GET /api/sensors/purpleair - Get PurpleAir sensors
router.get('/purpleair', (req, res) => {
  try {
    const sensors = loadSensorData();
    const purpleAirSensors = sensors.filter(sensor => 
      sensor.type === 'purpleair' || sensor.name.toLowerCase().includes('purple')
    );
    res.json(purpleAirSensors);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch PurpleAir sensors' });
  }
});

// GET /api/sensors/acurite - Get AcuRite sensors
router.get('/acurite', (req, res) => {
  try {
    const sensors = loadSensorData();
    const acuriteSensors = sensors.filter(sensor => 
      sensor.type === 'acurite' || sensor.name.toLowerCase().includes('acurite')
    );
    res.json(acuriteSensors);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch AcuRite sensors' });
  }
});

// GET /api/sensors/:id - Get sensor by ID
router.get('/:id', (req, res) => {
  try {
    const sensors = loadSensorData();
    const sensor = sensors.find(s => s.sensor_index == req.params.id);
    
    if (!sensor) {
      return res.status(404).json({ error: 'Sensor not found' });
    }
    
    res.json(sensor);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sensor' });
  }
});

module.exports = router;
