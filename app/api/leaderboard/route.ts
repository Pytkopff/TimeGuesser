import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Force dynamic rendering - don't try to pre-render this route
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: "Supabase not configured" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "top_score";
    const limit = Math.min(Number(searchParams.get("limit")) || 10, 50);

    let data;
    let error;

    if (type === "best_accuracy") {
      // Best accuracy = lowest average delta
      const result = await supabase
        .from("leaderboard_best_accuracy")
        .select("canonical_user_id, display_name, avatar_url, avg_delta, score")
        .order("avg_delta", { ascending: true })
        .limit(limit);
      
      data = result.data;
      error = result.error;
    } else {
      // Top score = highest total score
      const result = await supabase
        .from("leaderboard_top_score")
        .select("canonical_user_id, display_name, avatar_url, score")
        .order("score", { ascending: false })
        .limit(limit);
      
      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error("Leaderboard error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ leaderboard: data || [] });
  } catch (err) {
    console.error("Leaderboard error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
