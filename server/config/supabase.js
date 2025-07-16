const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl) {
    console.error('❌ VITE_SUPABASE_URL is missing from environment variables');
    console.error('Add this to your .env file: VITE_SUPABASE_URL=https://your-project.supabase.co');
    process.exit(1);
}

if (!supabaseKey) {
    console.error('❌ VITE_SUPABASE_ANON_KEY is missing from environment variables');
    console.error('Add this to your .env file: VITE_SUPABASE_ANON_KEY=your-anon-key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
