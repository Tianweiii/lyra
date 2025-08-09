"use client";

import Image from "next/image";
import { AddressInfoDropdown } from "./AddressInfoDropdown";
import { WrongNetworkDropdown } from "./WrongNetworkDropdown";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { getTargetNetworks } from "~~/utils/scaffold-eth";

/**
 * Custom Connect Button for RainbowKit
 */
export const RainbowKitCustomConnectButton = () => {
  const { isConnected, address } = useAccount();
  const targetNetworks = getTargetNetworks();

  // Only render AddressInfoDropdown if we have a valid address
  if (isConnected && address && address !== "0x0000000000000000000000000000000000000000") {
    return (
      <AddressInfoDropdown
        address={address}
        blockExplorerAddressLink={`${targetNetworks[0].blockExplorers?.default.url}/address/${address}`}
        displayName={address}
      />
    );
  }

  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button className="btn btn-primary btn-sm" onClick={openConnectModal} type="button">
                    Connect Wallet
                  </button>
                );
              }

              if (chain.unsupported) {
                return <WrongNetworkDropdown />;
              }

              return (
                <div className="flex flex-col gap-3 lg:flex-row lg:gap-2">
                  <button
                    className="btn btn-secondary btn-sm dropdown-toggle gap-1 h-8 w-full lg:w-52"
                    onClick={openChainModal}
                    type="button"
                  >
                    <span>
                      {chain.hasIcon && (
                        <div
                          style={{
                            background: chain.iconBackground,
                            width: 12,
                            height: 12,
                            borderRadius: 999,
                            overflow: "hidden",
                            marginRight: 4,
                          }}
                        >
                          {chain.iconUrl && (
                            <Image alt={chain.name ?? "Chain icon"} src={chain.iconUrl} width={12} height={12} />
                          )}
                        </div>
                      )}
                      {chain.name}
                    </span>
                  </button>

                  <button
                    className="btn btn-primary btn-sm h-8 w-full lg:w-auto"
                    onClick={openAccountModal}
                    type="button"
                  >
                    {account.displayName}
                    {account.displayBalance ? ` (${account.displayBalance})` : ""}
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};
