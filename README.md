# EnviroDash

A comprehensive environmental monitoring dashboard that provides real-time data visualization and analysis from multiple sensor networks including PurpleAir and AcuRite sensors.

## 🌟 Features

- **Real-time Environmental Monitoring**: Track air quality, temperature, humidity, pressure, and wind speed
- **Interactive Map Interface**: Visual sensor selection with clustering and filtering capabilities
- **Multi-Sensor Support**: 
  - PurpleAir sensors for air quality monitoring (PM2.5, temperature, humidity, pressure)
  - AcuRite sensors for weather data (wind speed, temperature, humidity, pressure)
- **Time Range Analysis**: View data for past 6 hours, 24 hours, or 7 days
- **Dynamic Charts**: Interactive charts with multiple time series visualization
- **Data Export**: Download sensor data as CSV files for further analysis
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **User Authentication**: Secure login system with slideshow marketing panel

## 🚀 Tech Stack

### Frontend (Client)
- **React 19** (RC) with Vite for fast development
- **Redux Toolkit** for state management
- **React Router v7** for navigation
- **Leaflet** with React-Leaflet for interactive maps
- **Plotly.js** for data visualization
- **Tailwind CSS v4** for styling
- **Material-UI** icons and components
- **Firebase v11** for authentication
- **Axios** for HTTP requests
- **React-Toastify** for notifications
- **Lucide React** for additional icons

### Backend (Server)
- **Node.js v18+** with Express.js
- **Supabase** for database and backend services
- **External API integrations** for PurpleAir and AcuRite sensors
- **Axios** for API requests
- **CORS** middleware for cross-origin requests
- **dotenv** for environment variable management
- **Real-time data processing and caching**

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/EnviroDash.git
   cd EnviroDash
   ```

2. **Install dependencies**
   
   For the server:
   ```bash
   cd server
   npm install
   ```
   
   For the client:
   ```bash
   cd ../client
   npm install
   ```

3. **Environment Setup**
   
   Create `.env` files in both server and client directories by copying the example files:
   
   ```bash
   # Copy example environment files
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   ```
   
   Then edit each `.env` file with your actual values. See the `.env.example` files for the complete list of required environment variables.
   
   **Key Environment Variables:**
   
   **Server (.env)**:
   - `PURPLEAIR_API_KEY` - Get from https://api.purpleair.com/
   - `ACURITE_API_KEY` - Get from AcuRite developer portal
   - `VITE_SUPABASE_URL` - Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key
   
   **Client (.env)**:
   - `VITE_API_BASE_URL` - Your backend API URL (http://localhost:3001/api for development)
   - `VITE_FIREBASE_API_KEY` - Your Firebase API key
   - `VITE_FIREBASE_PROJECT_ID` - Your Firebase project ID
   - Other Firebase configuration values

   **⚠️ SECURITY NOTE**: 
   - Replace all placeholder values with your actual API keys and configuration
   - Never commit real API keys to version control
   - The `.env` files are already in `.gitignore` to prevent accidental commits
   - Use environment variables for all sensitive information
   - Consider using Firebase emulator for local development

4. **Start the development servers**
   
   Terminal 1 (Server):
   ```bash
   cd server
   npm run dev
   ```
   
   Terminal 2 (Client):
   ```bash
   cd client
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

## 🎯 Usage

### Getting Started
1. Register for a new account or login with existing credentials
2. Select sensor type (PurpleAir or AcuRite) from the dropdown
3. Click on sensor markers on the map to add them to your dashboard
4. View real-time charts and data for selected sensors
5. Change time ranges (6h, 24h, 7d) to analyze historical data
6. Export data as CSV files for further analysis

### Dashboard Features
- **Sensor Selection**: Click map markers to add/remove sensors
- **Time Range Control**: Toggle between 6 hours, 24 hours, and 7 days
- **Chart Types**: 
  - Air Quality (PM2.5) for PurpleAir sensors
  - Weather Data (Wind Speed) for AcuRite sensors
  - Environmental Data (Temperature, Humidity, Pressure) for both
- **Data Export**: Download all selected sensor data as CSV
- **Sensor Management**: Remove individual sensors or clear all

## 📊 Data Sources

### PurpleAir Sensors
- **PM2.5**: Air quality particulate matter
- **Temperature**: Ambient temperature (°F)
- **Humidity**: Relative humidity (%)
- **Pressure**: Atmospheric pressure (hPa)

### AcuRite Sensors
- **Wind Speed**: Wind velocity (mph)
- **Temperature**: Ambient temperature (°F)
- **Humidity**: Relative humidity (%)
- **Pressure**: Atmospheric pressure (inHg)

## 🔧 Adding New Sensors

### PurpleAir Sensors
1. Get your API key from [PurpleAir API Dashboard](https://api.purpleair.com/)
2. Add sensors to `server/data/sensors.json`
3. Update `PURPLEAIR_API_KEY` in server `.env` file

### AcuRite Sensors
1. **Getting Device ID from MyAcuRite Dashboard**:
   - Log into your MyAcuRite account at [myacurite.com](https://myacurite.com)
   - Navigate to "My Devices" section
   - Click on your device to view details
   - Copy the Device ID (format: `0x########` or similar)

2. **Add to Configuration**:
   - Add the device ID to `server/data/sensors.json`
   - Update `ACURITE_API_KEY` in server `.env` file

### Sensor Configuration Format
```json
{
  "purpleair": [
    {
      "id": "sensor_id",
      "name": "Sensor Name",
      "location": "Location Description"
    }
  ],
  "acurite": [
    {
      "id": "0x12345678",
      "name": "Weather Station Name",
      "location": "Installation Location"
    }
  ]
}
```

## 🚀 Deployment

### Option 1: Render (Recommended)
1. **Fork the repository** to your GitHub account
2. **Deploy Backend**:
   - Connect your GitHub to Render
   - Create a new Web Service
   - Select your EnviroDash repository
   - Set root directory to `server`
   - Add environment variables in Render dashboard
   - Deploy

3. **Deploy Frontend**:
   - Create a new Static Site
   - Set root directory to `client`
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Add environment variables
   - Deploy

### Option 2: Railway
1. **Deploy Backend**:
   - Connect GitHub to Railway
   - Select `server` directory
   - Add environment variables
   - Deploy

2. **Deploy Frontend**:
   - Create new Railway project
   - Select `client` directory
   - Configure build settings
   - Deploy

### Option 3: Vercel + Railway
- **Frontend**: Deploy to Vercel (automatic GitHub integration)
- **Backend**: Deploy to Railway or Render

### Environment Variables for Production
- Update `VITE_API_BASE_URL` to your deployed backend URL
- Ensure all API keys are properly configured
- Set up proper CORS origins for production

## 🔒 Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for all sensitive data
3. **Implement proper CORS** settings for production
4. **Use HTTPS** for all external API calls
5. **Regularly rotate API keys**
6. **Monitor API usage** to prevent abuse

## 🏗️ Project Structure

```
EnviroDash/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── AuthForm.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── HomePage.jsx
│   │   │   ├── MarketingPanel.jsx
│   │   │   ├── SensorChart.jsx
│   │   │   ├── SensorDashboard.jsx
│   │   │   ├── SensorMap.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── features/       # Redux slices
│   │   │   ├── auth/       # Authentication state
│   │   │   └── sensors/    # Sensor data state
│   │   ├── services/       # API services
│   │   │   ├── acuriteService.js
│   │   │   ├── api.js
│   │   │   ├── dataService.js
│   │   │   └── purpleAirService.js
│   │   ├── routes/         # Route protection
│   │   │   └── ProtectedRoute.jsx
│   │   ├── app/            # Redux store
│   │   │   └── store.js
│   │   ├── firebase.js     # Firebase configuration
│   │   └── main.jsx        # App entry point
│   └── package.json
├── server/                 # Node.js backend
│   ├── routes/            # API routes
│   │   ├── acurite.js
│   │   ├── api.js
│   │   ├── purpleair.js
│   │   └── sensors.js
│   ├── services/          # Data processing
│   │   └── dataService.js
│   ├── config/            # Configuration
│   │   └── supabase.js
│   ├── database/          # Database setup
│   │   ├── migrations/
│   │   └── setup_rls.sql
│   ├── data/              # Static data
│   │   └── sensors.json
│   └── package.json
└── README.md
```

## 🔧 API Endpoints

### Sensor Data
- `GET /api/purpleair/sensors` - Get all PurpleAir sensors
- `GET /api/acurite/sensors` - Get all AcuRite sensors  
- `GET /api/purpleair/sensors/:id/history` - Get PurpleAir sensor history data
- `GET /api/acurite/sensors/:id/live/:date` - Get AcuRite sensor live data

### General
- `GET /api/sensors` - Get sensor configuration data
- `GET /api/health` - API health check

**Note**: Authentication is handled client-side through Firebase Auth, not through API endpoints.

## 🛠️ Development & Troubleshooting

### Common Issues

1. **Environment Variables Not Loading**
   - Ensure `.env` files are in the correct directories
   - Restart development servers after changing environment variables
   - Check that variable names start with `VITE_` for client-side variables

2. **Firebase Authentication Issues**
   - Verify Firebase configuration in `.env` file
   - Check Firebase project settings and authentication methods
   - Ensure authorized domains are configured in Firebase console

3. **API Rate Limiting**
   - PurpleAir API has rate limits - implement caching
   - Monitor API usage in respective dashboards
   - Use appropriate delay between requests

4. **CORS Errors**
   - Ensure CORS is properly configured in server
   - Check that frontend URL matches CORS origin settings
   - Verify API base URL in client configuration

### Development Tips

- Use `npm run dev` for development with hot reloading
- Check browser console for client-side errors
- Monitor server logs for API issues
- Use browser developer tools to inspect network requests
- Test with different sensor types to ensure compatibility

### Git Best Practices

If you accidentally committed sensitive files:

```bash
# Remove files from git tracking
git rm --cached .env
git rm --cached client/.env
git rm --cached server/.env

# Add to .gitignore if not already there
echo "*.env" >> .gitignore
echo "node_modules/" >> .gitignore

# Commit the changes
git add .gitignore
git commit -m "Remove sensitive files and update .gitignore"
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- PurpleAir for providing air quality sensor data
- AcuRite for weather sensor data
- OpenStreetMap for mapping services
- React and Node.js communities for excellent tools and documentation

## 📞 Support

For support, please open an issue on GitHub or contact the development team.

---

**EnviroDash** - Making environmental data accessible and actionable.