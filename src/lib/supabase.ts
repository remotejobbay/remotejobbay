// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

// Replace with your actual Supabase project URL and anon key
const supabaseUrl = 'https://ozwpvhnivymheuhgleqx.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96d3B2aG5pdnltaGV1aGdsZXF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3MjQ5ODgsImV4cCI6MjA2NjMwMDk4OH0.t-hUeveenPH6isaOXeo67vHvDoaAkUUv17UOEkupqvs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

