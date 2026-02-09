"use client";

import { useEffect } from "react";
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

// ============================================================
// CRITICAL: Call ready() at MODULE LEVEL - before React renders
// On mobile Warpcast, useEffect is too late - the splash screen
// timeout fires before React's useEffect runs
// ============================================================
if (typeof window !== "undefined") {
  // Fire-and-forget - don't await, don't block anything
  sdk.actions.ready().catch(() => {
    // Silently ignore - we're not in a Farcaster frame
  });
  
  // Safety net: try again after 500ms in case first call was too early
  setTimeout(() => {
    sdk.actions.ready().catch(() => {});
  }, 500);
  
  // Last resort: try one more time after 2 seconds
  setTimeout(() => {
    sdk.actions.ready().catch(() => {});
  }, 2000);
}

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
  useEffect(() => {
    // Also call ready() in useEffect as additional safety net
    sdk.actions.ready().catch(() => {});
  }, []);

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
