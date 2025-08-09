"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

  const router = useRouter();
  const { address, isConnected } = useAccount();
  const steps = ["Scan QR", "Payment Status"];
  // TODO: Wallet balance will be props
  const walletBalance = 50.23;

  const handleScanSuccess = (qrData: string) => {
    // TODO: FETCH JSON

    // qrData = `{"amount": 25, "merchantAddress": "0xPAYREF123456"}`;

    try {
      let data;

      if (qrData.startsWith("http")) {
        const url = new URL(qrData);
        const encodedData = url.searchParams.get("data");
        if (!encodedData) {
          throw new Error("Missing data in QR code.");
        }

        try {
          // Try Base64 first
          const jsonStr = atob(encodedData);
          data = JSON.parse(jsonStr);
        } catch (e) {
          // If Base64 fails, fall back to URI decoding
          try {
            data = JSON.parse(decodeURIComponent(encodedData));
          } catch (err) {
            throw new Error("Invalid QR code data format.");
          }
        }
      } else {
        data = JSON.parse(qrData);
      }
      // let data;

      // if (qrData.startsWith("http")) {
      //   const url = new URL(qrData);
      //   const encodedData = url.searchParams.get("data");
      //   if (!encodedData) {
      //     console.error("ERRORRRRR");
      //   }
      //   data = JSON.parse(decodeURIComponent(encodedData!));
      // } else {
      //   data = JSON.parse(qrData);
      // }

      if (typeof data.amount !== "number") {
        setValidationError("Invalid QR code: Missing or invalid amount.");
        return;
      }

      if (data.amount > walletBalance) {
        setValidationError(`Insufficient balance. Required: RM ${data.amount.toFixed(2)}`);
        return;
      }

      setValidationError("");
      setStatus("success");
      setAmount(data.amount);
      setPaymentRef(data.ref || "0xPAYREF123456");
      setStep(2);

      // Trigger Blockchain Transfer;
      HandleTransfer(data);
    } catch {
      setValidationError("Invalid QR code format.");
    }

    // setStatus(isValid ? "success" : "failed");
    // setAmount(amountExtracted);
    // setPaymentRef(ref);
    // setStep(2);
  };

  const HandleTransfer = async (data: { amount: number; merchantAddress: string }) => {
    // Check merchant
    const { data: isMerchant } = useScaffoldReadContract({
      contractName: "LyraOtcSeller",
      functionName: "isMerchant",
      args: [data.merchantAddress],
    });

    if (!isMerchant) {
      setValidationError("Merchant is not registered.");
      return;
    }

    // Transfer LYRA
    const { writeContractAsync: writeLyraOtcSeller } = useScaffoldWriteContract("LyraOtcSeller");
    await writeLyraOtcSeller({
      functionName: "transfer",
      args: [data.merchantAddress, amount],
    });
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
