"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import sdk from "@farcaster/frame-sdk";
import { useFarcaster } from "@/lib/farcaster";

type ShareButtonProps = {
  score: number;
};

export default function ShareButton({ score }: ShareButtonProps) {
  const { address } = useAccount();
  const { isInFrame } = useFarcaster();
  const [sharing, setSharing] = useState(false);

  const getShareUrl = () => {
    const baseUrl = typeof window !== "undefined" 
      ? window.location.origin 
      : "https://time-guesser-three.vercel.app";
    const params = new URLSearchParams({
      score: score.toString(),
      ...(address && { player: address }),
    });
    return `${baseUrl}/api/frame/share?${params.toString()}`;
  };

  const handleShare = async () => {
    setSharing(true);
    try {
      const shareUrl = getShareUrl();
      const text = `I just scored ${score} points in TimeGuesser! 🕰️\n\nCan you beat my score? Play now:`;

      if (isInFrame) {
        // Use Farcaster SDK to open compose within the app
        await sdk.actions.composeCast({
          text,
          embeds: [shareUrl],
        });
      } else {
        // Fallback: open Warpcast compose in new tab
        const warpcastUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}&embeds[]=${encodeURIComponent(shareUrl)}`;
        window.open(warpcastUrl, "_blank");
      }
    } catch (err) {
      console.error("Share error:", err);
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(getShareUrl());
        alert("Link copied to clipboard!");
      } catch {
        console.error("Clipboard failed too");
      }
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={handleShare}
        disabled={sharing}
        className="w-full rounded-2xl border-2 border-purple-600 bg-purple-600 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white hover:bg-purple-700 transition-colors disabled:opacity-50 sm:text-base"
      >
        {sharing ? "⏳ Sharing..." : "📤 Share Score on Farcaster"}
      </button>
    </div>
  );
}
