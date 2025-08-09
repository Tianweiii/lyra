"use client";

import { useState } from "react";
import { formatUnits, parseUnits } from "viem";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth/Address/Address";
import { EtherInput } from "~~/components/scaffold-eth/Input/EtherInput";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth/useScaffoldReadContract";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth/useScaffoldWriteContract";

export default function ExternalContractsPage() {
  const { address } = useAccount();
  const [lyraAmount, setLyraAmount] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Read from external LyraToken contract
  const { data: lyraBalance } = useScaffoldReadContract({
    contractName: "LyraToken",
    functionName: "balanceOf",
    args: [address],
  });

  const { data: isGovernment } = useScaffoldReadContract({
    contractName: "LyraToken",
    functionName: "isGovernment",
    args: [address],
  });

  const { data: isMerchant } = useScaffoldReadContract({
    contractName: "LyraToken",
    functionName: "isMerchant",
    args: [address],
  });

  // Read from external LyraOtcSeller contract
  const { data: priceUsdtPerNative } = useScaffoldReadContract({
    contractName: "LyraOtcSeller",
    functionName: "priceUsdtPerNative",
  });

  const { data: lyraPerUsdt } = useScaffoldReadContract({
    contractName: "LyraOtcSeller",
    functionName: "lyraPerUsdt",
  });

  // Write to external LyraToken contract
  const { writeContractAsync: writeLyraToken } = useScaffoldWriteContract("LyraToken");

  const handleTransfer = async () => {
    if (!lyraAmount || !recipientAddress) return;

    try {
      setIsLoading(true);
      const lyraAmountWei = parseUnits(lyraAmount, 18);

      await writeLyraToken({
        functionName: "transfer",
        args: [recipientAddress, lyraAmountWei],
      });

      setLyraAmount("");
      setRecipientAddress("");
      alert("Transfer successful!");
    } catch (error) {
      console.error("Error transferring LYRA:", error);
      alert("Transfer failed. Please check your permissions and balance.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!address) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">External Contracts Demo</h1>
          <p className="text-gray-600">Please connect your wallet to interact with external contracts.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">External Contracts Demo</h1>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Your Account Info</h2>

          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Connected Address:</p>
            <Address address={address} />
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">LYRA Balance:</p>
            <p className="text-lg font-semibold">{lyraBalance ? formatUnits(lyraBalance, 18) : "Loading..."} LYRA</p>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Role Status:</p>
            <div className="space-y-1">
              <p className="text-sm">
                Government:{" "}
                <span className={isGovernment ? "text-green-600" : "text-red-600"}>{isGovernment ? "Yes" : "No"}</span>
              </p>
              <p className="text-sm">
                Merchant:{" "}
                <span className={isMerchant ? "text-green-600" : "text-red-600"}>{isMerchant ? "Yes" : "No"}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Transfer LYRA</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Recipient Address:</label>
            <input
              type="text"
              value={recipientAddress}
              onChange={e => setRecipientAddress(e.target.value)}
              placeholder="Enter recipient address"
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">LYRA Amount:</label>
            <EtherInput value={lyraAmount} onChange={setLyraAmount} placeholder="Enter LYRA amount" />
          </div>

          <button
            onClick={handleTransfer}
            disabled={isLoading || !lyraAmount || !recipientAddress}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? "Processing..." : "Transfer LYRA"}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Contract Information</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• LyraToken Address: 0xc11bd7B043736423Dbc2d70AE5A0f642f9959257</p>
            <p>• LyraOtcSeller Address: 0xB919D234f9081D8c0F20ee4219C4605BA883dc32</p>
            <p>• MATIC Price: {priceUsdtPerNative ? formatUnits(priceUsdtPerNative, 6) : "Loading..."} USDT</p>
            <p>• LYRA Price: {lyraPerUsdt ? formatUnits(lyraPerUsdt, 12) : "Loading..."} USDT</p>
          </div>
        </div>
      </div>
    </div>
  );
}
