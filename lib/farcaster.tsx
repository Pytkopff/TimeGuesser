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
  ready: () => Promise<void>;
};

const FarcasterContext = createContext<FarcasterContextType>({
  isLoaded: false,
  isInFrame: false,
  context: null,
  user: null,
  ready: async () => {},
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
        
        // Get context from Farcaster client
        const ctx = await sdk.context;
        
        if (ctx) {
          console.log("✅ Farcaster context received:", ctx);
          setContext(ctx);
          setIsInFrame(true);
          
          // Extract user data from context
          if (ctx.user) {
            // Handle different SDK versions - pfpUrl can be string or pfp can be object
            const ctxUser = ctx.user as any;
            let avatarUrl = ctxUser.pfpUrl;
            if (!avatarUrl && ctxUser.pfp) {
              avatarUrl = typeof ctxUser.pfp === 'string' ? ctxUser.pfp : ctxUser.pfp?.url;
            }
            
            const farcasterUser: FarcasterUser = {
              fid: ctx.user.fid,
              username: ctx.user.username,
              displayName: ctx.user.displayName,
              pfpUrl: avatarUrl,
            };
            setUser(farcasterUser);
            console.log("✅ Farcaster user:", farcasterUser);
            console.log("✅ Avatar URL:", avatarUrl);
          }
        } else {
          console.log("ℹ️ Not in Farcaster frame, running standalone");
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

  // Call this when app is ready to be shown
  const ready = async () => {
    if (isInFrame) {
      try {
        await sdk.actions.ready();
        console.log("✅ Frame ready signal sent");
      } catch (err) {
        console.error("Failed to send ready signal:", err);
      }
    }
  };

  return (
    <FarcasterContext.Provider value={{ isLoaded, isInFrame, context, user, ready }}>
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
