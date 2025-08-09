"use client";

import { ReactNode } from "react";
import { WEB3AUTH_NETWORK } from "@web3auth/base";
import { Web3AuthProvider } from "@web3auth/modal/react";

interface Web3AuthWrapperProps {
  children: ReactNode;
}

export const Web3AuthWrapper = ({ children }: Web3AuthWrapperProps) => {
  return (
    <Web3AuthProvider
      config={{
        web3AuthOptions: {
          clientId:
            process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID ||
            "BNHBcKh-dU0o6KBNnDDJkty3xAq_BxoU2ITX3PnNlPOCZNG2cpYGHlL7d6hx2nMF9bzm76eD53KF1dvUxEd1kfw",
          web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
        },
      }}
    >
      {children}
    </Web3AuthProvider>
  );
};
