"use client";

import { useState } from "react";
import { formatUnits, parseUnits } from "viem";
import { useAccount, useWalletClient } from "wagmi";
import { Address } from "~~/components/scaffold-eth/Address/Address";
import { EtherInput } from "~~/components/scaffold-eth/Input/EtherInput";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth/useScaffoldReadContract";

export default function FundMaticPage() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [maticAmount, setMaticAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // OTC contract address
  const OTC_ADDRESS = "0x5265BCcc8aB5A36A45ABD2E574E6Fa7F863e5C2e";

  // Read balances
  const { data: otcNativeBalance } = useScaffoldReadContract({
    contractName: "LyraOtcSeller",
    functionName: "getBalance",
    args: ["0x0000000000000000000000000000000000000000"], // Native token (MATIC)
  });

  const { data: owner } = useScaffoldReadContract({
    contractName: "LyraOtcSeller",
    functionName: "owner",
  });

  const { data: priceUsdtPerNative } = useScaffoldReadContract({
    contractName: "LyraOtcSeller",
    functionName: "priceUsdtPerNative",
  });

  const handleSendMatic = async () => {
    if (!maticAmount || !walletClient) return;

    try {
      setIsLoading(true);

      // Send MATIC to OTC contract
      await walletClient.sendTransaction({
        to: OTC_ADDRESS,
        value: parseUnits(maticAmount, 18),
      });

      setMaticAmount("");
      alert("Successfully sent MATIC to OTC contract!");
    } catch (error) {
      console.error("Error sending MATIC:", error);
      alert("Failed to send MATIC. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isOwnerConnected = owner === address;

  if (!address) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Fund MATIC</h1>
          <p className="text-gray-600">Please connect your wallet to send MATIC.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Fund MATIC for Fees</h1>

        <div className="rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Contract Information</h2>

          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">OTC Contract Address:</p>
            <Address address={OTC_ADDRESS} />
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Contract Owner:</p>
            <Address address={owner} />
            {isOwnerConnected && <p className="text-green-600 text-sm mt-1">✅ You are the owner</p>}
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">MATIC Price:</p>
            <p className="text-lg font-semibold">
              {priceUsdtPerNative ? formatUnits(priceUsdtPerNative, 6) : "Loading..."} USDT per MATIC
            </p>
          </div>
        </div>

        <div className="rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">MATIC Balance</h2>

          <div className="mb-4">
            <p className="text-sm text-gray-600">OTC Contract MATIC Balance:</p>
            <p className="text-lg font-semibold">
              {otcNativeBalance ? formatUnits(otcNativeBalance, 18) : "Loading..."} MATIC
            </p>
          </div>

          {otcNativeBalance && otcNativeBalance < parseUnits("0.1", 18) && (
            <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
              <p className="text-red-800 text-sm">
                ⚠️ OTC contract has low MATIC balance. This is why you&apos;re getting &quot;insufficient native for
                fee&quot; errors.
              </p>
            </div>
          )}
        </div>

        <div className="rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Send MATIC</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">MATIC Amount:</label>
            <EtherInput value={maticAmount} onChange={setMaticAmount} placeholder="Enter MATIC amount" />
          </div>

          {maticAmount && (
            <div className="mb-4 p-4 rounded">
              <p className="text-sm text-gray-600">Transfer Summary:</p>
              <p className="text-lg font-semibold">{maticAmount} MATIC</p>
            </div>
          )}

          <button
            onClick={handleSendMatic}
            disabled={isLoading || !maticAmount}
            className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? "Processing..." : "Send MATIC"}
          </button>
        </div>

        <div className="rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>

          <div className="space-y-3 text-sm">
            <p>
              <strong>Why send MATIC to the OTC contract?</strong>
            </p>
            <p>
              The OTC contract needs MATIC to pay the 0.1% fee to recipients. This fee helps cover their gas costs on
              Polygon network.
            </p>

            <div className="rounded p-4 mt-4">
              <h3 className="font-semibold mb-2">How it works:</h3>
              <ol className="list-decimal list-inside space-y-1">
                <li>You send MATIC to the OTC contract</li>
                <li>When someone swaps USDT for LYRA, the contract sends 0.1% in MATIC</li>
                <li>The MATIC fee helps recipients pay for gas</li>
                <li>The contract needs enough MATIC to cover these fees</li>
              </ol>
            </div>

            <div className="rounded p-4 mt-4">
              <h3 className="font-semibold mb-2">Fee Calculation Example:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>If someone swaps 1000 USDT:</li>
                <li>Fee = 1000 * 0.1% = 1 USDT</li>
                <li>
                  Fee in MATIC = 1 USDT / {priceUsdtPerNative ? formatUnits(priceUsdtPerNative, 6) : "0.23"} USDT/MATIC
                </li>
                <li>The contract needs this much MATIC to pay the fee</li>
              </ul>
            </div>

            <div className="rounded p-4 mt-4">
              <h3 className="font-semibold mb-2">Important Notes:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Anyone can send MATIC to the contract</li>
                <li>Recommended to keep at least 1-2 MATIC in the contract</li>
                <li>Monitor the balance regularly</li>
                <li>
                  Check the{" "}
                  <a href="/otc-status" className="text-blue-600 underline">
                    OTC Status
                  </a>{" "}
                  page for updates
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
