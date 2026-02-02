import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Don't throw during build - only check at runtime
// Create a dummy client during build if env vars are missing
let supabase: ReturnType<typeof createClient>;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });
} else {
  // Create a dummy client for build-time (will fail at runtime if used without env vars)
  // This prevents build errors while still allowing runtime checks
  supabase = createClient("https://placeholder.supabase.co", "placeholder-key", {
    auth: { persistSession: false },
  });
}

export { supabase };
