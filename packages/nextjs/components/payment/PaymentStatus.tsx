"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircleIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";

interface PaymentStatusProps {
  status: string;
  amount: number;
  paymentRef: string;
  onTry: () => void;
}

export default function PaymentStatus({ status, amount, paymentRef, onTry }: PaymentStatusProps) {
  // status = "success";
  const success = status === "success";

  const router = useRouter();

  const fadeInUp = {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <motion.div
      className="p-6 rounded-xl shadow-md w-full max-w-2xl border border-zinc-200 bg-[#111] text-white mx-auto"
      {...fadeInUp}
      initial="initial"
      animate="animate"
    >
      {success ? (
        <motion.div className="flex flex-col items-center space-y-6 p-3" {...fadeInUp}>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1, transition: { delay: 0.3 } }}>
            <CheckCircleIcon className="text-green-500 w-16 h-16" />
          </motion.div>

          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold">Payment Successful</h2>
            <p className="text-gray-400 text-sm md:text-base">Your payment has been received.</p>
          </div>

          <hr className="w-full border-t border-zinc-700" />

          <div className="w-full space-y-3 text-left text-sm md:text-base">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-1 md:gap-0">
              <span className="text-gray-400">Amount Paid:</span>
              <span className="font-medium">RM {amount.toFixed(2)}</span>
            </div>
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-1 md:gap-0">
              <span className="text-gray-400">Payment Method:</span>
              <span className="font-medium">QR Pay</span>
            </div>
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-1 md:gap-0">
              <span className="text-gray-400">Payment Reference ID:</span>
              <span className="font-medium truncate max-w-[150px] md:max-w-none" title={paymentRef}>
                {paymentRef.slice(0, 8)}
                {paymentRef.length > 8 ? "*****" : ""}
              </span>
            </div>
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-1 md:gap-0">
              <span className="text-gray-400">Date & Time:</span>
              <span className="font-medium">{new Date().toLocaleString()}</span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-8 px-6 py-3 rounded-2xl border-2 border-gray-300 focus:bg-white focus:text-black hover:bg-white hover:text-black transition duration-300 cursor-pointer"
            onClick={() => {
              router.push("/dashboard/123"); // TODO: Route back to respective role
            }}
          >
            View History
          </motion.button>
        </motion.div>
      ) : (
        <motion.div className="flex flex-col items-center text-center p-3 space-y-6 w-full" {...fadeInUp}>
          <motion.div initial={{ rotate: -15, scale: 0 }} animate={{ rotate: 0, scale: 1 }}>
            <ExclamationCircleIcon className="text-red-500 w-16 h-16" />
          </motion.div>

          <h2 className="text-2xl md:text-3xl font-bold">Payment Failed</h2>
          <p className="text-gray-500 text-sm md:text-base !mb-4">
            There was an issue processing the payment. Please try again or contact support.
          </p>

          <div className="flex flex-col w-full space-y-6">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-[90%] mx-auto py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-all cursor-pointer"
              onClick={onTry}
            >
              Try Again
            </motion.button>

            <div className="text-sm text-gray-500 dark:text-gray-400">
              Need help?{" "}
              <button
                onClick={() => router.push("/support")}
                className="text-blue-400 hover:underline font-medium cursor-pointer"
              >
                Contact Support
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
