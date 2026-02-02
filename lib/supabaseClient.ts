import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Only create client if env vars are available
// During build on Vercel, if vars are not set, this will be undefined
// which is OK - the client will be created at runtime when vars are available
let supabase: SupabaseClient | undefined;

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    });
  } catch (error) {
    // Silently fail during build - will work at runtime
    console.warn("Failed to create Supabase client during build:", error);
  }
}

// Export - will be undefined during build if env vars are missing, but that's OK
// Client components will handle this gracefully
export { supabase };
