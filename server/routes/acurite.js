const express = require('express');
const router = express.Router();
const dataService = require('../services/dataService');
const supabase = require('../config/supabase');

// Get all AcuRite sensors from database
router.get('/sensors', async (req, res) => {
    try {
        const { data: sensors, error } = await supabase
            .from('sensors')
            .select('*')
            .eq('type', 'acurite');

        if (error) throw error;
        
        console.log(`📡 Returning ${sensors.length} AcuRite sensors to frontend`);
        res.json(sensors);
    } catch (error) {
        console.error('❌ Error fetching AcuRite sensors:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get specific AcuRite sensor by index
router.get('/sensors/:sensor_index', (req, res) => {
    try {
        const sensor = dataService.getSensorById(req.params.sensor_index, 'acurite');
        
        if (!sensor) {
            return res.status(404).json({ error: 'AcuRite sensor not found' });
        }
        
        res.json(sensor);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch sensor data' });
    }
});

// Get live data for AcuRite sensor with database update
router.get('/sensors/:sensor_index/live/:date?', async (req, res) => {
    try {
        const { sensor_index, date } = req.params;
        
        const sensor = dataService.getSensorById(sensor_index, 'acurite');
        
        if (!sensor || !sensor.device_id) {
            return res.status(404).json({ error: 'AcuRite sensor or device_id not found' });
        }
        
        const options = {
            date: date || new Date().toISOString().split('T')[0]
        };
        
        // Get fresh data and ensure database is updated
        const freshData = await dataService.getFreshSensorData(sensor_index, 'acurite', options);
        res.json(freshData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Alternative endpoint if frontend uses /sensor/:id pattern
router.get('/sensor/:id', (req, res) => {
    try {
        const sensor = dataService.getSensorById(req.params.id);
        
        if (!sensor) {
            return res.status(404).json({ error: 'Sensor not found' });
        }
        
        res.json(sensor);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch sensor data' });
    }
});

module.exports = router;
