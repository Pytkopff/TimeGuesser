"use client";

import { useEffect, useState } from "react";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { WagmiProvider, createConfig, http } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { base } from "wagmi/chains";
import { injected, coinbaseWallet } from "wagmi/connectors";
import { farcasterFrame } from "@farcaster/frame-wagmi-connector";
import { FarcasterProvider } from "@/lib/farcaster";
import sdk from "@farcaster/frame-sdk";

type ProvidersProps = {
  children: React.ReactNode;
};

// Create wagmi config with Farcaster Frame connector
const config = createConfig({
  chains: [base],
  connectors: [
    farcasterFrame(),
    injected(),
    coinbaseWallet({ appName: "TimeGuesser" }),
  ],
  transports: {
    [base.id]: http(process.env.NEXT_PUBLIC_BASE_RPC_URL || "https://mainnet.base.org"),
  },
});

// Create React Query client
const queryClient = new QueryClient();

export default function Providers({ children }: ProvidersProps) {
  const [isFrameReady, setIsFrameReady] = useState(false);

  useEffect(() => {
    const initFrame = async () => {
      try {
        // Check if we're in a Farcaster frame
        const context = await sdk.context;
        
        if (context) {
          console.log("🔵 In Farcaster frame, notifying ready...");
          // Notify frame that app is ready
          await sdk.actions.ready();
          console.log("✅ Frame ready signal sent");
        } else {
          console.log("ℹ️ Not in Farcaster frame");
        }
      } catch (err) {
        console.log("ℹ️ Farcaster SDK error:", err);
      }
      
      setIsFrameReady(true);
    };
    
    initFrame();
  }, []);

  // Show loading while initializing frame
  if (!isFrameReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f3ee]">
        <div className="text-zinc-500 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <FarcasterProvider>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <OnchainKitProvider
            chain={base}
            rpcUrl={process.env.NEXT_PUBLIC_BASE_RPC_URL}
          >
            {children}
          </OnchainKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </FarcasterProvider>
  );
}
