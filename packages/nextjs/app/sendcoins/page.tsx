"use client";

import React, { useCallback, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useMediaQuery } from "react-responsive";
import Island from "~~/components/ui/island";
import MultiSelectView from "~~/components/ui/multiselect";
import { Vortex } from "~~/components/ui/vortex";
import { loadUserData } from "~~/utils/helper";

const steps = ["Select Recipient & Amount", "Processing Payment", "Complete Payment"];

const SendCoinPage = () => {
  const [gasFee] = useState(3);
  const [sendAmount, setSendAmount] = useState("");
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Memoize expensive computations
  const data = useMemo(() => loadUserData(), []);
  const isMobile = useMediaQuery({ maxWidth: 768 });

  // Memoize filtered data
  const activeUsers = useMemo(() => data.filter(i => i.status === "active").map(user => user.walletAddress), [data]);

  // Memoize parsed amount
  const parsedAmount = useMemo(() => parseInt(sendAmount) || 0, [sendAmount]);

  const handleNext = useCallback(() => {
    console.log(selectedUsers);
    if (step < steps.length - 1) {
      setDirection(1);
      setStep(prev => prev + 1);
    }
  }, [selectedUsers, step]);

  const handleBack = useCallback(() => {
    if (step > 0) {
      setDirection(-1);
      setStep(prev => prev - 1);
    }
  }, [step]);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  const verticalContainer = useCallback((title: React.ReactNode, amount: React.ReactNode) => {
    return (
      <div className="flex justify-between">
        <p className="text-sm text-gray-300">{title}</p>
        <p className="text-sm text-white">${amount}</p>
      </div>
    );
  }, []);

  const stepComponents = useMemo(
    () => [
      // Step 1: Select Recipient & Amount
      <motion.div
        key="step1"
        className="flex flex-col gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <motion.h2
          className="text-2xl font-bold text-white"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          How much do you want to send?
        </motion.h2>

        <motion.div
          className="flex flex-col gap-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex flex-col gap-2">
            <p className="text-[#8c8c8c] text-[12px]">Recipients</p>
            <MultiSelectView data={activeUsers} callback={setSelectedUsers} />
          </div>
        </motion.div>

        <motion.div
          className="flex flex-col gap-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-gray-400 text-sm">Each user will receive</p>
          <div className="relative inline-block">
            <input
              type="number"
              value={sendAmount}
              onChange={e => setSendAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors box-border [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="gray"
              className="w-5 h-5 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
            >
              <Image width={30} height={30} src={"/icons/usdc.svg"} alt="" style={{ zIndex: 999 }} />
            </svg>
          </div>
        </motion.div>

        <motion.div
          className="flex flex-col gap-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-gray-400 text-sm">You will send (approx.)</p>
          <input
            type="number"
            value={Number(sendAmount) * selectedUsers.length}
            disabled
            onChange={e => setSendAmount(e.target.value)}
            placeholder="0.00"
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
          />
        </motion.div>

        <motion.div
          className="border border-gray-600 w-full rounded-lg flex flex-col gap-4 p-5 bg-gray-800/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {verticalContainer("You will pay", Number(sendAmount) * selectedUsers.length)}
          {verticalContainer("Lyra Fees", gasFee)}
          <div className="h-px bg-gray-600 my-2"></div>
          {verticalContainer("Total", Number(sendAmount) * selectedUsers.length + gasFee)}
        </motion.div>
      </motion.div>,

      // Step 2: Processing Payment
      <motion.div
        key="step2"
        className="flex flex-col items-center justify-center h-full gap-6"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.4 }}
      >
        <motion.div
          className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <motion.h2
          className="text-2xl font-bold text-white text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Processing Payment
        </motion.h2>
        <motion.p
          className="text-gray-400 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Please wait while we process your transaction...
        </motion.p>
      </motion.div>,

      // Step 3: Complete Payment
      <motion.div
        key="step3"
        className="flex flex-col items-center justify-center h-full gap-6"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.4 }}
      >
        <motion.div
          className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        >
          <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </motion.div>
        <motion.h2
          className="text-2xl font-bold text-white text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Payment Complete!
        </motion.h2>
        <motion.p
          className="text-gray-400 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Your transaction has been successfully processed.
        </motion.p>
        <motion.div
          className="bg-gray-800 rounded-lg p-4 w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-sm text-gray-400 mb-2">Transaction Hash:</p>
          <p className="text-sm text-blue-400 font-mono">0x1234567890abcdef...</p>
        </motion.div>
      </motion.div>,
    ],
    [sendAmount, activeUsers, parsedAmount, verticalContainer],
  );

  // Memoize StepContent to prevent unnecessary re-renders
  const StepContent = useMemo(() => {
    return stepComponents[step];
  }, [stepComponents, step]);

  return (
    <div className="w-[calc(100%-4rem)] mx-auto rounded-md overflow-hidden flex justify-center items-center min-h-screen">
      <Vortex
        backgroundColor="black"
        className="flex items-center flex-col justify-center px-2 md:px-10 py-4 w-full h-full"
      >
        <div className="w-full flex items-center justify-center p-4">
          <Island />
          <motion.div
            // className="bg-gradient-to-br from-gray-900 to-gray-800 md:w-[70vw] w-[90vw] rounded-2xl p-8 flex flex-col gap-6 border border-gray-700"
            className="border-white/30 bg-gray-900/20 backdrop-blur-md md:w-[70vw] w-[90vw] rounded-2xl p-8 flex flex-col gap-6 border"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <h1 className="text-2xl font-bold text-white mb-2">Send Funds</h1>
              <div className="h-px bg-gradient-to-r from-blue-500 to-purple-500 mt-2"></div>
            </motion.div>

            <div className="flex md:flex-row flex-col h-full gap-8">
              {/* Stepper */}
              <motion.div
                className={`${isMobile ? "flex justify-between mb-6" : "flex flex-col"} flex-1`}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                {steps.map((stepLabel, index) => (
                  <motion.div
                    key={stepLabel}
                    className="flex flex-col"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <div className="flex gap-3 items-center">
                      <motion.div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                          index <= step
                            ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                            : "bg-gray-700 text-gray-400 border border-gray-600"
                        }`}
                        animate={index === step ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ duration: 0.3 }}
                      >
                        {index + 1}
                      </motion.div>
                      <span
                        className={`${isMobile ? "text-xs" : "text-sm"} font-medium transition-colors duration-300 ${
                          index <= step ? "text-white" : "text-gray-400"
                        }`}
                      >
                        {stepLabel}
                      </span>
                    </div>
                    {!isMobile && index < steps.length - 1 && (
                      <motion.div
                        className={`w-px h-14 ml-5 transition-colors duration-300 ${
                          index < step ? "bg-gradient-to-b from-blue-500 to-purple-600" : "bg-gray-600"
                        }`}
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: index < step ? 1 : 0.3 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </motion.div>
                ))}
              </motion.div>

              {/* Content Area */}
              <div className="flex-2 flex flex-col">
                <div className="bg-gray-800/30 rounded-xl p-6 backdrop-blur-sm border border-gray-700/50 flex-1 overflow-hidden">
                  <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                      key={step}
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{
                        x: { type: "spring", stiffness: 300, damping: 30 },
                        opacity: { duration: 0.2 },
                      }}
                      className="h-full"
                    >
                      {StepContent}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Navigation Buttons */}
                <motion.div
                  className="flex gap-4 mt-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <motion.button
                    disabled={step === 0}
                    onClick={handleBack}
                    className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                      step === 0
                        ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                        : "bg-gray-700 hover:bg-gray-600 text-white border border-gray-600"
                    }`}
                    whileHover={step !== 0 ? { scale: 1.02 } : {}}
                    whileTap={step !== 0 ? { scale: 0.98 } : {}}
                  >
                    Back
                  </motion.button>
                  <motion.button
                    disabled={step === 2}
                    onClick={handleNext}
                    className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                      step === steps.length - 1
                        ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
                    }`}
                    whileHover={step !== steps.length - 1 ? { scale: 1.02, y: -2 } : {}}
                    whileTap={step !== steps.length - 1 ? { scale: 0.98 } : {}}
                  >
                    {step === steps.length - 1 ? "Complete" : "Next"}
                  </motion.button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </Vortex>
    </div>
  );
};

export default SendCoinPage;
