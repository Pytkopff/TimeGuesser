"use client";

import { useEffect, useState, useCallback } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId, useSwitchChain } from "wagmi";
import { base } from "wagmi/chains";
import { ConnectWallet } from "@coinbase/onchainkit/wallet";
import { SCORE_CONTRACT_ABI, SCORE_CONTRACT_ADDRESS } from "@/lib/scoreContract";

type MintScoreProps = {
  gameId: string;
  score: number;
  onMinted?: (txHash: string) => void;
};

export default function MintScore({ gameId, score, onMinted }: MintScoreProps) {
  const { address, chainId: accountChainId } = useAccount();
  const [mintError, setMintError] = useState<string | null>(null);
  const [isLoadingSignature, setIsLoadingSignature] = useState(false);
  const [signature, setSignature] = useState<`0x${string}` | null>(null);
  const [isSwitchingChain, setIsSwitchingChain] = useState(false);
  const [pendingMint, setPendingMint] = useState(false); // Flag to track if we're waiting to mint after chain switch
  
  // Check current chain - use both useChainId and account chainId for reliability
  const chainIdFromHook = useChainId();
  const chainId = accountChainId || chainIdFromHook; // Prefer account chainId as it's more reliable
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  
  // Debug: log chain changes
  useEffect(() => {
    console.log("🔗 Chain ID changed:", {
      accountChainId,
      chainIdFromHook,
      finalChainId: chainId,
      baseId: base.id,
      isOnBase: chainId === base.id,
    });
  }, [accountChainId, chainIdFromHook, chainId]);
  
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

  // Actually execute the mint transaction
  const executeMint = useCallback(() => {
    if (!SCORE_CONTRACT_ADDRESS || !signature || !address) {
      console.error("❌ Cannot execute mint: missing requirements");
      setPendingMint(false);
      return;
    }

    // Double-check that we're on Base before executing
    if (chainId !== base.id) {
      console.error("❌ Cannot execute mint: still not on Base network", {
        currentChainId: chainId,
        expectedChainId: base.id,
      });
      setPendingMint(false);
      setMintError("Please switch to Base network in your wallet");
      return;
    }

    try {
      console.log("🚀 Calling writeContract:", {
        address: SCORE_CONTRACT_ADDRESS,
        gameId,
        score,
        signatureLength: signature.length,
        signature: signature.substring(0, 20) + "...",
        currentChainId: chainId,
      });

      // Don't pass chainId - let wagmi use the current chain from the wallet
      writeContract({
        address: SCORE_CONTRACT_ADDRESS,
        abi: SCORE_CONTRACT_ABI,
        functionName: "mintScore",
        args: [gameId, BigInt(score), signature],
      });
    } catch (err) {
      console.error("❌ Failed to write contract:", err);
      setMintError(err instanceof Error ? err.message : "Failed to initiate transaction");
      setPendingMint(false);
    }
  }, [SCORE_CONTRACT_ADDRESS, signature, address, gameId, score, writeContract, chainId]);

  // Handle mint button click - check chain and switch if needed
  const handleMint = async () => {
    console.log("🔵 handleMint called", {
      hasAddress: !!SCORE_CONTRACT_ADDRESS,
      hasSignature: !!signature,
      hasWallet: !!address,
      currentChainId: chainId,
      targetChainId: base.id,
    });

    if (!SCORE_CONTRACT_ADDRESS || !signature || !address) {
      const missing = [];
      if (!SCORE_CONTRACT_ADDRESS) missing.push("contract address");
      if (!signature) missing.push("signature");
      if (!address) missing.push("wallet address");
      setMintError(`Missing: ${missing.join(", ")}`);
      return;
    }

    // If already on Base, execute mint immediately
    if (chainId === base.id) {
      executeMint();
      return;
    }

    // Otherwise, switch chain first and set pending flag
    console.log("🔄 Switching to Base network...", {
      currentChainId: chainId,
      targetChainId: base.id,
    });
    setIsSwitchingChain(true);
    setPendingMint(true);
    setMintError(null);
    
    try {
      const result = await switchChain({ chainId: base.id });
      console.log("✅ switchChain called, waiting for chain to change...", result);
      // Don't execute mint here - wait for chainId to change in useEffect
    } catch (err: any) {
      console.error("❌ Failed to switch chain:", err);
      setIsSwitchingChain(false);
      setPendingMint(false);
      
      // More specific error message
      if (err?.message?.includes("user rejected") || err?.code === 4001) {
        setMintError("Chain switch was rejected. Please switch to Base network manually in your wallet.");
      } else if (err?.message?.includes("not added")) {
        setMintError("Base network is not added to your wallet. Please add Base network manually.");
      } else {
        setMintError("Please switch to Base network in your wallet manually.");
      }
    }
  };

  // Auto-execute mint when chain switches to Base and we have pending mint
  useEffect(() => {
    console.log("🔍 Checking if should execute mint:", {
      pendingMint,
      chainId,
      isBase: chainId === base.id,
      isSwitching,
      hasAddress: !!SCORE_CONTRACT_ADDRESS,
      hasSignature: !!signature,
      hasWallet: !!address,
    });

    if (pendingMint && chainId === base.id && !isSwitching && SCORE_CONTRACT_ADDRESS && signature && address) {
      console.log("✅ Chain switched to Base, executing mint...", {
        chainId,
        accountChainId,
        chainIdFromHook,
        isSwitching,
        hasAddress: !!SCORE_CONTRACT_ADDRESS,
        hasSignature: !!signature,
        hasWallet: !!address,
      });
      setIsSwitchingChain(false);
      // Longer delay to ensure chain switch is fully processed by wallet
      setTimeout(() => {
        // Double-check chainId one more time before executing
        const currentChainId = accountChainId || chainIdFromHook;
        if (currentChainId === base.id) {
          console.log("✅ Final check passed, executing mint...");
          executeMint();
          setPendingMint(false);
        } else {
          console.error("❌ Chain check failed before mint:", {
            currentChainId,
            expected: base.id,
          });
          setMintError("Please switch to Base network in your wallet");
          setPendingMint(false);
        }
      }, 1000); // Increased delay to 1 second
    }
  }, [chainId, accountChainId, chainIdFromHook, pendingMint, isSwitching, SCORE_CONTRACT_ADDRESS, signature, address, executeMint]);

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
      console.error("❌ Error details:", {
        name: writeError.name,
        message: writeError.message,
        cause: writeError.cause,
        stack: writeError.stack,
      });
      setMintError(writeError.message ?? "Transaction failed");
    }
  }, [writeError]);

  // Debug: log when writeContract state changes
  useEffect(() => {
    console.log("📊 writeContract state:", {
      hash,
      isWriting,
      writeError: writeError?.message,
    });
  }, [hash, isWriting, writeError]);

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
                disabled={isWriting || isConfirming || isSwitchingChain || pendingMint || !signature || hash}
                className="mt-3 w-full rounded-2xl border-2 border-zinc-900 bg-zinc-900 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {hash
                  ? "Transaction submitted..."
                  : isSwitchingChain
                  ? "Switching to Base..."
                  : isWriting || isConfirming
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
