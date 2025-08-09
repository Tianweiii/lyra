"use client";

import { useEffect, useState } from "react";
import { AddressInfoDropdown } from "./AddressInfoDropdown";
import { WrongNetworkDropdown } from "./WrongNetworkDropdown";
import { useWeb3Auth, useWeb3AuthConnect, useWeb3AuthUser } from "@web3auth/modal/react";
import { useAccount, useChainId } from "wagmi";
import { getTargetNetworks } from "~~/utils/scaffold-eth";

/**
 * Custom Connect Button using Web3Auth for connection and account state
 */
export const RainbowKitCustomConnectButton = () => {
  const { isConnected: wagmiConnected, address: wagmiAddress } = useAccount();
  const chainId = useChainId();
  const { connect: web3AuthConnect, isConnected: web3AuthConnected } = useWeb3AuthConnect();
  const { userInfo } = useWeb3AuthUser();
  const { provider } = useWeb3Auth();
  const [web3AuthAddress, setWeb3AuthAddress] = useState<string | null>(null);
  const targetNetworks = getTargetNetworks();

  // Get address from Web3Auth provider
  useEffect(() => {
    const getWeb3AuthAddress = async () => {
      if (web3AuthConnected && provider && userInfo) {
        try {
          // Get accounts from Web3Auth provider
          const accountsUnknown = (await provider.request({ method: "eth_accounts" })) as unknown;
          if (Array.isArray(accountsUnknown) && accountsUnknown.length > 0 && typeof accountsUnknown[0] === "string") {
            setWeb3AuthAddress(accountsUnknown[0] as string);
          }
        } catch (error) {
          console.error("Failed to get Web3Auth address:", error);
          setWeb3AuthAddress(null);
        }
      } else {
        setWeb3AuthAddress(null);
      }
    };

    getWeb3AuthAddress();
  }, [web3AuthConnected, provider, userInfo]);

  const allowedChainIds = targetNetworks.map(n => n.id);
  const onWrongNetwork =
    (wagmiConnected || web3AuthConnected) && chainId !== undefined && !allowedChainIds.includes(chainId);

  // Prioritize Web3Auth connection and address over wagmi
  const isUserConnected = web3AuthConnected && userInfo && web3AuthAddress;
  const userAddress = web3AuthAddress || wagmiAddress;

  // Only render AddressInfoDropdown if we have a valid address and are actually connected
  if (isUserConnected && userAddress && userAddress !== "0x0000000000000000000000000000000000000000") {
    if (onWrongNetwork) {
      return <WrongNetworkDropdown />;
    }
    return (
      <AddressInfoDropdown
        address={userAddress}
        blockExplorerAddressLink={`${targetNetworks[0].blockExplorers?.default.url}/address/${userAddress}`}
        displayName={userInfo?.name || userAddress}
      />
    );
  }

  // Show wagmi connection if Web3Auth is not connected but wagmi is
  if (
    !web3AuthConnected &&
    wagmiConnected &&
    wagmiAddress &&
    wagmiAddress !== "0x0000000000000000000000000000000000000000"
  ) {
    if (onWrongNetwork) {
      return <WrongNetworkDropdown />;
    }
    return (
      <AddressInfoDropdown
        address={wagmiAddress}
        blockExplorerAddressLink={`${targetNetworks[0].blockExplorers?.default.url}/address/${wagmiAddress}`}
        displayName={wagmiAddress}
      />
    );
  }

  return (
    <button className="btn btn-primary btn-sm" onClick={() => web3AuthConnect()} type="button">
      {web3AuthConnected && !web3AuthAddress ? "Connecting..." : "Login with Web3Auth"}
    </button>
  );
};
