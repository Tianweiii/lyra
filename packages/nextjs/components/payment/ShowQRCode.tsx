"use client";

import React from "react";
import { motion } from "framer-motion";
// import QRCode from 'react-qr-code';
import QRCodeComponent from "react-qr-code";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

// import dynamic from "next/dynamic";

// const QRCode = dynamic(() => import("react-qr-code"), { ssr: false });

interface showQRCodeProps {
  amount: number;
  // converted: number;
  walletAddress: string;
  onPaid: (status: string) => void;
  onBack: () => void;
}

export default function ShowQRCode({ amount, walletAddress, onPaid, onBack }: showQRCodeProps) {
  const paymentData = JSON.stringify({ amount, walletAddress });

  // TODO: Simulate scan + success
  const simulateScan = () => {
    setTimeout(() => onPaid("success"), 3000); // simulate delay
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
      className="p-6 md:p-10 bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 w-full max-w-3xl mx-auto space-y-6 text-white text-center"
    >
      <button
        onClick={onBack}
        className="absolute top-4 left-4 px-3 py-1.5 border border-gray-400 text-gray-300 text-sm rounded-xl hover:bg-gray-700 hover:text-white transition duration-200 cursor-pointer"
      >
        <ArrowLeftIcon className="w-5 h-5" />
      </button>

      <motion.div {...fadeUp} className="space-y-3">
        <h2 className="text-lg font-semibold">Scan to Pay</h2>
        <p className="text-sm text-gray-400">
          Amount: RM{amount.toFixed(2)}
          {/* ({converted} TBT) */}
        </p>
      </motion.div>

      <motion.div className="flex justify-center py-4">
        {React.createElement(QRCodeComponent as any, {
          value: paymentData,
          size: 270,
          bgColor: "#000",
          fgColor: "#ffffff",
          level: "H",
          style: { display: "block" },
        })}
        {/* <QRCode value={paymentData} size={200} bgColor="#000" fgColor="#ffffff" level="H" /> */}
      </motion.div>

      <motion.div {...fadeUp} className="space-y-3">
        <button onClick={simulateScan} className="text-sm underline text-gray-400 hover:text-white">
          Simulate Payment (for demo)
        </button>
      </motion.div>
    </motion.div>
  );
}
