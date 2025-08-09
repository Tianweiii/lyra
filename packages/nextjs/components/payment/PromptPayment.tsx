"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface PromptPaymentProps {
  walletAddress: string;
  onNext: (value: number) => void;
}

export const PromptPayment = ({ walletAddress, onNext }: PromptPaymentProps) => {
  const [value, setValue] = useState<number | undefined>();
  const [validationError, setValidationError] = useState("");
  const [touched, setTouched] = useState(false);
  const isValid = touched && value !== undefined && !validationError;

  console.log(walletAddress);
  useEffect(() => {
    if (!touched) return;

    if (value === undefined || isNaN(value)) {
      setValidationError("Please enter a valid number.");
    } else if (value <= 0) {
      setValidationError("Amount must be greater than 0.");
    }
    // else if (value > balance) {
    //   setValidationError("Amount exceeds wallet balance.");
    // }
    else {
      setValidationError("");
    }
  }, [value, touched]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = Number(e.target.value);
    setTouched(true);
    setValue(isNaN(num) ? undefined : num);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !validationError && value) {
      onNext(value);
    }
  };

  const fadeUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <motion.div
      {...fadeUp}
      initial="initial"
      animate="animate"
      className="p-6 md:p-10 bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 w-full max-w-3xl mx-auto space-y-6 text-white"
    >
      {/* Wallet info */}
      <motion.div {...fadeUp} className="space-y-3">
        <h2 className="text-lg md:text-xl font-bold text-white/80">Wallet Address</h2>
        <div className="flex justify-between items-center p-4 rounded-xl bg-black/10 border border-gray-500/40 text-sm md:text-base">
          <p className="text-gray-400 select-none">
            {walletAddress.length > 0 ? `${walletAddress.slice(0, 8)}****${walletAddress.slice(-4)}` : walletAddress}
          </p>
          <span className="text-xs text-gray-500">Read-only</span>
        </div>
      </motion.div>

      {/* Balance info */}
      {/* <motion.div {...fadeUp} className="space-y-3">
        <h2 className="text-lg md:text-xl font-bold text-white/80">Balance in Wallet</h2>

        <div className="flex flex-row items-center justify-between p-4 rounded-xl bg-black/10 border border-gray-500/40 gap-4 text-sm md:text-base">
          <div className="flex-1 min-w-0">
            <div className="flex flex-col">
              <span className="text-gray-400">MYR</span>
              <span className="text-white font-sm md:text-lg text whitespace-nowrap overflow-hidden text-ellipsis">
                RM {balance.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="w-px bg-gray-500/40 h-10 mx-2"></div>

          <div className="flex-1 min-w-0 text-right">
            <div className="flex flex-col items-end">
              <span className="text-gray-400">Equivalent (USD)</span>
              {loading ? (
                <span className="text-gray-500 md:text-lg text">Loading...</span>
              ) : (
                <span className="text-white font-medium md:text-lg text whitespace-nowrap overflow-hidden text-ellipsis">
                  ~ {convertedAmount}
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div> */}

      {/* Payment input */}
      <motion.div {...fadeUp} className="space-y-3">
        <h2 className="text-lg md:text-xl font-bold text-white">Enter Payment Amount (MYR)</h2>
        <input
          type="number"
          className={`w-full p-3 text-base rounded-lg bg-white/5 backdrop-blur-md border focus:outline-none focus:ring-2 placeholder:text-gray-400 text-white shadow-md border-blue-400 focus:ring-blue-500 ${
            !touched
              ? "border-blue-400 focus:ring-blue-500"
              : isValid
                ? "border-blue-400 focus:ring-blue-500"
                : "border-red-400 focus:ring-red-500"
          }`}
          placeholder="e.g. 12.00"
          value={value || ""}
          onKeyDown={handleKeyDown}
          onChange={handleInputChange}
        />

        {validationError && <span className="text-xs text-red-500">{validationError}</span>}
      </motion.div>

      <motion.div {...fadeUp} className="flex flex-col items-center">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onNext(Number(value))}
          disabled={!value || isNaN(value) || value <= 0}
          //
          className={`w-full py-2 md:py-4 rounded-xl font-semibold transition-all duration-300 ${
            value && value > 0
              ? "bg-blue-600 hover:bg-blue-700 cursor-pointer text-white"
              : "bg-gray-600 cursor-not-allowed text-gray-300"
          }`}
        >
          Next
        </motion.button>
      </motion.div>
    </motion.div>
  );
};
