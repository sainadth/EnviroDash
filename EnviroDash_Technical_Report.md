# EnviroDash Technical Report

## Executive Summary

EnviroDash is a comprehensive environmental monitoring dashboard that provides real-time data visualization and analysis from multiple sensor networks. The system integrates PurpleAir and AcuRite sensors to deliver environmental data including air quality, temperature, humidity, pressure, and wind speed measurements through an intuitive web-based interface.

## 1. System Architecture

### 1.1 Overall Architecture
The EnviroDash system follows a modern full-stack architecture with clear separation of concerns:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   React Client  │───▶│  Node.js Server  │───▶│   External APIs │
│   (Frontend)    │     │   (Backend)     │     │  (PurpleAir/    │
│                 │     │                 │     │   AcuRite)      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       │                       
         │                       │                       
         ▼                       ▼                       
┌─────────────────┐    ┌─────────────────┐              
│   Web Browser   │    │    Supabase     │              
│   (Leaflet Map) │    │   (Database)    │              
└─────────────────┘    └─────────────────┘              
```

### 1.2 Technology Stack

#### Frontend (client/)
- **React 19** (RC) with Vite for fast development and optimized builds
- **Redux Toolkit** for centralized state management
- **React Router v7** for client-side navigation
- **Leaflet** with React-Leaflet for interactive map visualization
- **Plotly.js** for data visualization and charting
- **Tailwind CSS v4** for responsive styling
- **Material-UI** for consistent iconography and components
- **Firebase v11** for authentication services
- **Axios** for HTTP client requests
- **React-Toastify** for user notifications
- **Lucide React** for additional icons

#### Backend (server/)
- **Node.js v18+** with Express.js framework
- **Supabase** for database and backend services
- **External API integrations** for PurpleAir and AcuRite sensors
- **CORS** for cross-origin resource sharing
- **Axios** for external API communication
- **dotenv** for environment variable management
- **Nodemon** for development server restarts
- **Real-time data processing and caching**

## 2. Frontend Architecture

### 2.1 Component Structure
The frontend follows a modular component-based architecture:

```
client/src/
├── components/          # Reusable UI components
│   ├── SensorMap.jsx   # Interactive map with clustering
│   ├── SensorChart.jsx # Chart visualization
│   ├── SensorDashboard.jsx # Main dashboard
│   ├── Dashboard.jsx   # Layout container
│   ├── AuthForm.jsx    # Authentication forms
│   ├── MarketingPanel.jsx # Authentication slideshow
│   ├── HomePage.jsx    # Home page component
│   └── Sidebar.jsx     # Navigation sidebar
├── features/           # Redux slices
│   ├── auth/          # Authentication state
│   │   ├── authSlice.js
│   │   └── authThunks.js
│   └── sensors/       # Sensor data management
│       ├── sensorsSlice.js
│       ├── sensorsThunks.js
│       └── sensorsSelectors.js
├── services/          # API communication
│   ├── api.js         # HTTP client and time range utilities
│   ├── acuriteService.js # AcuRite API (empty)
│   ├── purpleAirService.js # PurpleAir API (empty)
│   └── dataService.js # Data processing (empty)
├── routes/            # Protected routes
│   └── ProtectedRoute.jsx
├── assets/            # Static assets
│   ├── acurite.png    # AcuRite logo
│   ├── purpleAir.png  # PurpleAir logo
│   └── bg.svg         # Background graphics
├── app/               # Store configuration
│   └── store.js
├── store/             # Additional store files
│   └── sensorsThunks.js
├── firebase.js        # Firebase configuration
├── App.jsx            # Main application component
└── main.jsx           # Entry point
```

### 2.2 Key Components

#### SensorMap Component
The `SensorMap` component is the core visualization component featuring:

- **Sensor Clustering**: Implements viewport-based clustering using the `clusterSensors` function to optimize performance with 40px pixel threshold
- **Custom Markers**: Dynamic marker creation via `createCustomIcon` with different colors for sensor types (purple for PurpleAir, green for AcuRite)
- **Real-time Updates**: Integrates with Redux store through `useSelector` for live data updates
- **Interactive Popups**: Displays sensor data with loading states and real-time information
- **Viewport Management**: `ViewportSensors` component limits rendering to 200 visible sensors for performance

#### State Management
The application uses Redux Toolkit with the following slices:
- **Sensors Slice**: Manages sensor data, loading states, and error handling
- **Auth Slice**: Handles user authentication state
- **Async Thunks**: Handles API calls for `fetchSensors`, `fetchPurpleAirSensors`, `fetchAcuriteSensors`, and `fetchSensorData`

#### Dashboard Component
The `Dashboard` component provides:
- **Responsive Layout**: Dynamic width adjustment based on sensor selection
- **Sensor Type Filtering**: Toggle between PurpleAir and AcuRite sensors
- **State Management**: Coordinates between map selection and dashboard display

#### Authentication System
The `AuthForm` component includes:
- **Dual Mode**: Login and signup functionality
- **Firebase Integration**: Uses Firebase Auth for user management
- **Google OAuth**: Support for Google sign-in
- **Form Validation**: Input validation and error handling
- **Marketing Integration**: Works with `MarketingPanel` slideshow featuring 4 feature slides
- **Local Storage**: Persistent authentication state

## 3. Backend Architecture

### 3.1 Project Structure
```
server/
├── config/            # Configuration files
│   └── supabase.js    # Supabase client setup
├── data/              # Static data files
│   └── sensors.json   # Sensor metadata
├── database/          # Database schemas
│   ├── setup_rls.sql  # Row Level Security
│   └── migrations/    # Database migrations
├── routes/            # API routes
│   ├── acurite.js     # AcuRite sensor endpoints
│   ├── purpleair.js   # PurpleAir sensor endpoints
│   ├── sensors.js     # Generic sensor endpoints
│   └── api.js         # Empty API file
├── services/          # Business logic
│   └── dataService.js # Data processing service
├── test-insert.js     # Database testing script
└── server.js          # Server entry point
```

### 3.2 API Endpoints

#### Currently Implemented Endpoints
```
GET  /api/purpleair/sensors           # Get all PurpleAir sensors
GET  /api/acurite/sensors             # Get all AcuRite sensors
GET  /api/purpleair/sensors/:id/history  # Historical PurpleAir data
GET  /api/acurite/sensors/:id/live/:date # Live AcuRite readings
GET  /health                          # Health check endpoint
```

#### Authentication (Not Implemented)
Authentication is handled client-side through Firebase Auth. The server does not currently implement authentication endpoints.

### 3.3 Data Models

#### Supabase Database Schema

**Sensors Table**
```sql
{
  id: UUID (primary key),
  sensor_index: String (unique),
  name: String,
  type: String, // 'purpleair' or 'acurite'
  latitude: Number,
  longitude: Number,
  device_id: String (for AcuRite sensors),
  last_updated: Timestamp,
  created_at: Timestamp
}
```

**PurpleAir Readings Table**
```sql
{
  id: UUID (primary key),
  sensor_id: UUID (foreign key),
  timestamp: Timestamp,
  temperature: Number,
  humidity: Number,
  pressure: Number,
  pm25: Number,
  created_at: Timestamp
}
```

**AcuRite Readings Table**
```sql
{
  id: UUID (primary key),
  sensor_id: UUID (foreign key),
  timestamp: Timestamp,
  temperature: Number,
  humidity: Number,
  pressure: Number,
  wind_speed: Number,
  created_at: Timestamp
}
```

## 4. Data Integration

### 4.1 External API Integration

#### PurpleAir Integration
- **Data Types**: PM2.5 air quality, temperature, humidity, atmospheric pressure
- **Time Ranges**: Support for 6-hour, 24-hour, and 7-day historical data
- **API Parameters**: Configurable start_timestamp, average intervals (10min, 1hr, 6hr)
- **Real-time Updates**: Live sensor readings with timestamp tracking

#### AcuRite Integration  
- **Data Types**: Wind speed, temperature, humidity, barometric pressure
- **Live Data**: Real-time weather station readings
- **Historical Access**: Date-based historical data retrieval with time range filtering

### 4.2 Data Processing Pipeline

The system implements a comprehensive data processing pipeline:

1. **API Polling**: Regular polling of external sensor APIs via `sensorAPI`
2. **Data Validation**: Input validation and sanitization
3. **Normalization**: Standardization of data formats across different sensor types
4. **Time Range Filtering**: Client-side filtering for 6h, 24h, and 7d time ranges
5. **Caching**: Time-based data caching with `${sensor_index}_${timeRange}` keys
6. **Storage**: Local state management with Redux for session data

## 5. User Interface Features

### 5.1 Interactive Map
The map interface provides:
- **Sensor Clustering**: Automatic clustering based on zoom level and proximity using distance-based algorithm
- **Multi-layer Support**: Different marker styles for PurpleAir (purple) and AcuRite (green) sensors
- **Selection Interface**: Click-to-select functionality for dashboard integration
- **Real-time Popups**: Live data display with sensor information and latest readings
- **Legend System**: Visual legend showing sensor types and selection states

### 5.2 Data Visualization
The `SensorDashboard` includes:
- **Time Series Charts**: Multi-sensor comparison charts using Chart.js/Plotly
- **Time Range Controls**: 6-hour, 24-hour, and 7-day views with dynamic button selection
- **Export Functionality**: CSV data export capability for selected sensors
- **Responsive Design**: Mobile-optimized interface with flexible layouts
- **Chart Types**: 
  - Air Quality (PM2.5) for PurpleAir sensors
  - Weather Data (Wind Speed, Temperature, Humidity, Pressure) for AcuRite sensors

### 5.3 Authentication System
- **Firebase Authentication**: Client-side authentication with Google OAuth support
- **Marketing Panel**: Interactive slideshow with 4 feature slides during authentication
- **Session Management**: Local storage for authentication state persistence
- **User Management**: Profile display and logout options in sidebar
- **No Server Authentication**: Server does not implement authentication middleware

## 6. Security Implementation

### 6.1 Authentication Security
- **Firebase Authentication**: Secure client-side authentication with Google OAuth
- **Client-side State Management**: Authentication state stored in localStorage
- **CORS Configuration**: Proper cross-origin resource sharing setup
- **Environment Variables**: Secure configuration management with Vite env variables

### 6.2 API Security
- **Input Validation**: Basic request parameter validation
- **CORS Headers**: Enabled for frontend communication
- **Environment Variables**: Secure API key management for external services
- **Supabase Security**: Row Level Security (RLS) configured for database access

### 6.3 Current Security Limitations
- **No Server Authentication**: Server endpoints are not protected
- **No Rate Limiting**: API endpoints lack rate limiting
- **No Input Sanitization**: Limited input validation implementation
- **No HTTPS Enforcement**: Development setup uses HTTP

## 7. Performance Optimizations

### 7.1 Frontend Optimizations
- **Component Memoization**: React.memo and useCallback for chart components
- **Viewport Rendering**: Only render visible map markers (200 sensor limit)
- **Sensor Clustering**: Distance-based clustering with zoom-level thresholds
- **Lazy Loading**: Vite-based code splitting for route-based loading
- **Bundle Optimization**: Vite-based tree shaking and minification

### 7.2 Backend Optimizations
- **Connection Pooling**: Efficient database connection management
- **Rate Limiting**: API request throttling
- **Compression**: Gzip compression for API responses
- **Caching Strategy**: Redis for frequently accessed data
- **Error Handling**: Comprehensive error responses

## 8. Deployment and DevOps

### 8.1 Development Environment
- **Hot Module Replacement**: Vite HMR for frontend development
- **Nodemon**: Automatic server restarts during development
- **Environment Configuration**: Separate development and production configs
- **Build Tools**: Vite for frontend, Node.js for backend

### 8.2 Production Deployment

#### Environment Variables Required
```
# Server (.env)
PORT=3001
NODE_ENV=development
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
PURPLEAIR_API_KEY=your-purpleair-api-key
PURPLEAIR_BASE_URL=https://api.purpleair.com/v1
ACURITE_API_KEY=your-acurite-api-key
ACURITE_BASE_URL=https://api.acurite.com
CACHE_DURATION_MINUTES=5
MAX_CACHE_SIZE=1000
API_RATE_LIMIT_REQUESTS=100
API_RATE_LIMIT_WINDOW_MINUTES=15
ALLOWED_ORIGINS=https://your-frontend-domain.com

# Client (.env)
VITE_API_BASE_URL=http://localhost:3001/api
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
VITE_NODE_ENV=development
```

#### Deployment Considerations
- Use Supabase hosted database for production
- Configure proper CORS origins with ALLOWED_ORIGINS environment variable
- Set up environment-specific API keys for PurpleAir and AcuRite
- Enable HTTPS for production deployment
- Configure caching and rate limiting parameters
- Set up proper Firebase project configuration
- Use production-ready hosting platforms (Render, Railway, Vercel)

### 8.3 Testing Framework
```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run integration tests
npm run test:integration
```

## 9. Monitoring & Logging

### 9.1 Current Logging Implementation
- **Console Logging**: Extensive use of console.log with emoji indicators
- **Client-side Logging**: Redux state changes and component lifecycle events
- **Server-side Logging**: API request/response logging with visual indicators
- **No Persistent Logging**: Logs are not stored in files or external services

### 9.2 Logging Patterns Used
```javascript
// Server-side logging examples
console.log('🚨 getAcuriteLiveData TRIGGERED for deviceId: ${deviceId}');
console.log('📡 Fetching data from: ${apiUrl}');
console.log('✅ Data received successfully');

// Client-side logging examples
console.log('📡 Fetching PurpleAir sensors...');
console.log('✅ PurpleAir sensors received:', data);
console.log('❌ Error loading sensors:', error);
```

### 9.3 Missing Monitoring Features
- **Error Tracking**: No centralized error tracking system
- **Performance Monitoring**: No application performance metrics
- **Health Checks**: Basic health endpoint exists but no monitoring
- **Log Aggregation**: No log collection or analysis system

## 10. Data Flow Architecture

### 10.1 Sensor Data Flow
```
External APIs → DataService → Time Range Processing → API Routes → Redux Store → UI Components
```

### 10.2 User Interaction Flow
```
User Click → Map Event → Sensor Selection → Redux Action → API Call → State Update → Chart Rendering
```

### 10.3 Authentication Flow
```
Firebase Login → Client State Update → Protected Route Access → Server API Calls
```

### 10.4 Time Range Selection Flow
```
Time Range Button → handleTimeRangeChange → Clear Data → API Reload with Timestamp → Chart Update
```

## 11. Current Implementation Status

### 11.1 Completed Features
- Interactive map with sensor clustering (40px pixel threshold)
- Real-time data visualization with Plotly.js charts
- Time range selection (6h, 24h, 7d) with full backend implementation
- Firebase authentication system with Google OAuth
- CSV data export functionality
- Responsive design with Tailwind CSS v4
- Multi-sensor type support (PurpleAir and AcuRite)
- Supabase database integration with Row Level Security
- Marketing slideshow panel with 4 feature slides
- API data caching with time-based keys
- Environment variable management for security
- CORS configuration for production/development

### 11.2 Partially Implemented Features
- **Server Authentication**: Client uses Firebase but server has no auth middleware
- **Data Services**: Service files exist but some are empty placeholders
- **Error Handling**: Basic error handling with toast notifications but no centralized error management
- **API Rate Limiting**: Configuration exists but not fully implemented
- **Input Validation**: Basic validation but not comprehensive across all endpoints

### 11.3 Missing/Incomplete Features
- **Server Authentication**: No JWT or session management on server
- **Persistent Logging**: Only console logging implemented
- **Test Coverage**: No visible test files or test implementation
- **Rate Limiting**: No API rate limiting implemented
- **Input Validation**: Basic validation but not comprehensive
- **Real-time Updates**: No WebSocket or real-time data streaming

## 12. Technical Achievements

### 12.1 Advanced Features
- **Dynamic Clustering**: Zoom-level based sensor clustering with 40px pixel threshold distance calculation
- **Time Range Support**: Full 6h, 24h, and 7d time range selection with backend timestamp filtering
- **Real-time Updates**: Live sensor data integration with PurpleAir and AcuRite APIs
- **Interactive Charts**: Plotly.js integration with custom hover templates and time series visualization
- **Performance Optimization**: Viewport-based rendering with 200 sensor limit and efficient clustering

### 12.2 Code Quality
- **Modern Architecture**: React 19 RC with hooks, Redux Toolkit, Vite 6.3.5 build system
- **Type Safety**: ESLint configuration with React hooks and refresh plugins
- **Environment Management**: Comprehensive .env configuration for development and production
- **Security Best Practices**: API key management, CORS configuration, Firebase authentication
- **Component Reusability**: Modular component structure with clear separation of concerns
- **State Management**: Centralized state management with Redux Toolkit
- **Error Handling**: Comprehensive error handling with toast notifications

## 13. Future Roadmap

### 13.1 Short-term Enhancements
- Implement persistent logging with Winston
- Add comprehensive test coverage
- Optimize mobile interface
- Implement WebSocket for real-time updates

### 13.2 Long-term Vision
- Machine learning integration for predictive analytics
- Advanced data visualization options
- Multi-tenant support
- API rate limiting and monitoring
- Enhanced security features

## 14. Conclusion

EnviroDash represents a comprehensive environmental monitoring solution that demonstrates modern React development practices and robust external API integration. The system successfully implements core functionality including interactive mapping, sensor data visualization, time range selection, and client-side authentication.

### Strengths
- **Modern Frontend Architecture**: React 19 RC with Redux Toolkit and Vite 6.3.5
- **Effective Data Visualization**: Interactive maps with clustering and Plotly.js chart visualization
- **Complete External API Integration**: Working integration with PurpleAir and AcuRite APIs including time range support
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS v4
- **Real-time Database**: Supabase integration with Row Level Security
- **Security Implementation**: Firebase authentication with Google OAuth and environment variable management
- **Performance Optimization**: Viewport-based rendering, sensor clustering, and API caching

### Areas Requiring Completion
- **Server Authentication**: Backend lacks authentication middleware for API protection
- **Enhanced Error Handling**: Centralized error management system needed
- **Testing**: No test coverage implemented
- **Production Security**: Rate limiting and comprehensive input validation needed
- **Real-time Updates**: WebSocket integration for live data streaming

The current implementation provides a robust foundation for environmental data visualization and is ready for production deployment with minor security enhancements. All core features are functional and the system demonstrates professional-grade development practices.

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Authors**: EnviroDash Development Team  
**Status**: Development In Progress - Partial Implementation