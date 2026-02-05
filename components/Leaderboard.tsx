"use client";

import { useEffect, useState } from "react";

type LeaderboardEntry = {
  canonical_user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  score: number;
  avg_delta?: number;
};

type LeaderboardProps = {
  onClose: () => void;
};

export default function Leaderboard({ onClose }: LeaderboardProps) {
  const [activeTab, setActiveTab] = useState<"top_score" | "best_accuracy">("top_score");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const res = await fetch(`/api/leaderboard?type=${activeTab}&limit=20`);
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch leaderboard");
        }
        
        setEntries(data.leaderboard || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load");
        setEntries([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [activeTab]);

  const formatAddress = (address: string) => {
    if (!address) return "Anonymous";
    if (address.startsWith("0x")) {
      return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }
    return address;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="relative w-full max-w-md rounded-3xl border-2 border-zinc-900 bg-[#f5f3ee] p-4 shadow-[0_12px_0_0_rgba(0,0,0,0.2)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-300 pb-3">
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-900 sm:text-xs">
            Leaderboard
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border-2 border-zinc-900 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-zinc-100"
          >
            Close
          </button>
        </div>

        {/* Tabs */}
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("top_score")}
            className={`flex-1 rounded-xl border-2 border-zinc-900 py-2 text-[10px] font-bold uppercase tracking-[0.15em] transition-colors sm:text-xs ${
              activeTab === "top_score"
                ? "bg-zinc-900 text-white"
                : "bg-white text-zinc-900 hover:bg-zinc-100"
            }`}
          >
            Top Scores
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("best_accuracy")}
            className={`flex-1 rounded-xl border-2 border-zinc-900 py-2 text-[10px] font-bold uppercase tracking-[0.15em] transition-colors sm:text-xs ${
              activeTab === "best_accuracy"
                ? "bg-zinc-900 text-white"
                : "bg-white text-zinc-900 hover:bg-zinc-100"
            }`}
          >
            Best Accuracy
          </button>
        </div>

        {/* Content */}
        <div className="mt-3 max-h-[50vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex h-32 items-center justify-center text-sm text-zinc-500">
              Loading...
            </div>
          ) : error ? (
            <div className="flex h-32 items-center justify-center text-sm text-red-600">
              {error}
            </div>
          ) : entries.length === 0 ? (
            <div className="flex h-32 flex-col items-center justify-center gap-2 text-center text-sm text-zinc-500">
              <div>No entries yet</div>
              <div className="text-xs">Be the first to mint your score!</div>
            </div>
          ) : (
            <div className="space-y-2">
              {entries.map((entry, index) => (
                <div
                  key={entry.canonical_user_id}
                  className="flex items-center gap-3 rounded-xl border border-zinc-300 bg-white p-3"
                >
                  <div
                    className={`relative flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-black ${
                      index === 0
                        ? "border-yellow-500 bg-yellow-50 text-yellow-600"
                        : index === 1
                        ? "border-zinc-400 bg-zinc-100 text-zinc-500"
                        : index === 2
                        ? "border-amber-600 bg-amber-50 text-amber-700"
                        : "border-zinc-300 bg-zinc-50 text-zinc-500"
                    }`}
                  >
                    {index + 1}
                  </div>
                  
                  {/* Avatar */}
                  {entry.avatar_url ? (
                    <img
                      src={entry.avatar_url}
                      alt={entry.display_name || "User avatar"}
                      className="h-8 w-8 rounded-full border border-zinc-300 object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-300 bg-zinc-100 text-xs font-bold text-zinc-500">
                      {(entry.display_name || entry.canonical_user_id || "?").charAt(0).toUpperCase()}
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-xs font-semibold text-zinc-900">
                      {entry.display_name || formatAddress(entry.canonical_user_id)}
                    </div>
                    {entry.display_name && (
                      <div className="truncate text-[10px] text-zinc-500">
                        {formatAddress(entry.canonical_user_id)}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm font-black text-zinc-900">
                      {activeTab === "best_accuracy" 
                        ? `±${entry.avg_delta?.toFixed(1) || entry.score}y`
                        : `${entry.score} pts`
                      }
                    </div>
                    <div className="text-[10px] text-zinc-500">
                      {activeTab === "best_accuracy" ? "avg error" : "high score"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-3 border-t border-zinc-300 pt-3 text-center text-[10px] text-zinc-500">
          Mint your score to appear on the leaderboard
        </div>
      </div>
    </div>
  );
}
