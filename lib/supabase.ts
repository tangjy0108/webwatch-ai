import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SECRET_KEY?.trim()
  || process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  || "";

// Server-side client using a Supabase elevated server key.
export function getServerClient() {
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

// Check if DB is configured
export function isDbConfigured() {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && serviceKey);
}
