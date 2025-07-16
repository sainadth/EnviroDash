const fs = require('fs');
const path = require('path');
const axios = require('axios');
const supabase = require('../config/supabase');

class DataService {
    constructor() {
        this.sensorsPath = path.join(__dirname, '../data/sensors.json');
        // No caching - always fetch fresh data
    }

    getAllSensors() {
        const sensorsData = JSON.parse(fs.readFileSync(this.sensorsPath, 'utf8'));
        return sensorsData;
    }

    getSensorsByType(type) {
        const sensors = this.getAllSensors();
        return sensors.filter(s => s.type === type);
    }

    getSensorById(sensorIndex, type = null) {
        const sensors = this.getAllSensors();
        return sensors.find(s => s.sensor_index == sensorIndex && (!type || s.type === type));
    }

    async getAcuriteLiveData(deviceId, date) {
        console.log(`🚨 getAcuriteLiveData TRIGGERED for deviceId: ${deviceId}, date: ${date}`);
        
        const apiUrl = `https://dataapi.myacurite.com/mar-sensor-readings/${deviceId}/1h-summaries/${date}.json`;
        
        try {
            console.log(`🔗 FULL AcuRite API URL: ${apiUrl}`);
            console.log(`🌪️ Fetching AcuRite data from: ${apiUrl}`);
            const response = await axios.get(apiUrl, { timeout: 10000 });
            
            console.log(`📡 AcuRite API response status: ${response.status}`);
            console.log(`📦 AcuRite API response size: ${JSON.stringify(response.data).length} chars`);
            console.log(`🔑 AcuRite API response keys: ${Object.keys(response.data)}`);
            
            // Check if response has actual data
            if (!response.data || Object.keys(response.data).length === 0) {
                console.log(`⚠️ AcuRite API returned empty data for device ${deviceId} on ${date} - NOT SAVING TO DATABASE`);
                return response.data;
            }
            
            // Find sensor by device_id to get sensor_index
            const sensor = this.getAllSensors().find(s => s.device_id === deviceId);
            if (sensor) {
                console.log(`✅ Found sensor for device_id ${deviceId}: ${sensor.name} (index: ${sensor.sensor_index})`);
                await this.saveSensorReading(sensor.sensor_index, response.data, 'acurite');
            } else {
                console.log(`⚠️ No sensor found for device_id: ${deviceId}`);
            }
            
            return response.data;
        } catch (error) {
            console.error(`❌ AcuRite API Error for ${deviceId}:`, {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText
            });
            
            return {}; // Return empty object instead of throwing
        }
    }

    async getPurpleAirLiveData(sensorIndex, options = {}) {
        const apiUrl = `https://api.purpleair.com/v1/sensors/${sensorIndex}/history`;
        
        // Calculate start timestamp (current time - 6 hours)
        const sixHoursAgo = new Date(Date.now() - (6 * 60 * 60 * 1000));
        const startTimestamp = Math.floor(sixHoursAgo.getTime() / 1000);
        
        const params = {
            start_timestamp: options.startTimestamp || startTimestamp,
            average: options.average || 10,
            fields: options.fields || 'temperature, humidity, pm2.5_alt, pressure',
            ...options.additionalParams
        };
        
        try {
            console.log(`💜 Fetching PurpleAir data for sensor ${sensorIndex}...`);
            const response = await axios.get(apiUrl, {
                headers: {
                    'X-API-Key': options.apiKey || process.env.PURPLEAIR_API_KEY
                },
                params: params,
                timeout: 20000 // Increased timeout to 20 seconds
            });
            
            console.log(`✅ PurpleAir API response received for sensor ${sensorIndex}`);
            
            // Save to database
            await this.saveSensorReading(sensorIndex, response.data, 'purpleair');
            
            return response.data;
        } catch (error) {
            console.error(`❌ PurpleAir API Error for sensor ${sensorIndex}:`, {
                message: error.message,
                code: error.code,
                status: error.response?.status
            });
            
            // Return empty data instead of throwing to prevent frontend crashes
            return { fields: [], data: [] };
        }
    }

    async saveSensorReading(sensorIndex, data, type) {
        try {
            console.log(`📝 Attempting to save ${type} sensor reading for ${sensorIndex}`);
            
            // Skip saving if data is empty - DO NOT SAVE EMPTY DATA
            if (!data || Object.keys(data).length === 0) {
                console.log(`⏭️ SKIPPING save for ${type} sensor ${sensorIndex} - empty data`);
                return;
            }
            
            // Ensure sensor exists in database
            const sensor = await this.upsertSensor(sensorIndex);
            console.log(`🔍 Sensor upsert result:`, sensor ? `ID: ${sensor.id}` : 'NULL');
            
            if (sensor) {
                // Save directly to specific sensor type table
                if (type === 'purpleair') {
                    console.log(`💜 Saving to purpleair_readings table`);
                    await this.savePurpleAirReading(sensor.id, data);
                } else if (type === 'acurite') {
                    console.log(`🌪️ Saving to acurite_readings table`);
                    await this.saveAcuriteReading(sensor.id, data);
                }
                
                console.log(`✅ Saved new ${type} sensor reading for ${sensorIndex} to Supabase`);
            } else {
                console.error(`❌ Sensor ${sensorIndex} not found or could not be created`);
            }
        } catch (error) {
            console.error(`❌ Error saving sensor reading for ${sensorIndex}:`, {
                message: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint,
                stack: error.stack
            });
        }
    }

    async savePurpleAirReading(sensorId, data) {
        try {
            console.log(`🔍 Processing PurpleAir data with ${data.data?.length || 0} readings`);
            
            // Save all data points from the API response
            if (data.fields && data.data && data.data.length > 0) {
                const fieldNames = data.fields;
                let savedCount = 0;
                
                for (const reading of data.data) {
                    const fields = {};
                    
                    // Map each reading
                    fieldNames.forEach((fieldName, index) => {
                        const value = reading[index];
                        switch (fieldName) {
                            case 'time_stamp':
                                fields.timestamp = new Date(value * 1000).toISOString();
                                break;
                            case 'temperature':
                                fields.temperature = value;
                                break;
                            case 'humidity':
                                fields.humidity = value;
                                break;
                            case 'pressure':
                                fields.pressure = value;
                                break;
                            case 'pm2.5_alt':
                                fields.pm25 = value;
                                break;
                        }
                    });
                    
                    // Insert each reading with its actual timestamp
                    try {
                        const { error } = await supabase
                            .from('purpleair_readings')
                            .upsert({
                                sensor_id: sensorId,
                                timestamp: fields.timestamp,
                                temperature: fields.temperature,
                                humidity: fields.humidity,
                                pressure: fields.pressure,
                                pm25: fields.pm25
                            }, {
                                onConflict: 'sensor_id,timestamp',
                                ignoreDuplicates: true
                            });

                        if (error) {
                            console.error(`❌ PurpleAir insert error for timestamp ${fields.timestamp}:`, error);
                        } else {
                            savedCount++;
                        }
                    } catch (insertError) {
                        console.error(`❌ Insert error:`, insertError);
                    }
                }
                
                console.log(`✅ Processed ${data.data.length} readings, saved ${savedCount} new records`);
            } else {
                console.log('⚠️ No data array found in PurpleAir response');
            }
        } catch (error) {
            console.error(`❌ savePurpleAirReading error:`, error);
            throw error;
        }
    }

    async saveAcuriteReading(sensorId, data) {
        try {
            // Skip saving if data is empty
            if (!data || Object.keys(data).length === 0) {
                console.log(`⏭️ Skipping AcuRite save - no data available`);
                return;
            }
            
            console.log(`🔍 DEBUG: Starting time series extraction for sensor ${sensorId}`);
            console.log(`🔍 DEBUG: Data keys:`, Object.keys(data));
            console.log(`🔍 DEBUG: First sensor data length:`, Array.isArray(data['1']) ? data['1'].length : 'not array');
            
            // Use the new time series extraction function ONLY
            const allReadings = this.extractAllAcuriteReadings(data);
            console.log(`🔍 Extracted ${allReadings.length} AcuRite readings`);
            
            if (allReadings.length === 0) {
                console.log(`⏭️ Skipping AcuRite save - no readings extracted`);
                return;
            }
            
            let savedCount = 0;
            
            // Save each reading with its timestamp
            for (const reading of allReadings) {
                const dataToSave = {
                    sensor_id: sensorId,
                    timestamp: reading.timestamp,
                    temperature: reading.temperature,
                    humidity: reading.humidity,
                    wind_speed: reading.wind_speed,
                    wind_direction: reading.wind_direction,
                    pressure: reading.pressure,
                    rainfall: reading.rainfall
                };
                
                try {
                    const { error } = await supabase
                        .from('acurite_readings')
                        .upsert(dataToSave, {
                            onConflict: 'sensor_id,timestamp',
                            ignoreDuplicates: true
                        });

                    if (error) {
                        console.error(`❌ AcuRite upsert error for ${reading.timestamp}:`, error);
                    } else {
                        savedCount++;
                    }
                } catch (insertError) {
                    console.error(`❌ Insert error for ${reading.timestamp}:`, insertError);
                }
            }
            
            console.log(`✅ AcuRite readings processed: ${allReadings.length} total, ${savedCount} saved/updated`);
        } catch (error) {
            console.error(`❌ saveAcuriteReading error:`, error);
        }
    }

    // COMPLETELY REMOVE any old function - make sure ONLY this function exists:
    extractAllAcuriteReadings(data) {
        console.log('🔍 ENTERING extractAllAcuriteReadings function');
        console.log('🔍 Data type:', typeof data);
        console.log('🔍 Data keys:', Object.keys(data || {}));
        
        const readings = [];
        
        if (data && typeof data === 'object' && !Array.isArray(data)) {
            const keys = Object.keys(data);
            
            // Check if keys are numeric (sensor IDs)
            const hasNumericKeys = keys.length > 0 && keys.every(key => !isNaN(key) && !isNaN(parseFloat(key)));
            console.log('🔍 Has numeric keys:', hasNumericKeys);
            
            if (hasNumericKeys) {
                console.log('✅ Processing numbered sensor format for time series data');
                
                // Get the first sensor to determine the number of time points
                const firstSensorData = data[keys[0]];
                console.log('🔍 First sensor data type:', typeof firstSensorData);
                console.log('🔍 First sensor is array:', Array.isArray(firstSensorData));
                
                if (Array.isArray(firstSensorData)) {
                    const timePointCount = firstSensorData.length;
                    console.log(`📊 Found ${timePointCount} time points from ${firstSensorData[0]?.happened_at} to ${firstSensorData[timePointCount-1]?.happened_at}`);
                    
                    // Process each time point (ALL readings, not just the latest)
                    for (let i = 0; i < timePointCount; i++) {
                        console.log(`🔄 Processing time point ${i + 1}/${timePointCount}`);
                        
                        const reading = {
                            timestamp: null,
                            temperature: null,
                            humidity: null,
                            wind_speed: null,
                            wind_direction: null,
                            pressure: null,
                            rainfall: null
                        };
                        
                        // Extract data from each sensor for this specific time point
                        keys.forEach(sensorId => {
                            const sensorData = data[sensorId];
                            if (Array.isArray(sensorData) && sensorData[i]) {
                                const timePoint = sensorData[i];
                                
                                // Use timestamp from this specific time point
                                if (timePoint.happened_at && !reading.timestamp) {
                                    reading.timestamp = timePoint.happened_at;
                                }
                                
                                if (timePoint.raw_values) {
                                    const values = timePoint.raw_values;
                                    
                                    // Map values based on sensor type
                                    if (values.F !== undefined && reading.temperature === null) {
                                        reading.temperature = parseFloat(values.F);
                                    }
                                    if (values.RH !== undefined) {
                                        reading.humidity = parseFloat(values.RH);
                                    }
                                    if (values.MPH !== undefined && reading.wind_speed === null) {
                                        reading.wind_speed = parseFloat(values.MPH);
                                    }
                                    if (values.HPA !== undefined) {
                                        reading.pressure = parseFloat(values.HPA);
                                    }
                                    if (values.IN !== undefined && sensorId === '10' && reading.rainfall === null) {
                                        reading.rainfall = parseFloat(values.IN);
                                    }
                                    if (values[''] !== undefined && sensorId === '4') {
                                        reading.wind_direction = parseFloat(values['']);
                                    }
                                }
                            }
                        });
                        
                        // Only add reading if we have a timestamp and at least one data point
                        if (reading.timestamp && (
                            reading.temperature !== null || 
                            reading.humidity !== null || 
                            reading.wind_speed !== null || 
                            reading.pressure !== null || 
                            reading.wind_direction !== null || 
                            reading.rainfall !== null
                        )) {
                            readings.push(reading);
                            console.log(`✅ Added reading ${i + 1}: ${reading.timestamp} - T:${reading.temperature}°F`);
                        }
                    }
                } else {
                    console.log('❌ First sensor data is not an array');
                }
            } else {
                console.log('❌ Keys are not numeric - unexpected data format');
            }
        } else {
            console.log('❌ Data is not a valid object');
        }
        
        console.log(`✨ FINAL RESULT: Extracted ${readings.length} complete AcuRite readings`);
        if (readings.length > 0) {
            console.log(`📅 Time range: ${readings[0].timestamp} to ${readings[readings.length-1].timestamp}`);
        }
        return readings;
    }

    async upsertSensor(sensorIndex) {
        const sensorFromFile = this.getSensorById(sensorIndex);
        if (!sensorFromFile) return null;

        const sensorIndexInt = parseInt(sensorIndex);

        try {
            const { data: existingSensor } = await supabase
                .from('sensors')
                .select('*')
                .eq('sensor_index', sensorIndexInt)
                .limit(1);

            if (existingSensor && existingSensor.length > 0) {
                return existingSensor[0];
            }

            const { data: newSensor, error: insertError } = await supabase
                .from('sensors')
                .insert({
                    sensor_index: sensorIndexInt,
                    name: sensorFromFile.name,
                    latitude: sensorFromFile.latitude,
                    longitude: sensorFromFile.longitude,
                    type: sensorFromFile.type,
                    device_id: sensorFromFile.device_id
                })
                .select()
                .single();

            if (insertError) {
                if (insertError.code === '23505') {
                    const { data: fallbackSensor } = await supabase
                        .from('sensors')
                        .select('*')
                        .eq('sensor_index', sensorIndexInt)
                        .single();
                    return fallbackSensor;
                }
                throw insertError;
            }

            return newSensor;
        } catch (error) {
            console.error(`Error in upsertSensor for sensor ${sensorIndex}:`, error);
            throw error;
        }
    }

    async initializeSensorsInDatabase() {
        try {
            console.log('🔄 Loading sensors from sensors.json into database...');
            const sensorsFromFile = this.getAllSensors();
            
            let addedCount = 0;
            let existingCount = 0;
            
            for (const sensor of sensorsFromFile) {
                try {
                    const { data: existingSensor } = await supabase
                        .from('sensors')
                        .select('*')
                        .eq('sensor_index', sensor.sensor_index)
                        .limit(1);

                    if (existingSensor && existingSensor.length > 0) {
                        existingCount++;
                        continue;
                    }

                    const { error } = await supabase
                        .from('sensors')
                        .insert({
                            sensor_index: sensor.sensor_index,
                            name: sensor.name,
                            latitude: sensor.latitude,
                            longitude: sensor.longitude,
                            type: sensor.type,
                            device_id: sensor.device_id || null
                        });

                    if (error) {
                        if (error.code !== '23505') {
                            console.error(`❌ Error adding sensor ${sensor.sensor_index}:`, error);
                        }
                    } else {
                        addedCount++;
                    }
                } catch (error) {
                    console.error(`❌ Error processing sensor ${sensor.sensor_index}:`, error);
                }
            }
            
            console.log(`✅ Sensor initialization complete: ${addedCount} added, ${existingCount} existing`);
        } catch (error) {
            console.error('❌ Error initializing sensors:', error);
        }
    }

    async getLatestSensorData(sensorIndex, type) {
        try {
            const sensor = await this.getSensorFromDatabase(sensorIndex);
            if (!sensor) return null;

            const tableName = type === 'purpleair' ? 'purpleair_readings' : 'acurite_readings';
            
            // Get more historical data for better visualization
            const limit = type === 'purpleair' ? 144 : 168; // 24 hours for PurpleAir, 7 days for AcuRite
            
            const { data, error } = await supabase
                .from(tableName)
                .select('*')
                .eq('sensor_id', sensor.id)
                .order('timestamp', { ascending: false })
                .limit(limit);

            if (error) throw error;
            console.log(`📊 Retrieved ${data?.length || 0} historical records for ${type} sensor ${sensorIndex}`);
            return data;
        } catch (error) {
            console.error('Error getting latest sensor data:', error);
            return null;
        }
    }

    async getSensorFromDatabase(sensorIndex) {
        try {
            const { data, error } = await supabase
                .from('sensors')
                .select('*')
                .eq('sensor_index', parseInt(sensorIndex))
                .single();

            if (error) return null;
            return data;
        } catch (error) {
            return null;
        }
    }

    async getFreshSensorData(sensorIndex, type, options = {}) {
        console.log(`🔄 getFreshSensorData called for ${type} sensor ${sensorIndex}`);
        
        let liveData = {};
        let historicalData = [];
        
        try {
            if (type === 'purpleair') {
                console.log(`💜 Processing PurpleAir sensor ${sensorIndex}`);
                liveData = await this.getPurpleAirLiveData(sensorIndex, options);
                console.log(`💜 PurpleAir live data received for sensor ${sensorIndex}`);
            } else if (type === 'acurite') {
                console.log(`🌪️ Processing AcuRite sensor ${sensorIndex}`);
                const sensor = this.getSensorById(sensorIndex);
                console.log(`🔍 Found sensor in file:`, sensor ? `${sensor.name} (device_id: ${sensor.device_id})` : 'NULL');
                
                if (!sensor || !sensor.device_id) {
                    console.log(`⚠️ AcuRite sensor device_id not found for ${sensorIndex}`);
                    liveData = {};
                } else {
                    const date = options.date || new Date().toISOString().split('T')[0];
                    console.log(`📅 Using date: ${date}`);
                    liveData = await this.getAcuriteLiveData(sensor.device_id, date);
                    console.log(`🌪️ AcuRite live data received for sensor ${sensorIndex}`);
                }
            }
        } catch (error) {
            console.log(`⚠️ Live data fetch failed for ${type} sensor ${sensorIndex}, continuing with historical data only`);
            liveData = type === 'purpleair' ? { fields: [], data: [] } : {};
        }

        try {
            historicalData = await this.getLatestSensorData(sensorIndex, type);
            console.log(`📊 Historical data count: ${historicalData?.length || 0}`);
        } catch (error) {
            console.error(`❌ Error getting historical data for ${type} sensor ${sensorIndex}:`, error);
            historicalData = [];
        }

        return {
            live: liveData,
            historical: historicalData || [],
            timestamp: new Date().toISOString(),
            sensor_index: sensorIndex
        };
    }
}

module.exports = new DataService();