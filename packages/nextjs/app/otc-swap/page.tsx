"use client";

import { useCallback, useEffect, useState } from "react";
import { OtcQuote, OtcService } from "../../services/otcService";
import { parseUnits } from "viem";
import { useAccount, useChainId, useWalletClient } from "wagmi";

// Contract addresses (Polygon Mainnet)
const OTC_SELLER_ADDRESS = "0xd1f520e7ff7947Ef821413c3767Fcc00a71b2fDE";
const USDT_ADDRESS = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";

// Token options
const tokenOptions = [
  {
    value: "usdt",
    label: "USDT",
    address: USDT_ADDRESS,
    symbol: "USDT",
    decimals: 6,
  },
  {
    value: "pol",
    label: "POL (Native)",
    address: "0x0000000000000000000000000000000000000000",
    symbol: "POL",
    decimals: 18,
  },
];

export default function OtcSwapPage() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const chainId = useChainId();

  const [selectedToken, setSelectedToken] = useState("usdt");
  const [amount, setAmount] = useState("1");
  const [recipient, setRecipient] = useState("");
  const [quote, setQuote] = useState<OtcQuote | null>(null);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [txHash, setTxHash] = useState<string>("");
  const [slippage, setSlippage] = useState(1); // 1% default

  // Only Polygon network is supported
  const isCorrectNetwork = chainId === 137;
  const fromToken = tokenOptions.find(t => t.value === selectedToken)!;

  const handleGetQuote = useCallback(async () => {
    if (!amount || Number(amount) <= 0) {
      setQuote(null);
      setError("");
      return;
    }

    setQuote(null);
    setError("");
    setIsLoading(true);

    try {
      const amountWei = parseUnits(amount, fromToken.decimals);
      let quote: OtcQuote;

      if (selectedToken === "usdt") {
        quote = await OtcService.getQuoteUsdt(amountWei);
      } else {
        quote = await OtcService.getQuoteNative(amountWei);
      }

      setQuote(quote);
    } catch (err: any) {
      setError(err.message || "Failed to get quote");
    } finally {
      setIsLoading(false);
    }
  }, [amount, selectedToken, fromToken.decimals]);

  // Auto-quote on input changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (amount && selectedToken && isCorrectNetwork) {
        handleGetQuote();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [amount, selectedToken, isCorrectNetwork, handleGetQuote]);

  const handleExecuteSwap = async () => {
    if (!address || !walletClient || !quote || !recipient) {
      setError("Please connect wallet, get a quote, and enter recipient address");
      return;
    }

    if (!isCorrectNetwork) {
      setError("Please switch to Polygon network first");
      return;
    }

    setIsExecuting(true);
    setError("");
    setTxHash("");

    try {
      const amountWei = parseUnits(amount, fromToken.decimals);
      const minLyraOut = (quote.lyraOut * BigInt(100 - slippage)) / 100n;

      if (selectedToken === "usdt") {
        // Check allowance first
        const allowance = await OtcService.checkAllowance(USDT_ADDRESS, address);
        if (allowance < amountWei) {
          // Approve USDT
          const approveData = {
            to: USDT_ADDRESS as `0x${string}`,
            data: `0x095ea7b3${address.slice(2).padStart(64, "0")}${amountWei.toString(16).padStart(64, "0")}` as `0x${string}`,
          };

          const approveHash = await walletClient.sendTransaction(approveData);
          console.log("Approval transaction:", approveHash);

          // Wait for approval
          await new Promise(resolve => setTimeout(resolve, 8000));
        }

        // Execute USDT swap
        const swapData = {
          to: OTC_SELLER_ADDRESS as `0x${string}`,
          data: `0x12345678${amountWei.toString(16).padStart(64, "0")}${recipient.slice(2).padStart(64, "0")}${minLyraOut.toString(16).padStart(64, "0")}` as `0x${string}`,
        };

        const txHash = await walletClient.sendTransaction(swapData);
        setTxHash(txHash);
      } else {
        // Execute native swap
        const swapData = {
          to: OTC_SELLER_ADDRESS as `0x${string}`,
          data: `0x87654321${recipient.slice(2).padStart(64, "0")}${minLyraOut.toString(16).padStart(64, "0")}` as `0x${string}`,
          value: amountWei,
        };

        const txHash = await walletClient.sendTransaction(swapData);
        setTxHash(txHash);
      }
    } catch (err: any) {
      setError(err.message || "Failed to execute swap");
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-1">OTC LYRA Swap</h1>
      <p className="text-gray-600 mb-6">
        Direct swap to LYRA tokens using OTC contract. Fixed 1:1 ratio (1 USDT = 1 LYRA). Includes 0.1% POL fee for
        recipient gas costs.
      </p>

      {/* Wallet Connection Status */}
      {!address ? (
        <div className="alert alert-warning mb-4">
          <span>🔗 Please connect your wallet to execute swaps</span>
        </div>
      ) : (
        <div className="alert alert-info mb-4">
          <span>✅ Wallet Connected: {address}</span>
        </div>
      )}

      {/* Network Status */}
      {address && (
        <div className={`alert ${isCorrectNetwork ? "alert-success" : "alert-warning"} mb-4`}>
          <span>
            {isCorrectNetwork ? (
              "✅ Connected to Polygon network"
            ) : (
              <div>
                <span>⚠️ Please switch to Polygon network</span>
              </div>
            )}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* From Token Selection */}
        <div>
          <label className="block mb-2 font-semibold">From Token</label>
          <select
            value={selectedToken}
            onChange={e => setSelectedToken(e.target.value)}
            className="select select-bordered w-full"
          >
            {tokenOptions.map(token => (
              <option key={token.value} value={token.value}>
                {token.label}
              </option>
            ))}
          </select>
        </div>

        {/* To Token (Fixed) */}
        <div>
          <label className="block mb-2 font-semibold">To Token</label>
          <div className="input input-bordered w-full bg-gray-100 flex items-center" style={{ pointerEvents: "none" }}>
            <span className="font-semibold text-blue-600">LYRA Token</span>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <label className="block mb-2 font-semibold">Amount ({fromToken.symbol})</label>
        <input
          type="number"
          value={amount}
          min="0"
          step="0.0001"
          onChange={e => setAmount(e.target.value)}
          className="input input-bordered w-full"
          placeholder="1"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-2 font-semibold">Recipient Address</label>
        <input
          type="text"
          value={recipient}
          onChange={e => setRecipient(e.target.value)}
          className="input input-bordered w-full"
          placeholder="0x..."
        />
        <p className="text-sm text-gray-500 mt-1">LYRA tokens will be sent directly to this address</p>
      </div>

      <div className="mb-4">
        <label className="block mb-2 font-semibold">Slippage (%)</label>
        <input
          type="number"
          value={slippage}
          min="0.1"
          max="10"
          step="0.1"
          onChange={e => setSlippage(Number(e.target.value))}
          className="input input-bordered w-full"
        />
      </div>

      <div className="flex gap-2 mb-4">
        <button className="btn btn-primary" onClick={handleGetQuote} disabled={isLoading}>
          {isLoading ? "Getting Quote..." : "Get Quote"}
        </button>

        {quote && address && isCorrectNetwork && recipient && (
          <button className="btn btn-success" onClick={handleExecuteSwap} disabled={isExecuting}>
            {isExecuting ? "Executing Swap..." : "Execute Swap"}
          </button>
        )}
      </div>

      {quote && (
        <div className="mt-4">
          <h2 className="font-bold mb-2">Quote Result:</h2>
          <div className="bg-base-200 p-4 rounded-lg">
            <div className="space-y-2">
              <p>
                <strong>From:</strong> {amount} {fromToken.symbol}
              </p>
              <p>
                <strong>To:</strong> {quote.lyraOutFormatted} LYRA
              </p>
              <p>
                <strong>Price Impact:</strong> {quote.priceImpact}% (Fixed price)
              </p>
              <p>
                <strong>Recipient:</strong> {recipient}
              </p>
              <p>
                <strong>POL Fee (0.1%):</strong> {quote.polFeeFormatted} POL
              </p>
              <p className="text-sm text-blue-600">💡 POL fee will be sent to recipient for gas fees on Polygon</p>
              <p>
                <strong>Min LYRA Out (with {slippage}% slippage):</strong>{" "}
                {((Number(quote.lyraOut) * (100 - slippage)) / 100 / 10 ** 6).toFixed(6)} LYRA
              </p>
            </div>
          </div>
        </div>
      )}

      {txHash && (
        <div className="alert alert-success mt-4">
          <span>✅ Swap Transaction Sent!</span>
          <p className="text-sm mt-1">Transaction Hash: {txHash}</p>
          <p className="text-sm mt-1">
            <a
              href={`https://polygonscan.com/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              View on Polygonscan
            </a>
          </p>
        </div>
      )}

      {error && (
        <div className="alert alert-error mt-4">
          <span>❌ {error}</span>
        </div>
      )}

      <details className="mt-4">
        <summary className="cursor-pointer text-sm text-gray-600">Debug Info</summary>
        <div className="bg-gray-100 p-4 rounded mt-2 text-xs">
          <p>
            <strong>Selected Token:</strong> {fromToken.label}
          </p>
          <p>
            <strong>Current Chain:</strong> Polygon (ID: {chainId})
          </p>
          <p>
            <strong>Amount (Wei):</strong> {amount ? parseUnits(amount, fromToken.decimals).toString() : "0"}
          </p>
          <p>
            <strong>Wallet Address:</strong> {address || "Not connected"}
          </p>
          <p>
            <strong>Recipient:</strong> {recipient || "Not set"}
          </p>
          <p>
            <strong>OTC Contract:</strong> {OTC_SELLER_ADDRESS}
          </p>
          {quote && <pre className="mt-2 overflow-auto">{JSON.stringify(quote, null, 2)}</pre>}
        </div>
      </details>

      <div className="mt-8 text-xs text-gray-500">
        <p>This uses a direct OTC contract for fixed-price LYRA swaps.</p>
        <p>Price: 1 USDT = 1 LYRA (fixed ratio)</p>
        <p>Native token price: 1 POL = 0.23 USDT = 0.23 LYRA</p>
        <p>Fee: 0.1% POL fee sent to recipient for gas costs</p>
      </div>
    </div>
  );
}
