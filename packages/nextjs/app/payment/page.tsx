"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { formatUnits, parseUnits } from "viem";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth/Address/Address";
import { EtherInput } from "~~/components/scaffold-eth/Input/EtherInput";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth/useScaffoldReadContract";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth/useScaffoldWriteContract";

export default function PaymentPage() {
  const { address } = useAccount();
  const searchParams = useSearchParams();

  const [lyraAmount, setLyraAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [merchantAddress, setMerchantAddress] = useState("");

  // Get URL parameters
  useEffect(() => {
    const merchant = searchParams.get("merchant");
    const amount = searchParams.get("amount");

    if (merchant) {
      setMerchantAddress(merchant);
    }
    if (amount) {
      setLyraAmount(amount);
    }
  }, [searchParams]);

  // Read contract data
  const { data: lyraBalance } = useScaffoldReadContract({
    contractName: "LyraToken",
    functionName: "balanceOf",
    args: [address],
  });

  const { data: isMerchant } = useScaffoldReadContract({
    contractName: "LyraToken",
    functionName: "isMerchant",
    args: [merchantAddress],
  });

  // Write contract functions
  const { writeContractAsync: writeLyraToken } = useScaffoldWriteContract("LyraToken");

  const handlePayment = async () => {
    if (!lyraAmount || !merchantAddress) return;

    try {
      setIsLoading(true);
      const lyraAmountWei = parseUnits(lyraAmount, 18);

      await writeLyraToken({
        functionName: "transfer",
        args: [merchantAddress, lyraAmountWei],
      });

      setLyraAmount("");
      alert("Payment successful!");
    } catch (error) {
      console.error("Error making payment:", error);
      alert("Payment failed. Please check your balance and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isMerchantValid = isMerchant === true;

  if (!address) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Payment Portal</h1>
          <p className="text-gray-600">Please connect your wallet to make a payment.</p>
        </div>
      </div>
    );
  }

  if (!merchantAddress) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Invalid Payment Link</h1>
          <p className="text-gray-600">No merchant address provided in the payment link.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Payment Portal</h1>

        <div className=" rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Pay with LYRA</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Merchant Address:</label>
            <Address address={merchantAddress} />
            {!isMerchantValid && (
              <p className="text-red-600 text-sm mt-1">Warning: This address is not registered as a merchant.</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Your LYRA Balance:</label>
            <p className="text-lg font-semibold">{lyraBalance ? formatUnits(lyraBalance, 18) : "Loading..."} LYRA</p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">LYRA Amount to Send:</label>
            <EtherInput value={lyraAmount} onChange={setLyraAmount} placeholder="Enter LYRA amount" />
          </div>

          {lyraAmount && lyraBalance && (
            <div className="mb-6 p-4  rounded">
              <p className="text-sm text-gray-600">Payment Summary:</p>
              <p className="text-lg font-semibold">{lyraAmount} LYRA</p>
              {parseFloat(lyraAmount) > parseFloat(formatUnits(lyraBalance, 18)) && (
                <p className="text-red-600 text-sm mt-1">Insufficient balance!</p>
              )}
            </div>
          )}

          <button
            onClick={handlePayment}
            disabled={
              isLoading ||
              !lyraAmount ||
              !isMerchantValid ||
              (lyraBalance && parseFloat(lyraAmount) > parseFloat(formatUnits(lyraBalance, 18)))
            }
            className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? "Processing..." : "Send Payment"}
          </button>
        </div>

        <div className=" rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• LYRA tokens can only be sent to registered merchants</p>
            <p>• Transactions are tracked and transparent</p>
            <p>• No fees for LYRA transfers between residents and merchants</p>
            <p>• Make sure you have sufficient LYRA balance before making payment</p>
          </div>
        </div>
      </div>
    </div>
  );
}
