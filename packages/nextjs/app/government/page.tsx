"use client";

import { useState } from "react";
import { formatUnits, parseUnits } from "viem";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { SecurityCheck } from "~~/components/SecurityCheck";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { AddressInput } from "~~/components/scaffold-eth/Input/AddressInput";
import { EtherInput } from "~~/components/scaffold-eth/Input/EtherInput";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth/useScaffoldReadContract";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth/useScaffoldWriteContract";

export default function GovernmentPage() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const [recipientAddress, setRecipientAddress] = useState("");
  const [usdtAmount, setUsdtAmount] = useState("");
  const [nativeAmount, setNativeAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [swapType, setSwapType] = useState<"usdt" | "native">("usdt");

  // Security check states
  const [isAddressSuspicious, setIsAddressSuspicious] = useState(false);
  const [securityRisks, setSecurityRisks] = useState<Array<{ key: string; label: string; value: string }>>([]);
  const [showSecurityWarning, setShowSecurityWarning] = useState(false);

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

  const handleSecurityUpdate = (isSuspicious: boolean, risks: Array<{ key: string; label: string; value: string }>) => {
    setIsAddressSuspicious(isSuspicious);
    setSecurityRisks(risks);
    if (isSuspicious) {
      setShowSecurityWarning(true);
    }
  };

  const handleSwitchToPolygon = async () => {
    try {
      await switchChain({ chainId: 137 });
    } catch (error) {
      console.error("Failed to switch to Polygon:", error);
    }
  };

  const handleUsdtSwap = async () => {
    if (!recipientAddress || !usdtAmount) {
      alert("请填写收件人地址和USDT金额");
      return;
    }

    // Security warning for suspicious addresses
    if (isAddressSuspicious && showSecurityWarning) {
      const confirmed = window.confirm(
        `⚠️ 安全警告！\n\n检测到收件人地址存在以下安全风险：\n${securityRisks.map(r => `• ${r.label}`).join("\n")}\n\n您确定要继续交易吗？`,
      );
      if (!confirmed) {
        return;
      }
      setShowSecurityWarning(false); // Don't show warning again for this transaction
    }

    try {
      setIsLoading(true);

      const usdtAmountWei = parseUnits(usdtAmount, 6); // USDT has 6 decimals
      const minLyraOut = (lyraPerUsdt * usdtAmountWei) / BigInt(1e6); // Calculate expected LYRA output

      await writeLyraOtcSeller({
        functionName: "govSwapUsdtAndSend",
        args: [recipientAddress, usdtAmountWei, minLyraOut],
      });

      alert("USDT换LYRA交易成功！");
      setUsdtAmount("");
      setRecipientAddress("");
    } catch (error) {
      console.error("USDT swap error:", error);
      alert("交易失败，请检查余额和网络连接");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNativeSwap = async () => {
    if (!recipientAddress || !nativeAmount) {
      alert("请填写收件人地址和MATIC金额");
      return;
    }

    // Security warning for suspicious addresses
    if (isAddressSuspicious && showSecurityWarning) {
      const confirmed = window.confirm(
        `⚠️ 安全警告！\n\n检测到收件人地址存在以下安全风险：\n${securityRisks.map(r => `• ${r.label}`).join("\n")}\n\n您确定要继续交易吗？`,
      );
      if (!confirmed) {
        return;
      }
      setShowSecurityWarning(false); // Don't show warning again for this transaction
    }

    try {
      setIsLoading(true);

      const nativeAmountWei = parseUnits(nativeAmount, 18);
      const expectedUsdtValue = (nativeAmountWei * priceUsdtPerNative) / BigInt(1e18);
      const minLyraOut = (lyraPerUsdt * expectedUsdtValue) / BigInt(1e6);

      await writeLyraOtcSeller({
        functionName: "govSwapNativeAndSend",
        args: [recipientAddress, minLyraOut],
        value: nativeAmountWei,
      });

      alert("MATIC换LYRA交易成功！");
      setNativeAmount("");
      setRecipientAddress("");
    } catch (error) {
      console.error("Native swap error:", error);
      alert("交易失败，请检查余额和网络连接");
    } finally {
      setIsLoading(false);
    }
  };

  if (!address) {
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

          {/* Security Check */}
          {recipientAddress && (
            <div className="mb-4">
              <SecurityCheck address={recipientAddress} chainId="137" onSecurityUpdate={handleSecurityUpdate} />
            </div>
          )}

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
              {usdtAmount && lyraPerUsdt && (
                <p className="text-sm text-gray-600 mt-1">
                  Expected LYRA output: ~
                  {formatUnits(((usdtAmount ? parseUnits(usdtAmount, 6) : BigInt(0)) * lyraPerUsdt) / BigInt(1e6), 18)}{" "}
                  LYRA
                </p>
              )}
            </div>
          ) : (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">MATIC Amount</label>
              <EtherInput value={nativeAmount} onChange={setNativeAmount} placeholder="Enter MATIC amount" />
              {nativeAmount && lyraPerUsdt && priceUsdtPerNative && (
                <p className="text-sm text-gray-600 mt-1">
                  Expected LYRA output: ~
                  {formatUnits(
                    (parseUnits(nativeAmount, 18) * priceUsdtPerNative * lyraPerUsdt) / BigInt(1e18) / BigInt(1e6),
                    18,
                  )}{" "}
                  LYRA
                </p>
              )}
            </div>
          )}

          <button
            onClick={swapType === "usdt" ? handleUsdtSwap : handleNativeSwap}
            disabled={isLoading || !recipientAddress || (!usdtAmount && !nativeAmount)}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? "Processing..." : `Swap ${swapType.toUpperCase()} to LYRA & Send`}
          </button>
        </div>

        {/* Exchange Rates */}
        <div className="bg-base-100 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Current Exchange Rates</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">USDT per MATIC</p>
              <p className="text-lg font-medium">
                {priceUsdtPerNative ? formatUnits(priceUsdtPerNative, 6) : "Loading..."} USDT
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">LYRA per USDT</p>
              <p className="text-lg font-medium">{lyraPerUsdt ? formatUnits(lyraPerUsdt, 12) : "Loading..."} LYRA</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
