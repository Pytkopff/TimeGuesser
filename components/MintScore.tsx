"use client";

import { useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { encodeFunctionData } from "viem";
import { base } from "wagmi/chains";
import {
  Transaction,
  TransactionButton,
  TransactionStatus,
} from "@coinbase/onchainkit/transaction";
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

  const calls = useMemo(() => {
    if (!SCORE_CONTRACT_ADDRESS) return [];
    const data = encodeFunctionData({
      abi: SCORE_CONTRACT_ABI,
      functionName: "mintScore",
      args: [gameId, BigInt(score)],
    });
    return [
      {
        to: SCORE_CONTRACT_ADDRESS,
        data,
      },
    ];
  }, [gameId, score]);

  const handleSuccess = async (response: {
    transactionReceipts: { transactionHash: string }[];
  }) => {
    setMintError(null);
    const receipt = response.transactionReceipts?.[0];
    if (!receipt?.transactionHash || !address) return;

    const res = await fetch("/api/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gameId,
        score,
        txHash: receipt.transactionHash,
        wallet: address,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setMintError(data?.error ?? "Score verification failed.");
      return;
    }

    onMinted?.(receipt.transactionHash);
  };

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
        <Transaction
          chainId={base.id}
          calls={calls}
          onSuccess={handleSuccess}
          onError={(e) => setMintError(e?.message ?? "Transaction failed.")}
        >
          <div className="mt-3 flex flex-col gap-2">
            <TransactionButton text="Mint score" />
            <TransactionStatus />
          </div>
        </Transaction>
      )}

      {mintError && (
        <div className="mt-2 text-xs font-semibold text-red-600">
          {mintError}
        </div>
      )}
    </div>
  );
}
