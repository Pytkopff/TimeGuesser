"use client";

import { useState } from "react";
import { useAccount } from "wagmi";

type ShareButtonProps = {
  score: number;
};

export default function ShareButton({ score }: ShareButtonProps) {
  const { address } = useAccount();
  const [copied, setCopied] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const getShareUrl = () => {
    const baseUrl = typeof window !== "undefined" 
      ? window.location.origin 
      : "";
    const params = new URLSearchParams({
      score: score.toString(),
      ...(address && { player: address }),
    });
    return `${baseUrl}/api/frame/share?${params.toString()}`;
  };

  const getWarpcastUrl = () => {
    const shareUrl = getShareUrl();
    const text = `I just scored ${score} points in TimeGuesser! 🕰️\n\nCan you beat my score? Play now:`;
    return `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}&embeds[]=${encodeURIComponent(shareUrl)}`;
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleShareWarpcast = () => {
    window.open(getWarpcastUrl(), "_blank");
  };

  return (
    <div className="mt-3">
      {!showOptions ? (
        <button
          type="button"
          onClick={() => setShowOptions(true)}
          className="w-full rounded-2xl border-2 border-purple-600 bg-purple-600 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white hover:bg-purple-700 transition-colors sm:text-base"
        >
          📤 Share Score
        </button>
      ) : (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={handleShareWarpcast}
            className="w-full rounded-xl border-2 border-purple-600 bg-purple-600 py-2 text-xs font-bold uppercase tracking-[0.15em] text-white hover:bg-purple-700 transition-colors"
          >
            🟣 Share on Warpcast
          </button>
          <button
            type="button"
            onClick={handleCopyLink}
            className="w-full rounded-xl border-2 border-zinc-400 bg-white py-2 text-xs font-bold uppercase tracking-[0.15em] text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            {copied ? "✅ Link Copied!" : "📋 Copy Frame Link"}
          </button>
          <button
            type="button"
            onClick={() => setShowOptions(false)}
            className="text-[10px] text-zinc-500 hover:text-zinc-700"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
