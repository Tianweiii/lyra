"use client";

import { formatUnits } from "viem";
import { Address } from "~~/components/scaffold-eth/Address/Address";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth/useScaffoldReadContract";

export default function OtcStatusPage() {
  // Read OTC contract balances
  const { data: otcLyraBalance } = useScaffoldReadContract({
    contractName: "LyraOtcSeller",
    functionName: "getBalance",
    args: ["0xc11bd7B043736423Dbc2d70AE5A0f642f9959257"], // LYRA token address
  });

  const { data: otcUsdtBalance } = useScaffoldReadContract({
    contractName: "LyraOtcSeller",
    functionName: "getBalance",
    args: ["0xc2132D05D31c914a87C6611C10748AEb04B58e8F"], // USDT token address
  });

  const { data: otcNativeBalance } = useScaffoldReadContract({
    contractName: "LyraOtcSeller",
    functionName: "getBalance",
    args: ["0x0000000000000000000000000000000000000000"], // Native token (MATIC)
  });

  // Read contract info
  const { data: lyraAddress } = useScaffoldReadContract({
    contractName: "LyraOtcSeller",
    functionName: "LYRA",
  });

  const { data: usdtAddress } = useScaffoldReadContract({
    contractName: "LyraOtcSeller",
    functionName: "USDT",
  });

  const { data: owner } = useScaffoldReadContract({
    contractName: "LyraOtcSeller",
    functionName: "owner",
  });

  const { data: priceUsdtPerNative } = useScaffoldReadContract({
    contractName: "LyraOtcSeller",
    functionName: "priceUsdtPerNative",
  });

  const { data: lyraPerUsdt } = useScaffoldReadContract({
    contractName: "LyraOtcSeller",
    functionName: "lyraPerUsdt",
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">OTC Contract Status</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contract Information */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Contract Information</h2>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Owner:</p>
                <Address address={owner} />
              </div>

              <div>
                <p className="text-sm text-gray-600">LYRA Token:</p>
                <Address address={lyraAddress} />
              </div>

              <div>
                <p className="text-sm text-gray-600">USDT Token:</p>
                <Address address={usdtAddress} />
              </div>
            </div>
          </div>

          {/* Balances */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">OTC Balances</h2>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">LYRA Balance:</p>
                <p className="text-lg font-semibold">
                  {otcLyraBalance ? formatUnits(otcLyraBalance, 18) : "Loading..."} LYRA
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">USDT Balance:</p>
                <p className="text-lg font-semibold">
                  {otcUsdtBalance ? formatUnits(otcUsdtBalance, 6) : "Loading..."} USDT
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">MATIC Balance:</p>
                <p className="text-lg font-semibold">
                  {otcNativeBalance ? formatUnits(otcNativeBalance, 18) : "Loading..."} MATIC
                </p>
              </div>
            </div>
          </div>

          {/* Prices */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Current Prices</h2>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">MATIC Price (USDT):</p>
                <p className="text-lg font-semibold">
                  {priceUsdtPerNative ? formatUnits(priceUsdtPerNative, 6) : "Loading..."} USDT
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">LYRA Price (USDT):</p>
                <p className="text-lg font-semibold">
                  {lyraPerUsdt ? formatUnits(lyraPerUsdt, 12) : "Loading..."} USDT
                </p>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Status</h2>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">LYRA Available:</p>
                <p
                  className={`text-lg font-semibold ${otcLyraBalance && otcLyraBalance > 0n ? "text-green-600" : "text-red-600"}`}
                >
                  {otcLyraBalance && otcLyraBalance > 0n ? "✅ Available" : "❌ Insufficient"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">USDT Available:</p>
                <p
                  className={`text-lg font-semibold ${otcUsdtBalance && otcUsdtBalance > 0n ? "text-green-600" : "text-red-600"}`}
                >
                  {otcUsdtBalance && otcUsdtBalance > 0n ? "✅ Available" : "❌ Insufficient"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">MATIC Available:</p>
                <p
                  className={`text-lg font-semibold ${otcNativeBalance && otcNativeBalance > 0n ? "text-green-600" : "text-red-600"}`}
                >
                  {otcNativeBalance && otcNativeBalance > 0n ? "✅ Available" : "❌ Insufficient"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">How to Fix &quot;Insufficient LYRA&quot; Error</h2>

          <div className="space-y-3 text-sm">
            <p>
              <strong>Problem:</strong> The OTC contract doesn&apos;t have enough LYRA tokens to execute swaps.
            </p>

            <p>
              <strong>Solution:</strong> The contract owner needs to fund the OTC contract with LYRA tokens.
            </p>

            <div className="bg-white rounded p-4 mt-4">
              <h3 className="font-semibold mb-2">Steps to Fix:</h3>
              <ol className="list-decimal list-inside space-y-1">
                <li>Connect the owner wallet (the address that deployed the contract)</li>
                <li>
                  Go to the{" "}
                  <a href="/government" className="text-blue-600 underline">
                    Government Portal
                  </a>
                </li>
                <li>
                  Transfer LYRA tokens to the OTC contract address:{" "}
                  <code className="bg-gray-100 px-1 rounded">0xB919D234f9081D8c0F20ee4219C4605BA883dc32</code>
                </li>
                <li>
                  Alternatively, the owner can use the <code>withdraw</code> function to add funds
                </li>
              </ol>
            </div>

            <div className="bg-yellow-50 rounded p-4 mt-4">
              <h3 className="font-semibold mb-2">Alternative Solutions:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  Use the{" "}
                  <a href="/external-contracts" className="text-blue-600 underline">
                    External Contracts Demo
                  </a>{" "}
                  to transfer LYRA directly
                </li>
                <li>Contact the contract owner to fund the OTC contract</li>
                <li>Wait for the contract to be funded by the owner</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
