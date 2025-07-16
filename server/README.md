# EnviroDash Server

Backend API server for the EnviroDash environmental monitoring dashboard built with Node.js and Express.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
```bash
npm install
```

### Environment Setup
Create a `.env` file in the server directory:
```
PORT=3001
NODE_ENV=development
PURPLEAIR_API_KEY=your_purpleair_api_key_here
PURPLEAIR_BASE_URL=https://api.purpleair.com/v1
ACURITE_API_KEY=your_acurite_api_key_here
ACURITE_BASE_URL=https://api.acurite.com
CACHE_DURATION_MINUTES=5
MAX_CACHE_SIZE=1000
API_RATE_LIMIT_REQUESTS=100
API_RATE_LIMIT_WINDOW_MINUTES=15
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Note**: Replace the placeholder values with your actual API keys and configuration values. Never commit real API keys to version control.

### API Key Setup Instructions

#### Getting PurpleAir API Key
1. Visit https://api.purpleair.com/
2. Sign up for a developer account
3. Generate your API key
4. Add it to your `.env` file as `PURPLEAIR_API_KEY`

#### Getting Supabase Credentials
1. Visit https://supabase.com/
2. Create a new project or use existing one
3. Go to Settings → API
4. Copy your project URL and anon key
5. Add them to your `.env` file


### Development
```bash
npm run dev
```
This starts the server with nodemon for automatic restarts.

### Production
```bash
npm start
```

## 🛠️ Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Supabase** - Database and backend services
- **Axios** - HTTP client for external APIs
- **CORS** - Cross-origin requests
- **dotenv** - Environment variables

## 📁 Project Structure

```
server/
├── routes/            # API routes
│   ├── purpleair.js   # PurpleAir sensor endpoints
│   └── acurite.js     # AcuRite sensor endpoints
├── services/          # External API services
│   └── dataService.js # Data fetching and caching
├── data/              # Static data files
│   └── sensors.json   # Sensor configuration
├── config/            # Configuration files
│   └── supabase.js    # Supabase client setup
├── database/          # Database setup
│   └── setup_rls.sql  # Row Level Security setup
├── server.js          # Server entry point
├── package.json       # Dependencies and scripts
└── README.md          # This file
```

## 🔌 API Endpoints

### Health Check
```
GET /              # Server status and available endpoints
GET /health        # Health check endpoint
```

### PurpleAir Sensors
```
GET /api/purpleair/sensors                    # Get all PurpleAir sensors
GET /api/purpleair/sensors/:id/history        # Get historical data for a sensor
```

### AcuRite Sensors
```
GET /api/acurite/sensors                      # Get all AcuRite sensors
GET /api/acurite/sensors/:id/live/:date       # Get live data for a sensor on a specific date
```

## 📊 Database Schema

### Supabase Database
The application uses Supabase for data storage with the following tables:

#### PurpleAir Sensors Table
```sql
CREATE TABLE purpleair_sensors (
  sensor_index INTEGER PRIMARY KEY,
  name VARCHAR,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  last_seen TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### AcuRite Sensors Table
```sql
CREATE TABLE acurite_sensors (
  sensor_index INTEGER PRIMARY KEY,
  name VARCHAR,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  last_seen TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Sensor Readings Tables
- `purpleair_readings` - Historical PurpleAir sensor data
- `acurite_readings` - Historical AcuRite sensor data

## 🌐 External API Integration

### PurpleAir API
- **Base URL**: `https://api.purpleair.com/v1`
- **Authentication**: API Key required
- **Data Types**: PM2.5, PM10, temperature, humidity, pressure
- **Rate Limits**: Configured via environment variables

### AcuRite API
- **Base URL**: `https://api.acurite.com`
- **Authentication**: API Key required
- **Data Types**: Temperature, humidity, wind speed, pressure
- **Data Format**: Live readings by date

### Data Caching
- **Cache Duration**: 5 minutes (configurable)
- **Max Cache Size**: 1000 entries (configurable)
- **Implementation**: In-memory caching with dataService

## 🚀 Performance Optimizations

- **Caching**: In-memory caching with configurable duration
- **Database Initialization**: Automatic sensor data initialization on startup
- **CORS**: Configured for development and production environments
- **Error Handling**: Comprehensive error responses with proper HTTP status codes
- **Environment-based Configuration**: Different settings for development and production

## 🔧 Key Features

### Data Service
The `dataService` module handles:
- Sensor data initialization from JSON files
- Caching of external API responses
- Database operations with Supabase
- Error handling and logging

### Automatic Initialization
On server startup, the application:
1. Initializes sensor data in the database
2. Sets up caching mechanisms
3. Configures CORS based on environment
4. Provides health check endpoints

## 📝 Environment Variables

Required environment variables:
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)
- `PURPLEAIR_API_KEY` - PurpleAir API key (get from https://api.purpleair.com/)
- `PURPLEAIR_BASE_URL` - PurpleAir API base URL (https://api.purpleair.com/v1)
- `ACURITE_API_KEY` - AcuRite API key (get from AcuRite developer portal)
- `ACURITE_BASE_URL` - AcuRite API base URL (https://api.acurite.com)
- `CACHE_DURATION_MINUTES` - Cache duration in minutes (recommended: 5)
- `MAX_CACHE_SIZE` - Maximum cache size (recommended: 1000)
- `API_RATE_LIMIT_REQUESTS` - API rate limit requests (recommended: 100)
- `API_RATE_LIMIT_WINDOW_MINUTES` - API rate limit window (recommended: 15)
- `VITE_SUPABASE_URL` - Supabase project URL (get from your Supabase dashboard)
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key (get from your Supabase dashboard)

**Security Note**: Never commit actual API keys to version control. Use environment variables and add `.env` to your `.gitignore` file.

## 🧪 Testing

```bash
# Run the server locally
npm run dev

# Test health endpoints
curl http://localhost:3001/
curl http://localhost:3001/health

# Test API endpoints
curl http://localhost:3001/api/purpleair/sensors
curl http://localhost:3001/api/acurite/sensors
```

## 🚀 Deployment

### Render Deployment (Recommended)
1. Connect your GitHub repository to Render
2. Set the following build settings:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Root Directory**: `server`
3. Configure all environment variables in Render dashboard
4. Deploy and test endpoints

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## 📊 Monitoring & Logging

- **Console Logging**: Comprehensive logging with emoji indicators
- **Health Checks**: `/health` endpoint for monitoring
- **Error Tracking**: Detailed error logging and responses
- **Environment Logging**: Environment-specific log levels

## 🔒 Security

- **CORS**: Configured for development and production environments
- **Environment Variables**: Secure configuration management
- **Input Validation**: Basic request validation
- **Error Handling**: Secure error responses without sensitive data exposure

## 📚 API Documentation

### Response Format
```javascript
// Successful sensor data response
{
  "sensors": [
    {
      "sensor_index": 12345,
      "name": "Sensor Name",
      "latitude": 37.7749,
      "longitude": -122.4194,
      "last_seen": "2025-01-15T10:30:00Z"
    }
  ]
}

// Health check response
{
  "status": "OK",
  "timestamp": "2025-01-15T10:30:00Z"
}

// Error response
{
  "error": "Error message",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

### Status Codes
- `200` - Success
- `404` - Not Found
- `500` - Internal Server Error

## 🤝 Contributing

1. Follow the existing code structure
2. Update documentation for any changes
3. Test endpoints before submitting
4. Use meaningful commit messages
5. Maintain environment variable documentation

## 📞 Support

For server-specific issues:
- Check server logs using `npm run dev`
- Verify environment variables are set correctly
- Test Supabase connectivity
- Review API endpoint documentation
- Check external API rate limits

## 📡 Adding New Sensors

### Sensor Configuration File
Sensors are configured in `data/sensors.json`. This file contains all available sensors with their metadata.

#### Sensor JSON Structure
```json
{
  "sensor_index": 12345,
  "name": "Sensor Display Name",
  "latitude": 27.644931,
  "longitude": -97.364697,
  "type": "purpleair", // or "acurite"
  "device_id": "device_id_for_acurite_only" // Only for AcuRite sensors
}
```

### Adding PurpleAir Sensors

1. **Find the sensor on PurpleAir map**: Visit https://map.purpleair.com/
2. **Get sensor index**: Click on a sensor marker and note the sensor index from the URL or sensor info
3. **Get coordinates**: Note the latitude and longitude
4. **Add to sensors.json**:
```json
{
  "sensor_index": 7488,
  "name": "Rockport Texas",
  "latitude": 28.01262,
  "longitude": -97.09614,
  "type": "purpleair"
}
```

### Adding AcuRite Sensors

AcuRite sensors require a `device_id` that must be obtained from the MyAcuRite dashboard.

#### Getting AcuRite Device ID:

1. **Login to MyAcuRite**: Visit https://www.myacurite.com/ and login to your account
2. **Select your sensor**: Go to your dashboard and click on the sensor you want to add
3. **Inspect the network requests**:
   - Open browser developer tools (F12)
   - Go to the Network tab
   - Refresh the page or click on the sensor
   - Look for API requests to AcuRite servers
4. **Find the device_id**: 
   - Look for requests containing device information
   - The device_id typically follows the pattern: `{MAC_ADDRESS}-{DEVICE_CODE}-{SENSOR_TYPE}`
   - Example: `24C86E120B3E-XXXXXXXX-Atlas`
5. **Get sensor coordinates**: Note the latitude and longitude from the sensor location
6. **Add to sensors.json**:
```json
{
  "sensor_index": 1823425,
  "name": "Tom's Station",
  "latitude": 27.644931,
  "longitude": -97.364697,
  "type": "acurite",
  "device_id": "24C86E120B3E-XXXXXXXX-Atlas"
}
```

#### AcuRite Device ID Format Examples:
- **Atlas Weather Station**: `24C86E120B3E-XXXXXXXX-Atlas`
- **5-in-1 Weather Station**: `24C86E0E400D-XXXXXXXX-5in1WS`
- **Temperature/Humidity Sensor**: `24C86E120B3E-XXXXXXXX-TempHumidity`

### After Adding Sensors

1. **Save the sensors.json file**
2. **Restart the server**: The server will automatically initialize new sensors in the database
3. **Test the endpoints**: 
   ```bash
   curl http://localhost:3001/api/purpleair/sensors
   curl http://localhost:3001/api/acurite/sensors
   ```
4. **Verify in frontend**: New sensors should appear on the map after refresh

### Troubleshooting

- **PurpleAir sensor not working**: Verify the sensor_index is correct and the sensor is public
- **AcuRite sensor not working**: 
  - Check if the device_id format is correct
  - Ensure you have access to the sensor in MyAcuRite dashboard
  - Verify the sensor is online and reporting data
- **Sensor not appearing on map**: Check latitude/longitude coordinates are valid
- **Database errors**: Ensure sensor_index is unique and not already in use

### Current Sensors Example
The current `sensors.json` contains sensors from the Texas coastal area:

#### PurpleAir Sensors:
- **Rockport Texas** (sensor_index: 7488)
- **Waverly Station** (sensor_index: 264547)  
- **North Padre Island** (sensor_index: 125121)

#### AcuRite Sensors:
- **Tom's Station** (sensor_index: 1823425, device_id: 24C86E120B3E-XXXXXXXX-Atlas)
- **Tom Station(white)** (sensor_index: 1982460, device_id: 24C86E0E400D-XXXXXXXX-5in1WS)
