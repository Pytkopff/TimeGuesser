"use client";

import { OnchainKitProvider } from "@coinbase/onchainkit";
import { WalletProvider } from "@coinbase/onchainkit/wallet";
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
      <WalletProvider>{children}</WalletProvider>
    </OnchainKitProvider>
  );
}
