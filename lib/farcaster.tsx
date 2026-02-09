"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import sdk from "@farcaster/frame-sdk";

type FarcasterUser = {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
  custody?: string;
  verifications?: string[];
};

// Define our own context type based on Farcaster SDK structure
type FrameContextData = {
  user?: {
    fid: number;
    username?: string;
    displayName?: string;
    pfpUrl?: string;
  };
  client?: {
    clientFid?: number;
    added?: boolean;
  };
  location?: unknown;
};

type FarcasterContextType = {
  isLoaded: boolean;
  isInFrame: boolean;
  context: FrameContextData | null;
  user: FarcasterUser | null;
};

const FarcasterContext = createContext<FarcasterContextType>({
  isLoaded: false,
  isInFrame: false,
  context: null,
  user: null,
});

export function FarcasterProvider({ children }: { children: ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInFrame, setIsInFrame] = useState(false);
  const [context, setContext] = useState<FrameContextData | null>(null);
  const [user, setUser] = useState<FarcasterUser | null>(null);

  useEffect(() => {
    const initFarcaster = async () => {
      try {
        console.log("🔵 Initializing Farcaster SDK...");
        
        // Race: get context with a 3-second timeout
        // On mobile, sdk.context might hang if comlink isn't ready
        const ctx = await Promise.race([
          sdk.context,
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000)),
        ]);
        
        if (ctx) {
          console.log("✅ Farcaster context received:", ctx);
          setContext(ctx as FrameContextData);
          setIsInFrame(true);
          
          // Extract user data from context
          const ctxTyped = ctx as FrameContextData;
          if (ctxTyped.user) {
            // Handle different SDK versions - pfpUrl can be string or pfp can be object
            const ctxUser = ctxTyped.user as any;
            let avatarUrl = ctxUser.pfpUrl;
            if (!avatarUrl && ctxUser.pfp) {
              avatarUrl = typeof ctxUser.pfp === 'string' ? ctxUser.pfp : ctxUser.pfp?.url;
            }
            
            const farcasterUser: FarcasterUser = {
              fid: ctxTyped.user.fid,
              username: ctxTyped.user.username,
              displayName: ctxTyped.user.displayName,
              pfpUrl: avatarUrl,
            };
            setUser(farcasterUser);
            console.log("✅ Farcaster user:", farcasterUser);
          }
        } else {
          console.log("ℹ️ Not in Farcaster frame (timeout or standalone)");
          setIsInFrame(false);
        }
      } catch (err) {
        console.log("ℹ️ Farcaster SDK not available (standalone mode):", err);
        setIsInFrame(false);
      } finally {
        setIsLoaded(true);
      }
    };

    initFarcaster();
  }, []);

  return (
    <FarcasterContext.Provider value={{ isLoaded, isInFrame, context, user }}>
      {children}
    </FarcasterContext.Provider>
  );
}

export function useFarcaster() {
  return useContext(FarcasterContext);
}

// Helper to get wallet address from Farcaster user
export function getFarcasterWallet(user: FarcasterUser | null): string | null {
  if (!user) return null;
  // Prefer verified addresses, fallback to custody
  if (user.verifications && user.verifications.length > 0) {
    return user.verifications[0];
  }
  return user.custody || null;
}
