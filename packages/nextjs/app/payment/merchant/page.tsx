"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
// import { useRouter } from "next/navigation";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import PaymentStatus from "~~/components/payment/PaymentStatus";
import { ProgressBar } from "~~/components/payment/ProgressBar";
import { PromptPayment } from "~~/components/payment/PromptPayment";
import ShowQRCode from "~~/components/payment/ShowQRCode";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth/RainbowKitCustomConnectButton";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

const MerchantPaymentFlow: NextPage = () => {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState<number>(0);
  const [paymentRef, setPaymentRef] = useState<string>("");
  const [status, setStatus] = useState("");
  const { address } = useAccount();
  const steps = ["Enter Amount", "Scan QR", "Payment Status"];

  const { data: isMerchant } = useScaffoldReadContract({
    contractName: "LyraOtcSeller",
    functionName: "isMerchant",
    args: [address],
  });

  const handleNext = (value: number) => {
    setAmount(value);
    setStep(2);
  };

  const handlePaymentComplete = (s: string) => {
    setStatus(s);
    setPaymentRef("0xA1B2C3D4E5aaaaa"); // TODO: Replace with the correct payment ref
    setStep(3);
  };

  return (
    <>
      <div className="p-10 text-white">
        <h1 className="text-4xl font-bold ml-5">Payment Screen</h1>
        <RainbowKitCustomConnectButton />

        {/* Progress Bar */}
        <div className="mt-10 flex flex-col items-center p-4 gap-y-6">
          <div className="w-full max-w-screen">
            <ProgressBar currentStep={step} steps={steps} />
          </div>

          {/* Prompt payment page */}
          <div className="w-full max-w-screen flex justify-center items-center p-6">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="prompt"
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 100, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="w-full"
                >
                  <PromptPayment walletAddress={address!} onNext={handleNext} />
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="qr"
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -100, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="w-full"
                >
                  <ShowQRCode
                    amount={amount}
                    walletAddress={address!}
                    onPaid={handlePaymentComplete}
                    onBack={() => setStep(1)}
                  />
                </motion.div>
              )}

              {/* {step === 3 && (
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
                    role={"merchant"}
                  />
                </motion.div>
              )} */}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
};

export default MerchantPaymentFlow;
