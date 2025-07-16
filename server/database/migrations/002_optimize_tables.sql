-- Optimize existing tables for time series data

-- Add indexes for time series queries
CREATE INDEX IF NOT EXISTS idx_purpleair_readings_sensor_time ON purpleair_readings(sensor_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_acurite_readings_sensor_time ON acurite_readings(sensor_id, timestamp DESC);

-- Add composite indexes for common queries (without WHERE clause for compatibility)
CREATE INDEX IF NOT EXISTS idx_purpleair_readings_time_desc ON purpleair_readings(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_acurite_readings_time_desc ON acurite_readings(timestamp DESC);

-- Additional performance indexes
CREATE INDEX IF NOT EXISTS idx_purpleair_readings_composite ON purpleair_readings(sensor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_acurite_readings_composite ON acurite_readings(sensor_id, created_at DESC);
