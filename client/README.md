# EnviroDash Client

Frontend application for the EnviroDash environmental monitoring dashboard built with React and Vite.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```
This starts the development server at http://localhost:5173

### Build
```bash
npm run build
```
Creates an optimized production build in the `dist/` directory.

### Preview
```bash
npm run preview
```
Preview the production build locally.

## 🛠️ Tech Stack

- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **Redux Toolkit** - State management
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling framework
- **Leaflet** - Interactive maps
- **Plotly.js** - Data visualization
- **Material-UI** - Icons and components
- **Firebase** - Authentication and backend services
- **Axios** - HTTP client for API requests

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── SensorMap.jsx   # Interactive map with sensors
│   ├── SensorChart.jsx # Chart visualization
│   ├── SensorDashboard.jsx # Main dashboard
│   ├── Dashboard.jsx   # Layout container
│   ├── AuthForm.jsx    # Authentication forms
│   ├── MarketingPanel.jsx # Marketing slideshow
│   ├── HomePage.jsx    # Home page component
│   └── Sidebar.jsx     # Navigation sidebar
├── features/           # Redux slices
│   ├── auth/          # Authentication state
│   └── sensors/       # Sensor data state
├── services/          # API services
│   └── api.js         # API client
├── routes/            # Route components
│   └── ProtectedRoute.jsx # Protected route wrapper
├── assets/            # Static assets
│   ├── acurite.png    # AcuRite logo
│   ├── purpleAir.png  # PurpleAir logo
│   └── bg.svg         # Background graphics
├── app/               # App configuration
│   └── store.js       # Redux store
├── store/             # Additional store files
├── App.jsx            # Main app component
├── firebase.js        # Firebase configuration
└── main.jsx           # Entry point
```

## 🎨 Key Components

### SensorMap
Interactive map component with:
- Sensor clustering for performance (40px pixel threshold)
- Real-time marker updates with custom icons
- Popup information display with sensor data
- Sensor selection functionality
- Viewport-based rendering (200 sensor limit)
- Support for PurpleAir (purple markers) and AcuRite (green markers)

### SensorChart  
Chart visualization component featuring:
- Plotly.js powered interactive charts
- Multiple time series support
- Time range controls (6h, 24h, 7d)
- Data export capabilities
- Real-time data updates

### SensorDashboard
Main dashboard component that:
- Manages sensor selection from map
- Handles time range changes (6 hours, 24 hours, 7 days)
- Displays multiple chart types (Air Quality, Weather Data, Environmental)
- Provides CSV data export functionality
- Shows sensor-specific charts based on type

### Dashboard
Layout container component that:
- Manages responsive layout
- Coordinates between map and dashboard
- Handles sensor type filtering (PurpleAir/AcuRite toggle)
- Provides sidebar navigation

### AuthForm
Authentication component with:
- Login/register dual functionality
- Form validation and error handling
- Integration with Firebase authentication
- Responsive design

### MarketingPanel
Marketing slideshow component with:
- 4 feature slides with auto-advance (5 seconds)
- Navigation controls and indicators
- Smooth transitions and animations
- EnviroDash-specific content

## 🔧 Environment Variables

Create a `.env` file in the client directory:

```
VITE_API_BASE_URL=http://localhost:3001/api
```

For production, update the API URL to your deployed backend:
```
VITE_API_BASE_URL=https://your-backend-url.onrender.com/api
```

## 📊 State Management

Using Redux Toolkit for:
- **Authentication**: User login state, Firebase authentication
- **Sensors**: Sensor data, loading states, error handling
- **UI State**: Dashboard filters, selected sensors, time ranges

### Key Redux Slices:
- **sensorsSlice**: Manages sensor data and API calls
- **authSlice**: Handles user authentication state
- **sensorsThunks**: Async thunks for API operations

## 🎯 Features

- **Real-time Environmental Data**: Live sensor data from PurpleAir and AcuRite networks
- **Interactive Maps**: Leaflet-based sensor visualization with clustering
- **Time Range Analysis**: View data for 6 hours, 24 hours, or 7 days
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Data Visualization**: Plotly.js powered interactive charts
- **Firebase Authentication**: Secure user authentication system
- **CSV Data Export**: Download sensor data for further analysis
- **Sensor Type Filtering**: Toggle between PurpleAir and AcuRite sensors
- **Marketing Slideshow**: Interactive onboarding during authentication

## 🎨 Styling and UI

- **Tailwind CSS**: Utility-first CSS framework for styling
- **Material-UI Icons**: Consistent iconography throughout the app
- **Responsive Design**: Mobile-first approach with breakpoints
- **Custom Components**: Reusable UI components with consistent styling
- **Animations**: Smooth transitions and loading states

## 🔍 Development Notes

### Vite Configuration
The project uses Vite for fast development with:
- Hot Module Replacement (HMR)
- Fast refresh for React components
- Optimized builds with tree-shaking
- Tailwind CSS integration

### Performance Optimizations
- **Sensor clustering**: Distance-based clustering with 40px pixel threshold
- **Viewport-based rendering**: Only render visible map markers (200 sensor limit)
- **Memoized components**: React.memo and useCallback for chart updates
- **Efficient API data caching**: Time-based caching with sensor-specific keys
- **Lazy loading**: Component-level code splitting

### Firebase Integration
- **Authentication**: Login/register functionality
- **Real-time updates**: Potential for real-time sensor data
- **Secure configuration**: Environment-based Firebase config

### API Integration
- **Axios HTTP client**: For backend API communication
- **Error handling**: Comprehensive error handling with toast notifications
- **Loading states**: Visual feedback for API operations

## 🧪 Testing

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Static Hosting Services

#### Netlify
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard

#### Vercel
1. Connect your GitHub repository
2. Vercel auto-detects Vite configuration
3. Add environment variables in Vercel dashboard

#### Other Static Hosts
The built files in `dist/` can be deployed to:
- AWS S3 + CloudFront
- GitHub Pages
- Firebase Hosting
- Any static file hosting service

### Environment Variables for Production
Make sure to set the correct backend API URL:
```
VITE_API_BASE_URL=https://your-backend-url.onrender.com/api
```

## 📚 Key Dependencies

### Core Dependencies
- **React 19**: Latest React version with new features
- **Vite**: Fast build tool and development server
- **Redux Toolkit**: Modern Redux for state management
- **React Router**: Client-side routing
- **Axios**: HTTP client for API requests

### UI and Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Material-UI**: Icons and components
- **Lucide React**: Additional icon library
- **React Icons**: Icon library

### Maps and Visualization
- **Leaflet**: Interactive maps library
- **React Leaflet**: React wrapper for Leaflet
- **Plotly.js**: Interactive charting library
- **React Plotly.js**: React wrapper for Plotly

### Authentication and Backend
- **Firebase**: Authentication and backend services
- **React Redux**: React bindings for Redux

## 🔧 Configuration Files

- **vite.config.js**: Vite configuration
- **tailwind.config.js**: Tailwind CSS configuration
- **eslint.config.js**: ESLint configuration
- **package.json**: Dependencies and scripts

## 📱 Responsive Design

The application is fully responsive with:
- **Mobile-first approach**: Designed for mobile devices first
- **Breakpoint system**: Tailwind CSS responsive utilities
- **Flexible layouts**: Adaptable to different screen sizes
- **Touch-friendly**: Optimized for touch interactions
