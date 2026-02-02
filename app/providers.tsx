"use client";

import { OnchainKitProvider } from "@coinbase/onchainkit";
import { base } from "wagmi/chains";

type ProvidersProps = {
  children: React.ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  return (
    <OnchainKitProvider
      chain={base}
      rpcUrl={process.env.NEXT_PUBLIC_BASE_RPC_URL}
    >
      {children}
    </OnchainKitProvider>
  );
}
