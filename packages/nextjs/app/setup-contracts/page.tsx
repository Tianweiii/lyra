"use client";

import { useState } from "react";
import { formatUnits, parseUnits } from "viem";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth/Address/Address";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth/useScaffoldReadContract";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth/useScaffoldWriteContract";

export default function SetupContractsPage() {
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);

  // Contract addresses
  const OTC_ADDRESS = "0xB919D234f9081D8c0F20ee4219C4605BA883dc32";

  // Read contract data
  const { data: otcOwner } = useScaffoldReadContract({
    contractName: "LyraOtcSeller",
    functionName: "owner",
  });

  const { data: isOtcMerchant } = useScaffoldReadContract({
    contractName: "LyraToken",
    functionName: "isMerchant",
    args: [OTC_ADDRESS],
  });

  const { data: isOtcGovernment } = useScaffoldReadContract({
    contractName: "LyraOtcSeller",
    functionName: "isGovernment",
    args: [address],
  });

  const { data: usdtAllowance } = useScaffoldReadContract({
    contractName: "USDT",
    functionName: "allowance",
    args: [address, OTC_ADDRESS],
  });

  // Write contract functions
  const { writeContractAsync: writeLyraToken } = useScaffoldWriteContract("LyraToken");
  const { writeContractAsync: writeUsdt } = useScaffoldWriteContract("USDT");
  const { writeContractAsync: writeLyraOtcSeller } = useScaffoldWriteContract("LyraOtcSeller");

  const handleSetOtcAsMerchant = async () => {
    if (!address || address !== otcOwner) {
      alert("Only the contract owner can set OTC as merchant");
      return;
    }

    try {
      setIsLoading(true);
      await writeLyraToken({
        functionName: "setMerchant",
        args: [OTC_ADDRESS, true],
      });
    } catch (error) {
      console.error("Error setting OTC as merchant:", error);
      alert("Failed to set OTC as merchant");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveUsdt = async () => {
    try {
      setIsLoading(true);
      // Approve a large amount (1M USDT)
      const approveAmount = parseUnits("1000000", 6);
      await writeUsdt({
        functionName: "approve",
        args: [OTC_ADDRESS, approveAmount],
      });
    } catch (error) {
      console.error("Error approving USDT:", error);
      alert("Failed to approve USDT");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetGovernment = async () => {
    if (!address || address !== otcOwner) {
      alert("Only the contract owner can set government roles");
      return;
    }

    try {
      setIsLoading(true);
      await writeLyraOtcSeller({
        functionName: "setGovernment",
        args: [address, true],
      });
    } catch (error) {
      console.error("Error setting government role:", error);
      alert("Failed to set government role");
    } finally {
      setIsLoading(false);
    }
  };

  const isOwnerConnected = address === otcOwner;
  const hasUsdtAllowance = usdtAllowance && usdtAllowance > parseUnits("1000", 6);

  if (!address) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Setup Contracts</h1>
          <p className="text-gray-600">Please connect your wallet to setup contracts.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Setup Contracts</h1>

        <div className="space-y-6">
          {/* Step 1: Set OTC as Merchant */}
          <div className="rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Step 1: Set OTC as LYRA Merchant</h2>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">OTC Contract Address:</p>
              <Address address={OTC_ADDRESS} />
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Current Status:</p>
              <p className={`text-lg font-semibold ${isOtcMerchant ? "text-green-600" : "text-red-600"}`}>
                {isOtcMerchant ? "✅ OTC is merchant" : "❌ OTC is not merchant"}
              </p>
            </div>

            {!isOtcMerchant && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Contract Owner:</p>
                <Address address={otcOwner} />
                {isOwnerConnected && <p className="text-green-600 text-sm mt-1">✅ You are the owner</p>}
              </div>
            )}

            {!isOtcMerchant && isOwnerConnected && (
              <button
                onClick={handleSetOtcAsMerchant}
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? "Processing..." : "Set OTC as Merchant"}
              </button>
            )}

            {!isOtcMerchant && !isOwnerConnected && (
              <p className="text-red-600 text-sm">Only the contract owner can set OTC as merchant</p>
            )}
          </div>

          {/* Step 2: Approve USDT */}
          <div className="rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Step 2: Approve USDT for OTC</h2>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">USDT Allowance:</p>
              <p className="text-lg font-semibold">
                {usdtAllowance ? formatUnits(usdtAllowance, 6) : "Loading..."} USDT
              </p>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Status:</p>
              <p className={`text-lg font-semibold ${hasUsdtAllowance ? "text-green-600" : "text-red-600"}`}>
                {hasUsdtAllowance ? "✅ USDT approved" : "❌ USDT not approved"}
              </p>
            </div>

            {!hasUsdtAllowance && (
              <button
                onClick={handleApproveUsdt}
                disabled={isLoading}
                className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? "Processing..." : "Approve USDT (1M USDT)"}
              </button>
            )}
          </div>

          {/* Step 3: Set Government Role */}
          <div className="rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Step 3: Set Government Role</h2>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Your Address:</p>
              <Address address={address} />
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Government Status:</p>
              <p className={`text-lg font-semibold ${isOtcGovernment ? "text-green-600" : "text-red-600"}`}>
                {isOtcGovernment ? "✅ You are government" : "❌ You are not government"}
              </p>
            </div>

            {!isOtcGovernment && isOwnerConnected && (
              <button
                onClick={handleSetGovernment}
                disabled={isLoading}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? "Processing..." : "Set Government Role"}
              </button>
            )}

            {!isOtcGovernment && !isOwnerConnected && (
              <p className="text-red-600 text-sm">Only the contract owner can set government roles</p>
            )}
          </div>

          {/* Summary */}
          <div className="rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Setup Summary</h2>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span>OTC is LYRA Merchant:</span>
                <span className={isOtcMerchant ? "text-green-600" : "text-red-600"}>{isOtcMerchant ? "✅" : "❌"}</span>
              </div>
              <div className="flex justify-between">
                <span>USDT Approved:</span>
                <span className={hasUsdtAllowance ? "text-green-600" : "text-red-600"}>
                  {hasUsdtAllowance ? "✅" : "❌"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>You are Government:</span>
                <span className={isOtcGovernment ? "text-green-600" : "text-red-600"}>
                  {isOtcGovernment ? "✅" : "❌"}
                </span>
              </div>
            </div>

            {isOtcMerchant && hasUsdtAllowance && isOtcGovernment && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
                <p className="text-green-800 text-sm">
                  ✅ All setup complete! You can now use the{" "}
                  <a href="/government" className="text-blue-600 underline">
                    Government Portal
                  </a>
                  .
                </p>
              </div>
            )}
          </div>

          <div className="rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Instructions</h2>

            <div className="space-y-3 text-sm">
              <p>
                <strong>Why these steps are needed:</strong>
              </p>

              <div className="rounded p-4 mt-4">
                <h3 className="font-semibold mb-2">Step 1: Set OTC as Merchant</h3>
                <p>
                  The LYRA token has transfer restrictions. Only merchants can send LYRA to anyone. The OTC contract
                  needs to be set as a merchant to send LYRA to recipients.
                </p>
              </div>

              <div className="rounded p-4 mt-4">
                <h3 className="font-semibold mb-2">Step 2: Approve USDT</h3>
                <p>
                  When swapping USDT for LYRA, the OTC contract needs to transfer USDT from your wallet. You must
                  approve this first.
                </p>
              </div>

              <div className="rounded p-4 mt-4">
                <h3 className="font-semibold mb-2">Step 3: Set Government Role</h3>
                <p>
                  Only government users can use the govSwap functions. The contract owner must set your address as
                  government.
                </p>
              </div>

              <div className="rounded p-4 mt-4">
                <h3 className="font-semibold mb-2">Important Notes:</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Only the contract owner can set merchants and government roles</li>
                  <li>USDT approval is a one-time action (approves 1M USDT)</li>
                  <li>After setup, you can use the Government Portal normally</li>
                  <li>
                    Check the{" "}
                    <a href="/otc-status" className="text-blue-600 underline">
                      OTC Status
                    </a>{" "}
                    page for contract balances
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
