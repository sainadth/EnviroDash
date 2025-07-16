-- Add unique constraints to prevent duplicate readings

-- Add unique constraint for PurpleAir readings
ALTER TABLE purpleair_readings 
ADD CONSTRAINT unique_purpleair_sensor_timestamp 
UNIQUE (sensor_id, timestamp);

-- Add unique constraint for AcuRite readings  
ALTER TABLE acurite_readings 
ADD CONSTRAINT unique_acurite_sensor_timestamp 
UNIQUE (sensor_id, timestamp);
