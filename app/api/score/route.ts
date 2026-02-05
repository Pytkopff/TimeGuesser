import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http, isAddress } from "viem";
import { base } from "viem/chains";
import { createClient } from "@supabase/supabase-js";

// Force dynamic rendering - don't try to pre-render this route
export const dynamic = "force-dynamic";

// Lazy-create public client to avoid build-time errors
function getPublicClient() {
  const rpcUrl = process.env.BASE_RPC_URL ?? "https://mainnet.base.org";
  return createPublicClient({
    chain: base,
    transport: http(rpcUrl),
  });
}

// Lazy-create Supabase admin client
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

function getContractAddress() {
  return process.env.NEXT_PUBLIC_SCORE_CONTRACT_ADDRESS as `0x${string}` | undefined;
}

export async function POST(request: NextRequest) {
  console.log("📥 /api/score called");
  
  try {
    // Log env vars (without exposing secrets)
    console.log("🔍 Checking env vars:", {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseUrlStart: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20),
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasContractAddress: !!process.env.NEXT_PUBLIC_SCORE_CONTRACT_ADDRESS,
    });
    
    const admin = getSupabaseAdmin();
    const publicClient = getPublicClient();
    
    if (!admin) {
      console.error("❌ Supabase admin is null");
      return NextResponse.json(
        { error: "Supabase admin not configured. Missing env vars." },
        { status: 500 }
      );
    }
    
    console.log("✅ Supabase admin created");

    const body = await request.json();
    const { gameId, score, txHash, wallet, rounds, farcaster } = body ?? {};

    if (!gameId || !txHash || typeof score !== "number" || !wallet) {
      return NextResponse.json(
        { error: "Missing gameId, score, txHash, or wallet." },
        { status: 400 }
      );
    }

    // Validate rounds data if provided
    const validRounds = Array.isArray(rounds) ? rounds : [];
    
    // Extract Farcaster data if provided
    const farcasterData = farcaster ? {
      fid: farcaster.fid,
      username: farcaster.username,
      displayName: farcaster.displayName,
      pfpUrl: farcaster.pfpUrl,
    } : null;

    if (!isAddress(wallet)) {
      return NextResponse.json({ error: "Invalid wallet address." }, { status: 400 });
    }

    const contractAddress = getContractAddress();
    if (!contractAddress) {
      return NextResponse.json(
        { error: "Missing SCORE_CONTRACT_ADDRESS on server." },
        { status: 500 }
      );
    }

    const receipt = await publicClient.getTransactionReceipt({ hash: txHash });
    if (!receipt || receipt.status !== "success") {
      return NextResponse.json({ error: "Transaction not successful." }, { status: 400 });
    }

    if (receipt.to?.toLowerCase() !== contractAddress.toLowerCase()) {
      return NextResponse.json(
        { error: "Transaction target mismatch." },
        { status: 400 }
      );
    }

    if (receipt.from?.toLowerCase() !== wallet.toLowerCase()) {
      return NextResponse.json(
        { error: "Wallet does not match transaction sender." },
        { status: 400 }
      );
    }

    // TypeScript doesn't know about our Supabase table types, so we use 'as any'
    // Include Farcaster profile data if available
    const userData: any = {
      canonical_user_id: wallet.toLowerCase(),
      wallet: wallet.toLowerCase(),
    };
    
    if (farcasterData) {
      userData.farcaster_fid = farcasterData.fid;
      userData.display_name = farcasterData.displayName || farcasterData.username;
      userData.avatar_url = farcasterData.pfpUrl;
    }
    
    await (admin.from("users") as any).upsert(userData, { onConflict: "canonical_user_id" });

    const { error: gameError } = await (admin.from("games") as any).insert({
      id: gameId,
      canonical_user_id: wallet.toLowerCase(),
      ended_at: new Date().toISOString(),
      total_score: score,
    });

    if (gameError) {
      return NextResponse.json({ error: gameError.message }, { status: 500 });
    }

    // Insert round data for leaderboard
    if (validRounds.length > 0) {
      const roundInserts = validRounds.map((r: any, index: number) => ({
        game_id: gameId,
        photo_id: r.photoId || null,
        round_index: index + 1,
        year_guess: r.yearGuess,
        year_true: r.yearTrue,
        delta_years: r.delta,
        score: r.score,
        answered_at: new Date().toISOString(),
      }));

      const { error: roundsError } = await (admin.from("rounds") as any).insert(roundInserts);
      if (roundsError) {
        console.error("Failed to insert rounds:", roundsError);
        // Don't fail the whole request, just log the error
      }
    }

    const { error: mintError } = await (admin.from("mints") as any).insert({
      game_id: gameId,
      tx_hash: txHash,
      chain_id: base.id,
      status: "success",
    });

    if (mintError) {
      return NextResponse.json({ error: mintError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("❌ /api/score error:", err instanceof Error ? err.message : err);
    console.error("❌ Full error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
