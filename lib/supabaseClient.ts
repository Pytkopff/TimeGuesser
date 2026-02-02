import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Lazy initialization - create client only when needed (at runtime in browser)
let supabaseClient: SupabaseClient | undefined;

export function getSupabaseClient(): SupabaseClient {
  if (supabaseClient) {
    return supabaseClient;
  }

  // In Next.js, NEXT_PUBLIC_* vars are injected at build time
  // They should be available in the browser bundle
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    const errorMsg = "Missing Supabase env vars. Check Vercel settings.";
    console.error("❌", errorMsg, {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
    });
    throw new Error(errorMsg);
  }

  // Trim whitespace
  const cleanUrl = supabaseUrl.trim();
  const cleanKey = supabaseAnonKey.trim();

  console.log("✅ Creating Supabase client...");
  supabaseClient = createClient(cleanUrl, cleanKey, {
    auth: { persistSession: false },
  });

  return supabaseClient;
}

// Export a getter that creates client on first access
export const supabase = {
  get from() {
    return getSupabaseClient().from.bind(getSupabaseClient());
  },
} as SupabaseClient;
