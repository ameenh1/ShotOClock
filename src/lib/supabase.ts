import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://dummy.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy_key';

// We use the Service Role Key so we can bypass Row Level Security 
// since all inserts come from our secure backend API.
export const supabase = createClient(supabaseUrl, supabaseKey);
