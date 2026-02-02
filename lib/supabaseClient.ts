import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Lazy initialization - only create client when actually needed (at runtime)
// This prevents any Supabase client creation during build phase
let supabaseClient: SupabaseClient | undefined;

function getSupabaseClient(): SupabaseClient {
  if (supabaseClient) {
    return supabaseClient;
  }

  // In Next.js, NEXT_PUBLIC_* vars are available at build time and injected into the bundle
  // But we need to check if they're actually available in the browser
  const supabaseUrl = 
    typeof window !== "undefined" 
      ? (window as any).__NEXT_DATA__?.env?.NEXT_PUBLIC_SUPABASE_URL || 
        process.env.NEXT_PUBLIC_SUPABASE_URL
      : process.env.NEXT_PUBLIC_SUPABASE_URL;
      
  const supabaseAnonKey = 
    typeof window !== "undefined"
      ? (window as any).__NEXT_DATA__?.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("❌ Supabase env vars missing:", {
      url: supabaseUrl ? "✅" : "❌",
      key: supabaseAnonKey ? "✅" : "❌",
    });
    throw new Error(
      "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY on Vercel."
    );
  }

  // Let Supabase client validate the URL - don't validate here
  console.log("✅ Creating Supabase client with URL:", supabaseUrl.substring(0, 40) + "...");

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });

  return supabaseClient;
}

// Export a proxy that lazily creates the client only when accessed
// This ensures no client is created during build phase
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    try {
      const client = getSupabaseClient();
      const value = client[prop as keyof SupabaseClient];
      return typeof value === "function" ? value.bind(client) : value;
    } catch (error) {
      // If client creation fails (e.g., missing env vars), return a mock object
      // that will throw a helpful error when methods are called
      if (prop === "from") {
        return () => ({
          select: () => ({
            then: (onResolve: any, onReject: any) => {
              onReject?.(error);
              return Promise.reject(error);
            },
            catch: (onReject: any) => {
              onReject?.(error);
              return Promise.reject(error);
            },
          }),
        });
      }
      throw error;
    }
  },
});
