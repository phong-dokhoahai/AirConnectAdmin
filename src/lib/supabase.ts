import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const missingEnv = [
  !supabaseUrl && "VITE_SUPABASE_URL",
  !supabaseAnonKey && "VITE_SUPABASE_ANON_KEY",
].filter(Boolean);

if (missingEnv.length > 0) {
  throw new Error(`Missing Supabase env: ${missingEnv.join(", ")}`);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: "pkce",
  },
});
