// Load environment variables FIRST
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const dataService = require('./services/dataService');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['https://your-frontend-domain.com']
        : ['http://localhost:5173', 'http://localhost:3000']
}));
app.use(express.json());

// Routes
app.use('/api/purpleair', require('./routes/purpleair'));
app.use('/api/acurite', require('./routes/acurite'));

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({ 
        message: 'EnviroDash API Server',
        status: 'healthy',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
        endpoints: [
            'GET /api/purpleair/sensors',
            'GET /api/acurite/sensors',
            'GET /api/purpleair/sensors/:id/history',
            'GET /api/acurite/sensors/:id/live/:date'
        ]
    });
});

// Initialize database with sensors from JSON file
async function initializeDatabase() {
    try {
        console.log('🚀 Starting EnviroDash server...');
        await dataService.initializeSensorsInDatabase();
        console.log('✅ Database initialization complete');
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
    }
}

app.listen(PORT, async () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 API available at http://localhost:${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    
    // Initialize database on startup
    await initializeDatabase();
});
