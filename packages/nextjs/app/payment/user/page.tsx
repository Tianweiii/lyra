"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import type { NextPage } from "next";
import { parseUnits } from "viem";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { CameraScanner } from "~~/components/payment/CameraScanner";
import PaymentStatus from "~~/components/payment/PaymentStatus";
import { ProgressBar } from "~~/components/payment/ProgressBar";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth/useScaffoldReadContract";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth/useScaffoldWriteContract";

const CHAIN_ID_POLYGON = 137 as const;

const UserScanPage: NextPage = () => {
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [paymentRef, setPaymentRef] = useState<string>("");
  const [validationError, setValidationError] = useState("");
  const [merchantAddress, setMerchantAddress] = useState<string>("");
  // Check if connected to Polygon network (chain ID 137)
  const isPolygonNetwork = chainId === 137;

  const router = useRouter();
  const searchParams = useSearchParams();
  const steps = ["Scan QR", "Confirm & Pay", "Payment Status"];

  // Check merchant status for current merchant address (Polygon)
  const { data: isMerchant } = useScaffoldReadContract({
    contractName: "LyraOtcSeller",
    functionName: "isMerchant",
    args: [merchantAddress || "0x0000000000000000000000000000000000000000"],
    chainId: CHAIN_ID_POLYGON,
  });

  // Read token decimals once (Polygon)
  const { data: lyraDecimals } = useScaffoldReadContract({
    contractName: "LyraToken",
    functionName: "decimals",
    args: [],
    chainId: CHAIN_ID_POLYGON,
  });

  // Write to LyraToken (Polygon)
  const { writeContractAsync: writeLyraTokenAsync } = useScaffoldWriteContract({
    contractName: "LyraToken",
    chainId: CHAIN_ID_POLYGON,
  });

  // If page accessed by URL /payment/user?data=
  useEffect(() => {
    const urlData = searchParams.get("data");
    if (urlData) {
      handleScanSuccess(`${window.location.origin}/payment/user?data=${urlData}`);
    }
  }, [searchParams]);

  const handleScanSuccess = (qrData: string) => {
    try {
      let data;
      if (qrData.startsWith("http")) {
        const url = new URL(qrData);
        const encodedData = url.searchParams.get("data");
        if (!encodedData) throw new Error("Missing data parameter in QR code URL.");
        try {
          data = JSON.parse(atob(encodedData));
        } catch {
          try {
            data = JSON.parse(decodeURIComponent(encodedData));
          } catch {
            throw new Error("Invalid QR code data format.");
          }
        }
      } else {
        data = JSON.parse(qrData);
      }

      if (typeof data.amount !== "number" || isNaN(data.amount)) {
        setValidationError("Invalid QR code: Missing or invalid amount.");
        return;
      }
      if (!data.merchantAddress || typeof data.merchantAddress !== "string") {
        setValidationError("Invalid QR code: Missing merchant address.");
        return;
      }

      setValidationError("");
      setMerchantAddress(data.merchantAddress);
      setAmount(data.amount);
      setStep(2);
    } catch (error) {
      setValidationError(`Invalid QR code format: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleSwitchToPolygon = async () => {
    try {
      await switchChain({ chainId: 137 });
    } catch (error) {
      console.error("Failed to switch to Polygon:", error);
    }
  };

  const handlePay = async () => {
    if (!merchantAddress || amount <= 0) return;

    try {
      setValidationError("");
      const decimals = typeof lyraDecimals === "number" ? lyraDecimals : 18;
      const amountInBase = parseUnits(amount.toString(), decimals);
      const tx = await writeLyraTokenAsync({
        functionName: "transfer",
        args: [merchantAddress, amountInBase],
      });
      setStatus("success");
      setPaymentRef(typeof tx === "string" ? tx : "");
      setStep(3);
    } catch {
      setStatus("failed");
      setValidationError("Transfer failed. Please try again.");
      setStep(3);
    }
  };

  const fadeUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  } as const;

  return (
    <div className="p-10 text-white">
      <div className="relative flex items-center justify-between px-5">
        <motion.button
          onClick={() => router.push("/dashboard/125")}
          whileHover={{ x: -4 }}
          className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors border p-2 rounded-xl cursor-pointer"
        >
          <motion.svg
            className="w-4 h-4 md:w-5 md:h-5"
            initial={{ x: 0 }}
            animate={{ x: 0 }}
            whileHover={{ x: -4 }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </motion.svg>
        </motion.button>

        <div className="absolute left-0 right-0 mx-auto text-center w-fit">
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-4xl font-bold">Pay by QR</h1>
            <p className="text-gray-400 text-sm">Position your camera over the QR code</p>
          </motion.div>
        </div>
      </div>

      <div className="mt-10 flex flex-col items-center p-4 gap-y-6">
        <div className="w-full max-w-screen">
          <ProgressBar currentStep={step} steps={steps} />
        </div>

        <div className="w-full max-w-screen flex justify-center items-center p-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="scan"
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 100, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full"
              >
                <CameraScanner onScanSuccess={handleScanSuccess} balance={0} validationError={validationError} />
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="confirm"
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -100, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full"
              >
                <motion.div
                  {...fadeUp}
                  className="p-6 md:p-10 bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 w-full max-w-3xl mx-auto space-y-6 text-white"
                >
                  <div className="space-y-3">
                    <>
                      {!isPolygonNetwork && (
                        <div className="flex items-center justify-center min-h-screen">
                          <div className="text-center space-y-4">
                            <div className="flex justify-center">
                              <RainbowKitCustomConnectButton />
                            </div>
                            <h1 className="text-2xl font-bold mb-4">Wrong Network</h1>
                            <p className="text-gray-600 mb-4">
                              Please switch to Polygon network to access the government portal.
                            </p>
                            <button
                              onClick={handleSwitchToPolygon}
                              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            >
                              Switch to Polygon
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                    <h2 className="text-lg md:text-xl font-bold text-white/80">Confirm Payment</h2>
                    <div className="flex justify-between items-center p-4 rounded-xl bg-black/10 border border-gray-500/40 text-sm md:text-base">
                      <span className="text-gray-400">Merchant</span>
                      <span className="text-gray-200">
                        {merchantAddress.slice(0, 8)}****{merchantAddress.slice(-4)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 rounded-xl bg-black/10 border border-gray-500/40 text-sm md:text-base">
                      <span className="text-gray-400">Amount</span>
                      <span className="text-gray-200">{amount} LYRA</span>
                    </div>
                    {isMerchant === false && (
                      <span className="text-xs text-red-500">
                        Warning: The scanned address is not a registered merchant.
                      </span>
                    )}
                    {validationError && <span className="text-xs text-red-500">{validationError}</span>}
                  </div>
                  <div className="flex gap-3">
                    <button className="flex-1 py-3 rounded-xl bg-gray-600 hover:bg-gray-700" onClick={() => setStep(1)}>
                      Back
                    </button>
                    <button
                      className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600"
                      onClick={handlePay}
                    >
                      Pay
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="status"
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -100, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full"
              >
                <PaymentStatus
                  status={status}
                  amount={amount}
                  paymentRef={paymentRef}
                  onTry={() => setStep(1)}
                  role={"user"}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default UserScanPage;
