-- EnviroDash Database Schema
-- Run this in Supabase Dashboard → SQL Editor

-- Create sensors table
CREATE TABLE IF NOT EXISTS sensors (
    id SERIAL PRIMARY KEY,
    sensor_index INTEGER UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    type VARCHAR(50) NOT NULL,
    device_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create purpleair_readings table
CREATE TABLE IF NOT EXISTS purpleair_readings (
    id SERIAL PRIMARY KEY,
    sensor_id INTEGER REFERENCES sensors(id),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    temperature FLOAT,
    humidity FLOAT,
    pressure FLOAT,
    pm25 FLOAT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create acurite_readings table
CREATE TABLE IF NOT EXISTS acurite_readings (
    id SERIAL PRIMARY KEY,
    sensor_id INTEGER REFERENCES sensors(id),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    temperature FLOAT,
    humidity FLOAT,
    pressure FLOAT,
    wind_speed FLOAT,
    wind_speed_avg FLOAT,
    wind_direction FLOAT,
    wind_direction_info JSONB,
    dew_point FLOAT,
    heat_index FLOAT,
    rainfall FLOAT,
    uv_index FLOAT,
    light_intensity FLOAT,
    measured_light FLOAT,
    interference FLOAT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sensors_type ON sensors(type);
CREATE INDEX IF NOT EXISTS idx_purpleair_readings_sensor_id ON purpleair_readings(sensor_id);
CREATE INDEX IF NOT EXISTS idx_acurite_readings_sensor_id ON acurite_readings(sensor_id);
CREATE INDEX IF NOT EXISTS idx_purpleair_readings_timestamp ON purpleair_readings(timestamp);
CREATE INDEX IF NOT EXISTS idx_acurite_readings_timestamp ON acurite_readings(timestamp);