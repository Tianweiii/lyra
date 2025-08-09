"use client";

import { useState } from "react";
import React from "react";
import { useWeb3Auth, useWeb3AuthUser } from "@web3auth/modal/react";
import { AnimatePresence, motion } from "framer-motion";
import type { NextPage } from "next";
import PaymentStatus from "~~/components/payment/PaymentStatus";
import { ProgressBar } from "~~/components/payment/ProgressBar";
import { PromptPayment } from "~~/components/payment/PromptPayment";
import ShowQRCode from "~~/components/payment/ShowQRCode";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth/RainbowKitCustomConnectButton";

const MerchantPaymentFlow: NextPage = () => {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState<number>(0);
  const [paymentRef, setPaymentRef] = useState<string>("");
  const [status, setStatus] = useState("");
  const [web3AuthAddress, setWeb3AuthAddress] = useState<string | null>(null);

  const { isConnected: web3AuthConnected } = useWeb3Auth();
  const { userInfo } = useWeb3AuthUser();
  const { provider } = useWeb3Auth();

  const steps = ["Enter Amount", "Scan QR", "Payment Status"];

  // Get address from Web3Auth provider
  React.useEffect(() => {
    const getWeb3AuthAddress = async () => {
      if (web3AuthConnected && provider && userInfo) {
        try {
          // Get accounts from Web3Auth provider
          const accountsUnknown = (await provider.request({ method: "eth_accounts" })) as unknown;
          if (Array.isArray(accountsUnknown) && accountsUnknown.length > 0 && typeof accountsUnknown[0] === "string") {
            setWeb3AuthAddress(accountsUnknown[0] as string);
          }
        } catch (error) {
          console.error("Failed to get Web3Auth address:", error);
          setWeb3AuthAddress(null);
        }
      } else {
        setWeb3AuthAddress(null);
      }
    };

    getWeb3AuthAddress();
  }, [web3AuthConnected, provider, userInfo]);

  const handleNext = (value: number) => {
    setAmount(value);
    setStep(2);
  };

  const handlePaymentComplete = async (status: string) => {
    setStatus(status);
    const newPaymentRef = "0xA1B2C3D4E5aaaaa"; // TODO: Replace with the correct payment ref
    setPaymentRef(newPaymentRef);
    setStep(3);
  };

  // Check if user is connected and has a valid address
  if (!web3AuthConnected || !web3AuthAddress) {
    return (
      <div className="p-10 text-white">
        <h1 className="text-4xl font-bold ml-5">Payment Screen</h1>
        <div className="mt-10 flex flex-col items-center">
          <RainbowKitCustomConnectButton />
          <p className="mt-4 text-gray-400">Please connect your wallet to generate QR codes</p>
        </div>
      </div>
    );
  }

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
                  <PromptPayment walletAddress={web3AuthAddress} onNext={handleNext} />
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
                    walletAddress={web3AuthAddress}
                    onPaid={handlePaymentComplete}
                    onBack={() => setStep(1)}
                  />
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
                    role={"merchant"}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
};

export default MerchantPaymentFlow;
