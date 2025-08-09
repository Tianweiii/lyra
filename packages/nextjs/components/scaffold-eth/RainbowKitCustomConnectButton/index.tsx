"use client";

import { AddressInfoDropdown } from "./AddressInfoDropdown";
import { WrongNetworkDropdown } from "./WrongNetworkDropdown";
import { useWeb3AuthConnect } from "@web3auth/modal/react";
import { useAccount, useChainId } from "wagmi";
import { getTargetNetworks } from "~~/utils/scaffold-eth";

/**
 * Custom Connect Button using Web3Auth for connection and wagmi for account state
 */
export const RainbowKitCustomConnectButton = () => {
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const { connect } = useWeb3AuthConnect();
  const targetNetworks = getTargetNetworks();

  const allowedChainIds = targetNetworks.map(n => n.id);
  const onWrongNetwork = isConnected && chainId !== undefined && !allowedChainIds.includes(chainId);

  // Only render AddressInfoDropdown if we have a valid address
  if (isConnected && address && address !== "0x0000000000000000000000000000000000000000") {
    if (onWrongNetwork) {
      return <WrongNetworkDropdown />;
    }
    return (
      <AddressInfoDropdown
        address={address}
        blockExplorerAddressLink={`${targetNetworks[0].blockExplorers?.default.url}/address/${address}`}
        displayName={address}
      />
    );
  }

  return (
    <button className="btn btn-primary btn-sm" onClick={() => connect()} type="button">
      {"Login with Web3Auth"}
    </button>
  );
};
