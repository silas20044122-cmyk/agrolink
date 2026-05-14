import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Use placeholders to prevent the createClient from throwing an error during module load if keys are missing.
// This allows the app to start and show a warning or handles missing config in the UI.
const dummyUrl = 'https://your-project.supabase.co';
const dummyKey = 'your-anon-key';

export const supabase = createClient(
  supabaseUrl || dummyUrl, 
  supabaseAnonKey || dummyKey
);

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
