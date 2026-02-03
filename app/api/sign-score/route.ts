import { NextRequest, NextResponse } from "next/server";
import { keccak256, encodePacked, hashMessage, toBytes } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sign } from "viem/accounts";

// Get validator private key from environment
const VALIDATOR_PRIVATE_KEY = process.env.VALIDATOR_PRIVATE_KEY;

if (!VALIDATOR_PRIVATE_KEY) {
  console.warn(
    "⚠️ VALIDATOR_PRIVATE_KEY not set. Score signing will fail."
  );
}

export async function POST(request: NextRequest) {
  try {
    if (!VALIDATOR_PRIVATE_KEY) {
      return NextResponse.json(
        { error: "Validator not configured. Missing VALIDATOR_PRIVATE_KEY." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { gameId, score, player } = body ?? {};

    if (!gameId || typeof score !== "number" || !player) {
      return NextResponse.json(
        { error: "Missing gameId, score, or player." },
        { status: 400 }
      );
    }

    // Create validator account from private key
    const account = privateKeyToAccount(VALIDATOR_PRIVATE_KEY as `0x${string}`);

    // Step 1: Create message hash exactly as contract does
    // Contract: keccak256(abi.encodePacked(gameId, score, msg.sender))
    const messageHash = keccak256(
      encodePacked(
        ["string", "uint256", "address"],
        [gameId, BigInt(score), player.toLowerCase() as `0x${string}`]
      )
    );

    // Step 2: Add Ethereum message prefix (same as MessageHashUtils.toEthSignedMessageHash)
    // This adds "\x19Ethereum Signed Message:\n32" prefix
    const ethSignedMessageHash = hashMessage({ raw: toBytes(messageHash) });

    // Step 3: Sign the hash with private key
    const signature = await sign({
      hash: ethSignedMessageHash,
      privateKey: VALIDATOR_PRIVATE_KEY as `0x${string}`,
    });

    return NextResponse.json({
      signature,
      validatorAddress: account.address,
    });
  } catch (err) {
    console.error("Error signing score:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to generate signature",
      },
      { status: 500 }
    );
  }
}
