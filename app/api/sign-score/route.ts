import { NextRequest, NextResponse } from "next/server";
import { keccak256, encodePacked, hashMessage, toBytes, toHex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sign } from "viem/accounts";

// Get validator private key from environment
const VALIDATOR_PRIVATE_KEY = process.env.VALIDATOR_PRIVATE_KEY;

if (!VALIDATOR_PRIVATE_KEY) {
  console.warn(
    "⚠️ VALIDATOR_PRIVATE_KEY not set. Score signing will fail."
  );
}

// Helper function to safely serialize JSON (handles BigInt)
function safeJsonResponse(data: any, status: number = 200): NextResponse {
  const jsonString = JSON.stringify(data, (key, value) => {
    if (typeof value === 'bigint') {
      return value.toString();
    }
    // Handle nested objects that might contain BigInt
    if (value && typeof value === 'object') {
      const cleaned: any = {};
      for (const k in value) {
        const v = value[k];
        cleaned[k] = typeof v === 'bigint' ? v.toString() : v;
      }
      return cleaned;
    }
    return value;
  });
  
  return new NextResponse(jsonString, {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(request: NextRequest) {
  try {
    if (!VALIDATOR_PRIVATE_KEY) {
      console.error("❌ VALIDATOR_PRIVATE_KEY is missing");
      return safeJsonResponse(
        { error: "Validator not configured. Missing VALIDATOR_PRIVATE_KEY." },
        500
      );
    }

    // Validate private key format
    if (!VALIDATOR_PRIVATE_KEY.startsWith("0x") || VALIDATOR_PRIVATE_KEY.length !== 66) {
      console.error("❌ Invalid VALIDATOR_PRIVATE_KEY format:", VALIDATOR_PRIVATE_KEY.substring(0, 10) + "...");
      return safeJsonResponse(
        { error: "Invalid VALIDATOR_PRIVATE_KEY format. Must be 0x-prefixed hex string (66 chars)." },
        500
      );
    }

    const body = await request.json();
    const { gameId, score, player } = body ?? {};

    // Safe logging - ensure all values are serializable
    console.log("📝 Sign request:", {
      gameId: String(gameId || ""),
      score: Number(score) || 0,
      player: String(player || ""),
      scoreType: typeof score,
    });

    if (!gameId || typeof gameId !== "string") {
      return safeJsonResponse(
        { error: "Missing or invalid gameId (must be string)." },
        400
      );
    }

    if (typeof score !== "number" || isNaN(score) || score < 0 || score > 5000) {
      return safeJsonResponse(
        { error: `Invalid score: ${score}. Must be a number between 0 and 5000.` },
        400
      );
    }

    if (!player || typeof player !== "string" || !player.match(/^0x[a-fA-F0-9]{40}$/)) {
      return safeJsonResponse(
        { error: `Invalid player address: ${player}. Must be valid Ethereum address.` },
        400
      );
    }

    // Create validator account from private key
    let validatorAddress: string;
    try {
      const account = privateKeyToAccount(VALIDATOR_PRIVATE_KEY as `0x${string}`);
      // Immediately convert to string to avoid BigInt serialization issues
      validatorAddress = String(account.address);
      console.log("✅ Validator account created:", validatorAddress);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      console.error("❌ Failed to create account from private key:", errorMsg);
      return safeJsonResponse(
        { error: `Failed to create validator account: ${errorMsg}` },
        500
      );
    }

    // Step 1: Create message hash exactly as contract does
    // Contract: keccak256(abi.encodePacked(gameId, score, msg.sender))
    // IMPORTANT: Order must match contract exactly: gameId, score, player
    let messageHash: string;
    try {
      const normalizedPlayer = player.toLowerCase() as `0x${string}`;
      const hash = keccak256(
        encodePacked(
          ["string", "uint256", "address"],
          [gameId, BigInt(Math.floor(score)), normalizedPlayer] // Order: gameId, score, player (matches contract)
        )
      );
      // Ensure hash is a string
      messageHash = String(hash);
      console.log("✅ Message hash created:", messageHash);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      console.error("❌ Failed to create message hash:", errorMsg);
      return safeJsonResponse(
        { error: `Failed to create message hash: ${errorMsg}` },
        500
      );
    }

    // Step 2: Add Ethereum message prefix (same as MessageHashUtils.toEthSignedMessageHash)
    // This adds "\x19Ethereum Signed Message:\n32" prefix
    let ethSignedMessageHash: string;
    try {
      const hash = hashMessage({ raw: toBytes(messageHash as `0x${string}`) });
      // Ensure hash is a string
      ethSignedMessageHash = String(hash);
      console.log("✅ Ethereum signed message hash created");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      console.error("❌ Failed to create eth signed message hash:", errorMsg);
      return safeJsonResponse(
        { error: `Failed to create eth signed message hash: ${errorMsg}` },
        500
      );
    }

    // Step 3: Sign the hash with private key
    let signatureStr: string;
    try {
      const signatureResult = await sign({
        hash: ethSignedMessageHash as `0x${string}`,
        privateKey: VALIDATOR_PRIVATE_KEY as `0x${string}`,
      });
      
      // sign() from viem returns an object with r, s, v (or yParity) fields
      // We need to construct the signature string from these components
      if (typeof signatureResult === 'string') {
        // It's already a string - use it directly (shouldn't happen in viem 2.45.1, but safety check)
        signatureStr = signatureResult;
      } else if (signatureResult && typeof signatureResult === 'object') {
        // Extract r, s, v from the signature object
        const sig = signatureResult as any;
        
        // Check if it has r, s, v fields
        if (sig.r && sig.s && (sig.v !== undefined || sig.yParity !== undefined)) {
          // Convert r, s to hex strings (remove 0x prefix, pad to 64 chars)
          const r = typeof sig.r === 'bigint' 
            ? sig.r.toString(16).padStart(64, '0')
            : typeof sig.r === 'string'
              ? sig.r.replace('0x', '').padStart(64, '0')
              : String(sig.r).replace('0x', '').padStart(64, '0');
          
          const s = typeof sig.s === 'bigint'
            ? sig.s.toString(16).padStart(64, '0')
            : typeof sig.s === 'string'
              ? sig.s.replace('0x', '').padStart(64, '0')
              : String(sig.s).replace('0x', '').padStart(64, '0');
          
          // v is either 0/1 (yParity) or 27/28 (legacy)
          // For ECDSA.recover in Solidity, we need v as 27 or 28
          let v: string;
          if (sig.v !== undefined) {
            // v is already set (27 or 28)
            v = typeof sig.v === 'bigint' 
              ? sig.v.toString(16)
              : String(sig.v);
          } else if (sig.yParity !== undefined) {
            // yParity is 0 or 1, convert to v (27 or 28)
            const yParity = typeof sig.yParity === 'bigint' 
              ? Number(sig.yParity)
              : Number(sig.yParity);
            v = (27 + yParity).toString(16);
          } else {
            throw new Error('Signature object missing both v and yParity');
          }
          
          // Construct signature: 0x + r (64 chars) + s (64 chars) + v (2 chars)
          signatureStr = `0x${r}${s}${v.padStart(2, '0')}`;
        } else {
          // Log the actual structure for debugging
          console.error("❌ Unexpected signature structure:", {
            keys: Object.keys(sig),
            r: sig.r,
            s: sig.s,
            v: sig.v,
            yParity: sig.yParity,
          });
          throw new Error(`Unexpected signature format: missing r, s, or v. Keys: ${Object.keys(sig).join(', ')}`);
        }
      } else {
        throw new Error(`Unexpected signature format: ${typeof signatureResult}`);
      }
      
      // Final safety check: ensure it's a valid hex string (130 chars: 0x + 64 + 64 + 2)
      if (!signatureStr || !signatureStr.startsWith('0x') || signatureStr.length !== 132) {
        throw new Error(`Invalid signature format: length=${signatureStr?.length}, expected 132. Value: ${signatureStr?.substring(0, 20)}...`);
      }
      
      console.log("✅ Signature created:", signatureStr.substring(0, 20) + "...");
      
      // Return only plain strings - no BigInt, no complex objects
      return safeJsonResponse({
        signature: signatureStr,
        validatorAddress: validatorAddress,
      }, 200);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      console.error("❌ Failed to sign:", errorMsg);
      return safeJsonResponse(
        { error: `Failed to sign message: ${errorMsg}` },
        500
      );
    }
  } catch (err) {
    // Safely extract error message without serializing BigInt
    const errorMessage = err instanceof Error 
      ? err.message 
      : typeof err === 'string' 
        ? err 
        : "Failed to generate signature";
    
    console.error("❌ Unexpected error in sign-score:", errorMessage);
    
    return safeJsonResponse(
      { error: errorMessage },
      500
    );
  }
}
