"use client";

import { useState } from "react";
import { formatUnits, parseUnits } from "viem";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth/Address/Address";
import { EtherInput } from "~~/components/scaffold-eth/Input/EtherInput";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth/useScaffoldReadContract";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth/useScaffoldWriteContract";

export default function FundOtcPage() {
  const { address } = useAccount();
  const [lyraAmount, setLyraAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // OTC contract address
  const OTC_ADDRESS = "0xB919D234f9081D8c0F20ee4219C4605BA883dc32";

  // Read balances
  const { data: userLyraBalance } = useScaffoldReadContract({
    contractName: "LyraToken",
    functionName: "balanceOf",
    args: [address],
  });

  const { data: otcLyraBalance } = useScaffoldReadContract({
    contractName: "LyraToken",
    functionName: "balanceOf",
    args: [OTC_ADDRESS],
  });

  const { data: isOwner } = useScaffoldReadContract({
    contractName: "LyraOtcSeller",
    functionName: "owner",
  });

  // Write contract
  const { writeContractAsync: writeLyraToken } = useScaffoldWriteContract("LyraToken");

  const handleFundOtc = async () => {
    if (!lyraAmount) return;

    try {
      setIsLoading(true);
      const lyraAmountWei = parseUnits(lyraAmount, 18);

      await writeLyraToken({
        functionName: "transfer",
        args: [OTC_ADDRESS, lyraAmountWei],
      });

      setLyraAmount("");
      alert("Successfully funded OTC contract!");
    } catch (error) {
      console.error("Error funding OTC:", error);
      alert("Failed to fund OTC contract. Please check your balance and permissions.");
    } finally {
      setIsLoading(false);
    }
  };

  const isOwnerConnected = isOwner === address;

  if (!address) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Fund OTC Contract</h1>
          <p className="text-gray-600">Please connect your wallet to fund the OTC contract.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Fund OTC Contract</h1>

        <div className="rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Contract Information</h2>

          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">OTC Contract Address:</p>
            <Address address={OTC_ADDRESS} />
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Contract Owner:</p>
            <Address address={isOwner} />
            {isOwnerConnected && <p className="text-green-600 text-sm mt-1">✅ You are the owner</p>}
          </div>
        </div>

        <div className=" rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Balances</h2>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600">Your LYRA Balance:</p>
              <p className="text-lg font-semibold">
                {userLyraBalance ? formatUnits(userLyraBalance, 18) : "Loading..."} LYRA
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">OTC LYRA Balance:</p>
              <p className="text-lg font-semibold">
                {otcLyraBalance ? formatUnits(otcLyraBalance, 18) : "Loading..."} LYRA
              </p>
            </div>
          </div>

          {otcLyraBalance && otcLyraBalance === 0n && (
            <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
              <p className="text-red-800 text-sm">
                ⚠️ OTC contract has low LYRA balance. This is why you&apos;re getting &quot;insufficient lyra in
                OTC&quot; errors.
              </p>
            </div>
          )}
        </div>

        <div className=" rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Fund OTC Contract</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">LYRA Amount to Transfer:</label>
            <EtherInput value={lyraAmount} onChange={setLyraAmount} placeholder="Enter LYRA amount" />
          </div>

          {lyraAmount && userLyraBalance && (
            <div className="mb-4 p-4 rounded">
              <p className="text-sm text-gray-600">Transfer Summary:</p>
              <p className="text-lg font-semibold">{lyraAmount} LYRA</p>
              {parseFloat(lyraAmount) > parseFloat(formatUnits(userLyraBalance, 18)) && (
                <p className="text-red-600 text-sm mt-1">Insufficient balance!</p>
              )}
            </div>
          )}

          <button
            onClick={handleFundOtc}
            disabled={
              isLoading ||
              !lyraAmount ||
              (userLyraBalance && parseFloat(lyraAmount) > parseFloat(formatUnits(userLyraBalance, 18)))
            }
            className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? "Processing..." : "Fund OTC Contract"}
          </button>
        </div>

        <div className="rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>

          <div className="space-y-3 text-sm">
            <p>
              <strong>Why fund the OTC contract?</strong>
            </p>
            <p>
              The OTC contract needs LYRA tokens to execute swaps. When you try to swap USDT for LYRA, the contract must
              have enough LYRA to send to recipients.
            </p>

            <div className=" rounded p-4 mt-4">
              <h3 className="font-semibold mb-2">How it works:</h3>
              <ol className="list-decimal list-inside space-y-1">
                <li>You&apos;ll need to fund the OTC contract with LYRA tokens</li>
                <li>When someone swaps USDT for LYRA, the contract sends LYRA from its balance</li>
                <li>The contract keeps the USDT as backing for future swaps</li>
                <li>Merchants can swap LYRA back to USDT using the contract&apos;s USDT balance</li>
              </ol>
            </div>

            <div className="rounded p-4 mt-4">
              <h3 className="font-semibold mb-2">Important Notes:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Only the contract owner should fund the OTC contract</li>
                <li>The contract needs both LYRA and USDT to function properly</li>
                <li>Funding is a one-time setup process</li>
                <li>
                  Check the{" "}
                  <a href="/otc-status" className="text-blue-600 underline">
                    OTC Status
                  </a>{" "}
                  page to monitor balances
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
