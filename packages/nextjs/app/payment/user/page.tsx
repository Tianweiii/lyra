"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { CameraScanner } from "~~/components/payment/CameraScanner";
import PaymentStatus from "~~/components/payment/PaymentStatus";
import { ProgressBar } from "~~/components/payment/ProgressBar";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth/useScaffoldReadContract";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth/useScaffoldWriteContract";

const UserScanPage: NextPage = () => {
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [paymentRef, setPaymentRef] = useState<string>("");
  const [validationError, setValidationError] = useState("");
  const [merchantAddress, setMerchantAddress] = useState<string>("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const steps = ["Scan QR", "Payment Status"];
  // TODO: Wallet balance will be props
  const walletBalance = 50.23;

  // React hooks must be at the top level
  const { data: isMerchant } = useScaffoldReadContract({
    contractName: "LyraOtcSeller",
    functionName: "isMerchant",
    args: [merchantAddress],
  });

  const { writeContractAsync: writeLyraOtcSeller } = useScaffoldWriteContract("LyraOtcSeller");

  // Check for URL data parameter on page load
  useEffect(() => {
    const urlData = searchParams.get("data");
    if (urlData) {
      console.log("URL data found:", urlData);
      handleScanSuccess(`${window.location.origin}/payment/user?data=${urlData}`);
    }
  }, [searchParams]);

  const handleScanSuccess = (qrData: string) => {
    console.log("Scanned QR Data:", qrData);

    try {
      let data;

      if (qrData.startsWith("http")) {
        const url = new URL(qrData);
        const encodedData = url.searchParams.get("data");
        console.log("Encoded data from URL:", encodedData);

        if (!encodedData) {
          throw new Error("Missing data parameter in QR code URL.");
        }

        try {
          // Try Base64 decoding first
          const jsonStr = atob(encodedData);
          console.log("Decoded JSON string:", jsonStr);
          data = JSON.parse(jsonStr);
          console.log("Parsed data:", data);
        } catch (e) {
          console.error("Base64 decode failed:", e);
          // If Base64 fails, fall back to URI decoding
          try {
            const decodedStr = decodeURIComponent(encodedData);
            console.log("URI decoded string:", decodedStr);
            data = JSON.parse(decodedStr);
            console.log("Parsed data from URI decode:", data);
          } catch (err) {
            console.error("URI decode also failed:", err);
            throw new Error("Invalid QR code data format.");
          }
        }
      } else {
        // Direct JSON string
        console.log("Direct JSON parsing:", qrData);
        data = JSON.parse(qrData);
      }

      // Validate required fields
      if (typeof data.amount !== "number" || isNaN(data.amount)) {
        setValidationError("Invalid QR code: Missing or invalid amount.");
        return;
      }

      if (!data.merchantAddress || typeof data.merchantAddress !== "string") {
        setValidationError("Invalid QR code: Missing merchant address.");
        return;
      }

      if (data.amount > walletBalance) {
        setValidationError(`Insufficient balance. Required: RM ${data.amount.toFixed(2)}`);
        return;
      }

      setValidationError("");
      setMerchantAddress(data.merchantAddress);
      setStatus("success");
      setAmount(data.amount);
      setPaymentRef(data.ref || "0xPAYREF123456");
      setStep(2);

      // Trigger Blockchain Transfer
      HandleTransfer(data);
    } catch (error) {
      console.error("QR code parsing error:", error);
      setValidationError(`Invalid QR code format: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const HandleTransfer = async (data: { amount: number; merchantAddress: string }) => {
    console.log("Starting transfer:", data);

    // Merchant validation will be handled by the useScaffoldReadContract hook
    if (!isMerchant) {
      setValidationError("Merchant is not registered.");
      return;
    }

    try {
      // Transfer LYRA
      await writeLyraOtcSeller({
        functionName: "transfer",
        args: [data.merchantAddress, amount],
      });
    } catch (error) {
      console.error("Transfer failed:", error);
      setValidationError("Transfer failed. Please try again.");
    }
  };

  return (
    <div className="p-10 text-white">
      <div className="relative flex items-center justify-between px-5">
        {/* Back Button */}
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
          {/* Back */}
        </motion.button>

        {/* Title and Description */}
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
                <CameraScanner
                  onScanSuccess={handleScanSuccess}
                  balance={walletBalance}
                  validationError={validationError}
                />
              </motion.div>
            )}

            {step === 2 && (
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
