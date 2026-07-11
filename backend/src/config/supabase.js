// backend/src/config/supabase.js
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(
  supabaseUrl || 'http://localhost:54321', 
  supabaseServiceKey || 'mock-key'
);

// 🌟 FIX: Change module.exports to export default!
export default supabase;
console.log('✅ Supabase client initialized');
console.log('URL loaded:', !!process.env.SUPABASE_URL);