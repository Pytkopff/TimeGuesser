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

  // Debug: log what we actually have
  console.log("🔍 Debug Supabase env vars:", {
    urlType: typeof supabaseUrl,
    urlLength: supabaseUrl?.length || 0,
    urlPreview: supabaseUrl ? supabaseUrl.substring(0, 50) + "..." : "undefined",
    keyType: typeof supabaseAnonKey,
    keyLength: supabaseAnonKey?.length || 0,
    allEnvKeys: Object.keys(process.env).filter(k => k.startsWith('NEXT_PUBLIC_')),
  });

  if (!supabaseUrl || !supabaseAnonKey) {
    const errorMsg = "Missing Supabase env vars. Check Vercel settings.";
    console.error("❌", errorMsg, {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
      urlValue: supabaseUrl || "undefined",
      keyValue: supabaseAnonKey ? "***" : "undefined",
    });
    throw new Error(errorMsg);
  }

  // Trim whitespace
  const cleanUrl = supabaseUrl.trim();
  const cleanKey = supabaseAnonKey.trim();

  // Validate URL format before creating client
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    console.error("❌ Invalid URL format:", cleanUrl);
    throw new Error(`Invalid Supabase URL format: must start with http:// or https://`);
  }

  console.log("✅ Creating Supabase client with URL:", cleanUrl.substring(0, 50) + "...");
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
