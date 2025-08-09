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
  // Use merchantAddress instead of walletAddress to match user page expectations
  // Include merchant's push notification endpoint for payment notifications
  const paymentData = JSON.stringify({
    amount,
    merchantAddress: walletAddress,
    // TODO: Get merchant's push notification endpoint from database or context
    // For now, we'll use a placeholder that can be replaced with actual endpoint
    merchantEndpoint: `${walletAddress.toLowerCase()}`, // Use wallet address as endpoint identifier
  });
  const encoded = btoa(paymentData);
  const baseURL = typeof window !== "undefined" ? window.location.origin : "";
  // Point to the user payment page
  const qrURL = `${baseURL}/payment/user?data=${encoded}`;

  // console for debug
  console.log("Generated QR Data:", paymentData);
  console.log("Generated QR URL:", qrURL);

  const fadeUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  } as const;

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
          Amount: {amount} LYRA
          {/* ({converted} TBT) */}
        </p>
      </motion.div>

      {/* White container to provide strong contrast and quiet zone */}
      <motion.div className="flex justify-center py-4">
        <div className="bg-white p-4 rounded-lg shadow-md">
          {React.createElement(QRCodeComponent as any, {
            value: qrURL,
            size: 320,
            bgColor: "#ffffff",
            fgColor: "#000000",
            level: "H",
            style: { display: "block" },
          })}
        </div>
      </motion.div>

      <motion.div {...fadeUp} className="space-y-3">
        <button
          onClick={() => setTimeout(() => onPaid("success"), 3000)}
          className="text-sm underline text-gray-400 hover:text-white"
        >
          Simulate Payment (for demo)
        </button>
      </motion.div>
    </motion.div>
  );
}
