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
  const rawUrlPreview = supabaseUrl ? JSON.stringify(supabaseUrl.substring(0, 50)) : "undefined";
  console.log("🔍 Debug Supabase env vars:", {
    urlType: typeof supabaseUrl,
    urlLength: supabaseUrl?.length || 0,
    urlPreview: rawUrlPreview,
    keyType: typeof supabaseAnonKey,
    keyLength: supabaseAnonKey?.length || 0,
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

  // Trim whitespace and remove surrounding quotes (in case env vars have quotes)
  const cleanUrl = supabaseUrl.trim().replace(/^["']|["']$/g, '');
  const cleanKey = supabaseAnonKey.trim().replace(/^["']|["']$/g, '');

  console.log("🧹 After cleaning:", {
    cleanUrlPreview: cleanUrl.substring(0, 50),
    cleanUrlStartsWith: cleanUrl.substring(0, 8),
  });

  // Validate URL format before creating client
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    console.error("❌ Invalid URL format:", JSON.stringify(cleanUrl));
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
