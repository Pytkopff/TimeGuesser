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
    // CRITICAL: Call ready() ASAP so Farcaster hides the splash screen
    // On mobile, Farcaster will show a permanent loading spinner if ready() is delayed
    const callReady = async () => {
      try {
        console.log("🔵 Calling sdk.actions.ready() immediately...");
        await sdk.actions.ready();
        console.log("✅ Frame ready signal sent");
      } catch (err) {
        // Not in a Farcaster frame - that's fine
        console.log("ℹ️ sdk.actions.ready() not available (standalone mode)");
      }
    };
    
    callReady();
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
