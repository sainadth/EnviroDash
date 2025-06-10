import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useDispatch, useSelector } from 'react-redux';
import { selectSensor } from '../features/sensors/sensorsSlice';
import { useCallback, useEffect, useState } from 'react';

// Custom marker icon setup
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Viewport manager component
const ViewportSensors = ({ sensors, onSensorClick }) => {
  const [visibleSensors, setVisibleSensors] = useState([]);
  const [isMapReady, setIsMapReady] = useState(false);
  const map = useMap();

  const updateVisibleSensors = useCallback(() => {
    if (!map || !isMapReady) return;
    try {
      const bounds = map.getBounds();
      const visible = sensors
        .filter(
          (sensor) =>
            sensor.latitude &&
            sensor.longitude &&
            bounds.contains([sensor.latitude, sensor.longitude])
        )
        .slice(0, 100); // Limit to prevent performance issues
      setVisibleSensors(visible);
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
      {visibleSensors.map((sensor) => (
        <Marker
          key={sensor.sensor_index}
          position={[sensor.latitude, sensor.longitude]}
          icon={customIcon}
          eventHandlers={{
            click: () => onSensorClick && onSensorClick(sensor),
          }}
        >
          <Popup>
            <div className="text-sm">
              <strong className="block mb-1">{sensor.name}</strong>
              <span>PM2.5: {sensor['pm2.5']} µg/m³</span>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
};

const SensorMap = () => {
  const dispatch = useDispatch();
  const { items: sensors } = useSelector((state) => state.sensors);

  return (
    <div className="relative h-[calc(100vh-2rem)] w-full rounded-lg shadow-md overflow-hidden">
      <MapContainer
        center={[40.601, -112.043]}
        zoom={13}
        className="h-full w-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ViewportSensors
          sensors={sensors}
          onSensorClick={(sensor) => dispatch(selectSensor(sensor))}
        />
      </MapContainer>
    </div>
  );
};

export default SensorMap;