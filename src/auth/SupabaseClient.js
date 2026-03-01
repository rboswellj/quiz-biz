import { createClient } from "@supabase/supabase-js";

// Loaded from Vite env vars at build/runtime.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Shared Supabase client used across auth + data modules.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
