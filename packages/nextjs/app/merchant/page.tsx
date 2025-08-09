"use client";

import { useState } from "react";
import { formatUnits, parseUnits } from "viem";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth/Address/Address";
import { EtherInput } from "~~/components/scaffold-eth/Input/EtherInput";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth/useScaffoldReadContract";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth/useScaffoldWriteContract";

export default function MerchantPage() {
  const { address } = useAccount();

  const [lyraAmount, setLyraAmount] = useState("");
  const [swapType, setSwapType] = useState<"usdt" | "native">("usdt");
  const [isLoading, setIsLoading] = useState(false);
  const [qrCodeData, setQrCodeData] = useState("");

  // Read contract data
  const { data: priceUsdtPerNative } = useScaffoldReadContract({
    contractName: "LyraOtcSeller",
    functionName: "priceUsdtPerNative",
  });

  const { data: lyraPerUsdt } = useScaffoldReadContract({
    contractName: "LyraOtcSeller",
    functionName: "lyraPerUsdt",
  });

  const { data: isMerchant } = useScaffoldReadContract({
    contractName: "LyraOtcSeller",
    functionName: "isMerchant",
    args: [address],
  });

  const { data: lyraBalance } = useScaffoldReadContract({
    contractName: "LyraToken",
    functionName: "balanceOf",
    args: [address],
  });

  // Write contract functions
  const { writeContractAsync: writeLyraOtcSeller } = useScaffoldWriteContract("LyraOtcSeller");

  const handleSwapToUsdt = async () => {
    if (!lyraAmount) return;

    try {
      setIsLoading(true);
      const lyraAmountWei = parseUnits(lyraAmount, 18);
      const usdtOut = lyraAmountWei / (lyraPerUsdt || 1n);
      const minUsdtOut = (usdtOut * 99n) / 100n; // 1% slippage

      await writeLyraOtcSeller({
        functionName: "merchantSwapLyraToUsdt",
        args: [lyraAmountWei, minUsdtOut],
      });

      setLyraAmount("");
    } catch (error) {
      console.error("Error swapping LYRA to USDT:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwapToNative = async () => {
    if (!lyraAmount) return;

    try {
      setIsLoading(true);
      const lyraAmountWei = parseUnits(lyraAmount, 18);
      const usdtOut = lyraAmountWei / (lyraPerUsdt || 1n);
      const nativeOut = (usdtOut * parseUnits("1", 18)) / (priceUsdtPerNative || 1n);
      const minNativeOut = (nativeOut * 99n) / 100n; // 1% slippage

      await writeLyraOtcSeller({
        functionName: "merchantSwapLyraToNative",
        args: [lyraAmountWei, minNativeOut],
      });

      setLyraAmount("");
    } catch (error) {
      console.error("Error swapping LYRA to native:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateQRCode = () => {
    if (!address) return;

    const baseUrl = window.location.origin;
    const qrData = `${baseUrl}/payment?merchant=${address}&amount=`;
    setQrCodeData(qrData);
  };

  const getQuote = () => {
    if (!lyraAmount) return { usdt: "0", native: "0" };

    const lyraAmountWei = parseUnits(lyraAmount, 18);
    const usdtOut = lyraAmountWei / (lyraPerUsdt || 1n);
    const nativeOut = (usdtOut * parseUnits("1", 18)) / (priceUsdtPerNative || 1n);

    return {
      usdt: formatUnits(usdtOut, 6),
      native: formatUnits(nativeOut, 18),
    };
  };

  if (!address) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Merchant Portal</h1>
          <p className="text-gray-600">Please connect your wallet to access the merchant portal.</p>
        </div>
      </div>
    );
  }

  if (!isMerchant) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600">You are not authorized as a merchant.</p>
        </div>
      </div>
    );
  }

  const quote = getQuote();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Merchant Portal</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* QR Code Generation */}
          <div className="rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Generate Payment QR Code</h2>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Your Merchant Address:</p>
              <Address address={address} />
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">QR Code Base URL:</p>
              <div className="p-3  rounded border">
                <code className="text-sm break-all">
                  {qrCodeData || "Click 'Generate QR Code' to create payment link"}
                </code>
              </div>
            </div>

            <button
              onClick={generateQRCode}
              className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
            >
              Generate QR Code
            </button>

            <div className="mt-4 p-4  rounded">
              <p className="text-sm text-blue-800">
                <strong>Instructions:</strong> Share this QR code with residents. When scanned, it will redirect them to
                a payment page where they can send LYRA to your address.
              </p>
            </div>
          </div>

          {/* LYRA Balance & Swap */}
          <div className="rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Swap LYRA</h2>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Your LYRA Balance:</p>
              <p className="text-lg font-semibold">{lyraBalance ? formatUnits(lyraBalance, 18) : "Loading..."} LYRA</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">LYRA Amount to Swap</label>
              <EtherInput value={lyraAmount} onChange={setLyraAmount} placeholder="Enter LYRA amount" />
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
                  LYRA to USDT
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="native"
                    checked={swapType === "native"}
                    onChange={e => setSwapType(e.target.value as "usdt" | "native")}
                    className="mr-2"
                  />
                  LYRA to MATIC
                </label>
              </div>
            </div>

            <div className="mb-6 p-4 rounded">
              <p className="text-sm text-gray-600">Estimated Output:</p>
              <p className="text-lg font-semibold">
                {swapType === "usdt" ? `${quote.usdt} USDT` : `${quote.native} MATIC`}
              </p>
            </div>

            <button
              onClick={swapType === "usdt" ? handleSwapToUsdt : handleSwapToNative}
              disabled={isLoading || !lyraAmount}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? "Processing..." : `Swap to ${swapType === "usdt" ? "USDT" : "MATIC"}`}
            </button>
          </div>
        </div>

        {/* Current Prices */}
        <div className="mt-6  rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Current Prices</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">MATIC Price (USDT)</p>
              <p className="text-lg font-semibold">
                {priceUsdtPerNative ? formatUnits(priceUsdtPerNative, 6) : "Loading..."} USDT
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">LYRA Price (USDT)</p>
              <p className="text-lg font-semibold">{lyraPerUsdt ? formatUnits(lyraPerUsdt, 12) : "Loading..."} USDT</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
