import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http, isAddress } from "viem";
import { base } from "viem/chains";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { SCORE_CONTRACT_ADDRESS } from "@/lib/scoreContract";

const rpcUrl = process.env.BASE_RPC_URL ?? "https://mainnet.base.org";

const publicClient = createPublicClient({
  chain: base,
  transport: http(rpcUrl),
});

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Supabase admin not configured. Missing env vars." },
        { status: 500 }
      );
    }

    // TypeScript type narrowing - after the check above, supabaseAdmin is guaranteed to be non-null
    // Use type assertion since Supabase types are not fully generated
    const admin = supabaseAdmin as ReturnType<typeof import("@supabase/supabase-js").createClient>;

    const body = await request.json();
    const { gameId, score, txHash, wallet } = body ?? {};

    if (!gameId || !txHash || typeof score !== "number" || !wallet) {
      return NextResponse.json(
        { error: "Missing gameId, score, txHash, or wallet." },
        { status: 400 }
      );
    }

    if (!isAddress(wallet)) {
      return NextResponse.json({ error: "Invalid wallet address." }, { status: 400 });
    }

    if (!SCORE_CONTRACT_ADDRESS) {
      return NextResponse.json(
        { error: "Missing SCORE_CONTRACT_ADDRESS on server." },
        { status: 500 }
      );
    }

    const receipt = await publicClient.getTransactionReceipt({ hash: txHash });
    if (!receipt || receipt.status !== "success") {
      return NextResponse.json({ error: "Transaction not successful." }, { status: 400 });
    }

    if (receipt.to?.toLowerCase() !== SCORE_CONTRACT_ADDRESS.toLowerCase()) {
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
    await (admin.from("users") as any).upsert(
      {
        canonical_user_id: wallet.toLowerCase(),
        wallet: wallet.toLowerCase(),
      },
      { onConflict: "canonical_user_id" }
    );

    const { error: gameError } = await (admin.from("games") as any).insert({
      id: gameId,
      canonical_user_id: wallet.toLowerCase(),
      ended_at: new Date().toISOString(),
      total_score: score,
    });

    if (gameError) {
      return NextResponse.json({ error: gameError.message }, { status: 500 });
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
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
