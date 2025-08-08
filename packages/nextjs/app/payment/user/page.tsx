"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import type { NextPage } from "next";
import { CameraScanner } from "~~/components/payment/CameraScanner";
import PaymentStatus from "~~/components/payment/PaymentStatus";
import { ProgressBar } from "~~/components/payment/ProgressBar";

const UserScanPage: NextPage = () => {
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [paymentRef, setPaymentRef] = useState<string>("");

  const router = useRouter();
  const steps = ["Scan QR", "Payment Status"];

  const handleScanSuccess = (qrData: string) => {
    // TODO: Simulate verifying QR content
    const isValid = qrData.includes("payment"); // TODO: real validation
    console.log(qrData);
    console.log(isValid);
    const amountExtracted = 25; // Extract or calculate from QR
    const ref = "0xPAYREF123456";

    setStatus(isValid ? "success" : "failed");
    setAmount(amountExtracted);
    setPaymentRef(ref);
    setStep(2);
  };

  return (
    <div className="mt-10 text-white">
      <div className="relative flex items-center justify-between px-5">
        {/* Back Button (left-aligned) */}
        <motion.button
          onClick={() => router.push("/dashboard/123")}
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

        {/* Title and Description (centered) */}
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
                <CameraScanner onScanSuccess={handleScanSuccess} />
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
                <PaymentStatus status={status} amount={amount} paymentRef={paymentRef} onTry={() => setStep(1)} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default UserScanPage;
