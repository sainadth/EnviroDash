-- Supabase RLS Policy Setup for EnviroDash

-- Option 1: Disable RLS for development (easier)
ALTER TABLE sensors DISABLE ROW LEVEL SECURITY;
ALTER TABLE base_readings DISABLE ROW LEVEL SECURITY;
ALTER TABLE purpleair_readings DISABLE ROW LEVEL SECURITY;
ALTER TABLE acurite_readings DISABLE ROW LEVEL SECURITY;

-- Option 2: Enable RLS with permissive policies (more secure)
-- Uncomment these if you want to use RLS with policies

-- ALTER TABLE sensors ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE base_readings ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE purpleair_readings ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE acurite_readings ENABLE ROW LEVEL SECURITY;

-- -- Create policies that allow all operations
-- CREATE POLICY "Allow all operations on sensors" ON sensors
--   FOR ALL USING (true) WITH CHECK (true);

-- CREATE POLICY "Allow all operations on base_readings" ON base_readings
--   FOR ALL USING (true) WITH CHECK (true);

-- CREATE POLICY "Allow all operations on purpleair_readings" ON purpleair_readings
--   FOR ALL USING (true) WITH CHECK (true);

-- CREATE POLICY "Allow all operations on acurite_readings" ON acurite_readings
--   FOR ALL USING (true) WITH CHECK (true);
