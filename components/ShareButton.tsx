"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import sdk from "@farcaster/frame-sdk";
import { useFarcaster } from "@/lib/farcaster";

type ShareButtonProps = {
  score: number;
};

export default function ShareButton({ score }: ShareButtonProps) {
  useAccount(); // keep hook for potential future use
  const { isInFrame } = useFarcaster();
  const [sharing, setSharing] = useState(false);

  const handleShare = async () => {
    setSharing(true);
    try {
      // The embed MUST be the main app URL so Farcaster uses the manifest
      // and shows the "Play TimeGuesser" button from farcaster.json
      const appUrl = typeof window !== "undefined" 
        ? window.location.origin 
        : "https://time-guesser-three.vercel.app";
      
      const text = `🕰️ I scored ${score}/5000 in TimeGuesser!\n\nCan you guess the year from just a photo? 📸\n\nBeat my score 👇`;

      if (isInFrame) {
        // Use Farcaster SDK to open compose within the app
        await sdk.actions.composeCast({
          text,
          embeds: [appUrl],
        });
      } else {
        // Fallback: open Warpcast compose in new tab
        const warpcastUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}&embeds[]=${encodeURIComponent(appUrl)}`;
        window.open(warpcastUrl, "_blank");
      }
    } catch (err) {
      console.error("Share error:", err);
      try {
        await navigator.clipboard.writeText(
          `I scored ${score} pts in TimeGuesser! Play: ${window.location.origin}`
        );
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
