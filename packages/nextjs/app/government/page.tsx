"use client";

import { useState } from "react";
import { formatUnits, parseUnits } from "viem";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { AddressInput } from "~~/components/scaffold-eth/Input/AddressInput";
import { EtherInput } from "~~/components/scaffold-eth/Input/EtherInput";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth/useScaffoldReadContract";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth/useScaffoldWriteContract";

export default function GovernmentPage() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const [recipientAddress, setRecipientAddress] = useState("");
  const [usdtAmount, setUsdtAmount] = useState("");
  const [nativeAmount, setNativeAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [swapType, setSwapType] = useState<"usdt" | "native">("usdt");

  // Check if connected to Polygon network (chain ID 137)
  const isPolygonNetwork = chainId === 137;

  // Read contract data - only when wallet is connected and on correct network
  const { data: priceUsdtPerNative } = useScaffoldReadContract({
    contractName: "LyraOtcSeller",
    functionName: "priceUsdtPerNative",
  });

  const { data: lyraPerUsdt } = useScaffoldReadContract({
    contractName: "LyraOtcSeller",
    functionName: "lyraPerUsdt",
  });

  const { data: isGovernment } = useScaffoldReadContract({
    contractName: "LyraOtcSeller",
    functionName: "isGovernment",
    args: [address],
  });

  // Write contract functions
  const { writeContractAsync: writeLyraOtcSeller } = useScaffoldWriteContract("LyraOtcSeller");

  const handleSwitchToPolygon = async () => {
    try {
      await switchChain({ chainId: 137 });
    } catch (error) {
      console.error("Failed to switch to Polygon:", error);
    }
  };

  const handleUsdtSwap = async () => {
    if (!usdtAmount || !recipientAddress) return;

    try {
      setIsLoading(true);
      const usdtAmountWei = parseUnits(usdtAmount, 6);
      const lyraOut = usdtAmountWei * (lyraPerUsdt || 0n);
      const minLyraOut = (lyraOut * 99n) / 100n; // 1% slippage

      await writeLyraOtcSeller({
        functionName: "govSwapUsdtAndSend",
        args: [recipientAddress, usdtAmountWei, minLyraOut],
      });

      setUsdtAmount("");
      setRecipientAddress("");
    } catch (error) {
      console.error("Error swapping USDT:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNativeSwap = async () => {
    if (!nativeAmount || !recipientAddress) return;

    try {
      setIsLoading(true);
      const nativeAmountWei = parseUnits(nativeAmount, 18);
      const usdtAmount = (nativeAmountWei * (priceUsdtPerNative || 0n)) / parseUnits("1", 18);
      const lyraOut = usdtAmount * (lyraPerUsdt || 0n);
      const minLyraOut = (lyraOut * 99n) / 100n; // 1% slippage

      await writeLyraOtcSeller({
        functionName: "govSwapNativeAndSend",
        args: [recipientAddress, minLyraOut],
        value: nativeAmountWei,
      });

      setNativeAmount("");
      setRecipientAddress("");
    } catch (error) {
      console.error("Error swapping native:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getQuote = () => {
    if (!usdtAmount && !nativeAmount) return "0";

    if (swapType === "usdt" && usdtAmount) {
      const usdtAmountWei = parseUnits(usdtAmount, 6);
      const lyraOut = usdtAmountWei * (lyraPerUsdt || 0n);
      return formatUnits(lyraOut, 18);
    } else if (swapType === "native" && nativeAmount) {
      const nativeAmountWei = parseUnits(nativeAmount, 18);
      const usdtAmount = (nativeAmountWei * (priceUsdtPerNative || 0n)) / parseUnits("1", 18);
      const lyraOut = usdtAmount * (lyraPerUsdt || 0n);
      return formatUnits(lyraOut, 18);
    }

    return "0";
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <RainbowKitCustomConnectButton />
          </div>
          <h1 className="text-2xl font-bold mb-4">Government Portal</h1>
          <p className="text-gray-600">Please connect your wallet to access the government portal.</p>
        </div>
      </div>
    );
  }

  if (!isPolygonNetwork) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <RainbowKitCustomConnectButton />
          </div>
          <h1 className="text-2xl font-bold mb-4">Wrong Network</h1>
          <p className="text-gray-600 mb-4">Please switch to Polygon network to access the government portal.</p>
          <button
            onClick={handleSwitchToPolygon}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Switch to Polygon
          </button>
        </div>
      </div>
    );
  }

  if (!isGovernment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <RainbowKitCustomConnectButton />
          </div>
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600">You are not authorized as a government user.</p>
          <p className="text-sm text-gray-500 mt-2">Contact the contract owner to set your address as government.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-end mb-4">
          <RainbowKitCustomConnectButton />
        </div>
        <h1 className="text-3xl font-bold mb-8 text-center">Government Portal</h1>

        {/* Network Status */}
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
          <p className="text-green-800 text-sm">✅ Connected to Polygon Network (Chain ID: {chainId})</p>
        </div>

        <div className="bg-base-100 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Swap & Send LYRA</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Recipient Address</label>
            <AddressInput
              value={recipientAddress}
              onChange={setRecipientAddress}
              placeholder="Enter recipient address"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Swap Type</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="usdt"
                  checked={swapType === "usdt"}
                  onChange={e => setSwapType(e.target.value as "usdt" | "native")}
                  className="mr-2"
                />
                USDT to LYRA
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="native"
                  checked={swapType === "native"}
                  onChange={e => setSwapType(e.target.value as "usdt" | "native")}
                  className="mr-2"
                />
                MATIC to LYRA
              </label>
            </div>
          </div>

          {swapType === "usdt" ? (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">USDT Amount</label>
              <EtherInput value={usdtAmount} onChange={setUsdtAmount} placeholder="Enter USDT amount" />
            </div>
          ) : (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">MATIC Amount</label>
              <EtherInput value={nativeAmount} onChange={setNativeAmount} placeholder="Enter MATIC amount" />
            </div>
          )}

          <div className="mb-6 p-4 bg-base-200 rounded">
            <p className="text-sm text-gray-600">Estimated LYRA Output:</p>
            <p className="text-lg font-semibold">{getQuote()} LYRA</p>
          </div>

          <button
            onClick={swapType === "usdt" ? handleUsdtSwap : handleNativeSwap}
            disabled={isLoading || (!usdtAmount && !nativeAmount) || !recipientAddress}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? "Processing..." : `Swap & Send LYRA`}
          </button>
        </div>

        <div className="bg-base-100 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Current Prices</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-blue-600">MATIC Price (USDT)</p>
              <p className="text-lg font-semibold">
                {priceUsdtPerNative ? formatUnits(priceUsdtPerNative, 6) : "Loading..."} USDT
              </p>
            </div>
            <div>
              <p className="text-sm text-blue-600">LYRA Price (USDT)</p>
              <p className="text-lg font-semibold">{lyraPerUsdt ? formatUnits(lyraPerUsdt, 12) : "Loading..."} USDT</p>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-base-100 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>
          <div className="space-y-3 text-sm">
            <p>
              <strong>Government Portal Features:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Swap USDT or MATIC to LYRA tokens</li>
              <li>Send LYRA directly to recipient addresses</li>
              <li>Automatic 0.1% MATIC fee sent to recipient for gas costs</li>
              <li>Real-time price calculations</li>
            </ul>

            <div className="mt-4 p-4 bg-base-200 rounded">
              <h3 className="font-semibold mb-2">How it works:</h3>
              <ol className="list-decimal list-inside space-y-1">
                <li>Enter the recipient&apos;s wallet address</li>
                <li>Choose swap type (USDT or MATIC)</li>
                <li>Enter the amount to swap</li>
                <li>Review the estimated LYRA output</li>
                <li>Click &quot;Swap & Send LYRA&quot; to execute</li>
              </ol>
            </div>

            <div className="mt-4 p-4 rounded">
              <h3 className="font-semibold mb-2">Important Notes:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Only government users can access this portal</li>
                <li>Recipients receive LYRA tokens + 0.1% MATIC fee</li>
                <li>Ensure you have sufficient USDT/MATIC balance</li>
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
  );
}
