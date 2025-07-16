const express = require('express');
const router = express.Router();
const dataService = require('../services/dataService');
const supabase = require('../config/supabase'); // Import supabase client

// Get all PurpleAir sensors from database
router.get('/sensors', async (req, res) => {
    try {
        const { data: sensors, error } = await supabase
            .from('sensors')
            .select('*')
            .eq('type', 'purpleair');

        if (error) throw error;
        
        console.log(`📡 Returning ${sensors.length} PurpleAir sensors to frontend`);
        res.json(sensors);
    } catch (error) {
        console.error('❌ Error fetching PurpleAir sensors:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get specific PurpleAir sensor by index
router.get('/sensors/:sensor_index', (req, res) => {
    try {
        const sensor = dataService.getSensorById(req.params.sensor_index, 'purpleair');
        
        if (!sensor) {
            return res.status(404).json({ error: 'PurpleAir sensor not found' });
        }
        
        res.json(sensor);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch sensor data' });
    }
});

// Get live data for PurpleAir sensor with database update
router.get('/sensors/:sensor_index/history', async (req, res) => {
    try {
        const { sensor_index } = req.params;
        const { start_timestamp, average, fields } = req.query;
        
        const sensor = dataService.getSensorById(sensor_index, 'purpleair');
        
        if (!sensor) {
            return res.status(404).json({ error: 'PurpleAir sensor not found' });
        }
        
        const options = {
            startTimestamp: start_timestamp,
            average: average,
            fields: fields
        };
        
        // Get fresh data and ensure database is updated
        const freshData = await dataService.getFreshSensorData(sensor_index, 'purpleair', options);
        res.json(freshData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Alternative endpoint if frontend uses /sensor/:id pattern
router.get('/sensor/:id', (req, res) => {
    try {
        const sensor = dataService.getSensorById(req.params.id, 'purpleair');
        
        if (!sensor) {
            return res.status(404).json({ error: 'PurpleAir sensor not found' });
        }
        
        res.json(sensor);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch sensor data' });
    }
});

module.exports = router;
