"use client";

import { useEffect, useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ConnectWallet } from "@coinbase/onchainkit/wallet";
import { SCORE_CONTRACT_ABI, SCORE_CONTRACT_ADDRESS } from "@/lib/scoreContract";

type MintScoreProps = {
  gameId: string;
  score: number;
  onMinted?: (txHash: string) => void;
};

export default function MintScore({ gameId, score, onMinted }: MintScoreProps) {
  const { address } = useAccount();
  const [mintError, setMintError] = useState<string | null>(null);
  const [isLoadingSignature, setIsLoadingSignature] = useState(false);
  const [signature, setSignature] = useState<`0x${string}` | null>(null);
  
  // Use wagmi's useWriteContract for direct contract interaction
  const { 
    writeContract, 
    data: hash, 
    isPending: isWriting,
    error: writeError 
  } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Fetch signature from backend before minting
  const fetchSignature = async () => {
    if (!address) return null;
    setIsLoadingSignature(true);
    try {
      const payload = {
        gameId: String(gameId),
        // Ensure we never send a BigInt in the JSON body
        score: Number(score),
        player: address.toLowerCase(),
      };

      const res = await fetch("/api/sign-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          (data as any)?.error ?? "Failed to get signature"
        );
      }

      const sig = (data as any)?.signature as `0x${string}` | undefined;
      if (!sig) {
        console.error("❌ No signature in response:", data);
        throw new Error("No signature returned from server");
      }

      console.log("✅ Signature received:", sig.substring(0, 20) + "...");
      return sig;
    } catch (err) {
      setMintError(
        err instanceof Error ? err.message : "Failed to get signature"
      );
      return null;
    } finally {
      setIsLoadingSignature(false);
    }
  };

  // Handle successful transaction
  const handleMint = async () => {
    if (!SCORE_CONTRACT_ADDRESS || !signature || !address) {
      setMintError("Missing contract address, signature, or wallet address");
      return;
    }

    try {
      console.log("🚀 Calling mintScore:", {
        address: SCORE_CONTRACT_ADDRESS,
        gameId,
        score,
        signatureLength: signature.length,
      });

      writeContract({
        address: SCORE_CONTRACT_ADDRESS,
        abi: SCORE_CONTRACT_ABI,
        functionName: "mintScore",
        args: [gameId, BigInt(score), signature],
      });
    } catch (err) {
      console.error("❌ Failed to write contract:", err);
      setMintError(err instanceof Error ? err.message : "Failed to initiate transaction");
    }
  };

  // Handle transaction success
  useEffect(() => {
    if (isConfirmed && hash && address) {
      console.log("✅ Transaction confirmed:", hash);
      
      // Call backend to verify and save score
      fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId,
          score,
          txHash: hash,
          wallet: address,
        }),
      })
        .then((res) => {
          if (!res.ok) {
            return res.json().then((data) => {
              throw new Error(data?.error ?? "Score verification failed.");
            });
          }
          onMinted?.(hash);
        })
        .catch((err) => {
          console.error("❌ Failed to verify score:", err);
          setMintError(err.message);
        });
    }
  }, [isConfirmed, hash, address, gameId, score, onMinted]);

  // Handle write errors
  useEffect(() => {
    if (writeError) {
      console.error("❌ Write contract error:", writeError);
      setMintError(writeError.message ?? "Transaction failed");
    }
  }, [writeError]);

  if (!SCORE_CONTRACT_ADDRESS) {
    return (
      <div className="text-xs text-zinc-500">
        Missing `NEXT_PUBLIC_SCORE_CONTRACT_ADDRESS`.
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-2xl border-2 border-zinc-900 bg-zinc-50 px-4 py-4 text-center">
      <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-zinc-500">
        Onchain proof
      </div>
      <div className="mt-2 text-xs text-zinc-600">
        Mint your score to appear on the leaderboard.
      </div>

      {!address && (
        <div className="mt-3 flex justify-center">
          <ConnectWallet text="Connect wallet" />
        </div>
      )}

      {address && (
        <>
          {!signature && (
            <button
              type="button"
              onClick={async () => {
                const sig = await fetchSignature();
                if (sig) setSignature(sig);
              }}
              disabled={isLoadingSignature}
              className="mt-3 w-full rounded-2xl border-2 border-zinc-900 bg-zinc-900 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingSignature ? "Preparing..." : "Prepare mint"}
            </button>
          )}

          {signature && (
            <>
              <button
                type="button"
                onClick={handleMint}
                disabled={isWriting || isConfirming || !signature}
                className="mt-3 w-full rounded-2xl border-2 border-zinc-900 bg-zinc-900 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isWriting || isConfirming
                  ? isWriting
                    ? "Confirming in wallet..."
                    : "Waiting for confirmation..."
                  : "Mint score"}
              </button>
              
              {isConfirmed && hash && (
                <div className="mt-2 text-xs font-semibold text-emerald-700">
                  ✅ Transaction confirmed! Score saved.
                </div>
              )}
            </>
          )}
        </>
      )}

      {mintError && (
        <div className="mt-2 text-xs font-semibold text-red-600">
          {mintError}
        </div>
      )}
    </div>
  );
}
