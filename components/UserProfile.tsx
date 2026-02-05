"use client";

import { useFarcaster } from "@/lib/farcaster";
import { useAccount } from "wagmi";
import { ConnectWallet } from "@coinbase/onchainkit/wallet";

export default function UserProfile() {
  const { isLoaded, isInFrame, user } = useFarcaster();
  const { address, isConnected } = useAccount();

  // Still loading Farcaster context
  if (!isLoaded) {
    return (
      <div className="flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-3 py-1">
        <div className="h-6 w-6 animate-pulse rounded-full bg-zinc-200" />
        <span className="text-[10px] text-zinc-400">Loading...</span>
      </div>
    );
  }

  // In Farcaster frame with user data
  if (isInFrame && user) {
    return (
      <div className="flex items-center gap-2 rounded-full border-2 border-purple-500 bg-purple-50 px-3 py-1">
        {user.pfpUrl ? (
          <img 
            src={user.pfpUrl} 
            alt={user.displayName || user.username || "User"} 
            className="h-6 w-6 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-200 text-[10px] font-bold text-purple-600">
            {(user.displayName || user.username || "?")[0].toUpperCase()}
          </div>
        )}
        <span className="text-[10px] font-semibold text-purple-700 sm:text-xs">
          {user.displayName || user.username || `fid:${user.fid}`}
        </span>
      </div>
    );
  }

  // Connected with wallet but not Farcaster
  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-3 py-1">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-200 text-[10px] font-bold text-zinc-600">
          🔗
        </div>
        <span className="text-[10px] font-semibold text-zinc-700 sm:text-xs">
          {address.slice(0, 4)}...{address.slice(-4)}
        </span>
      </div>
    );
  }

  // Not connected - show connect button
  return (
    <div className="scale-90">
      <ConnectWallet />
    </div>
  );
}
