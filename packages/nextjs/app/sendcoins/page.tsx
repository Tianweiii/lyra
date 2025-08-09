"use client";

import React, { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { formatUnits, parseUnits } from "viem";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth/RainbowKitCustomConnectButton";
import Island from "~~/components/ui/island";
import MultiSelectView from "~~/components/ui/multiselect";
import { Vortex } from "~~/components/ui/vortex";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth/useScaffoldReadContract";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth/useScaffoldWriteContract";
import { loadUserData } from "~~/utils/helper";

const steps = ["Select Recipient & Amount", "Complete Payment"];

const SendCoinPage = () => {
  const [step, setStep] = useState(0);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const router = useRouter();

  // Memoize expensive computations
  const data = useMemo(() => loadUserData(), []);
  const activeUsers = useMemo(() => data.filter(i => i.status === "active").map(user => user.walletAddress), [data]);

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

  const handleSwitchToPolygon = async () => {
    try {
      await switchChain({ chainId: 137 });
    } catch (error) {
      console.error("Failed to switch to Polygon:", error);
    }
  };

  // step 1: smart contract config set amount and receipient
  const { address } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const [usdtAmount, setUsdtAmount] = useState("");
  const [nativeAmount, setNativeAmount] = useState("");
  const [, setIsLoading] = useState(false);
  const [swapType, setSwapType] = useState<"usdt" | "native">("usdt");

  const isPolygonNetwork = chainId === 137;

  const { data: priceUsdtPerNative } = useScaffoldReadContract({
    contractName: "LyraOtcSeller",
    functionName: "priceUsdtPerNative",
  });

  const { data: lyraPerUsdt } = useScaffoldReadContract({
    contractName: "LyraOtcSeller",
    functionName: "lyraPerUsdt",
  });

  const getQuote = useCallback(() => {
    if (!lyraPerUsdt || !priceUsdtPerNative) return "0";

    if (swapType === "usdt" && usdtAmount) {
      const usdtAmountWei = parseUnits(usdtAmount, 6);
      const lyraOut = usdtAmountWei * (lyraPerUsdt || 0n);
      return formatUnits(lyraOut, 18);
    } else if (swapType === "native" && nativeAmount) {
      const nativeAmountWei = parseUnits(nativeAmount, 18);
      const usdtAmount = (nativeAmountWei * (priceUsdtPerNative || 0n)) / parseUnits("1", 18);
      const lyraOut = usdtAmount * (lyraPerUsdt || 0n);
      return formatUnits(lyraOut, 18);
    }

    return "0";
  }, [usdtAmount, nativeAmount, swapType, lyraPerUsdt, priceUsdtPerNative]);

  // step 2: approve transaction
  const OTC_ADDRESS = "0x5265BCcc8aB5A36A45ABD2E574E6Fa7F863e5C2e";
  const { writeContractAsync: writeUsdt } = useScaffoldWriteContract("USDT");

  const { data: usdtAllowance } = useScaffoldReadContract({
    contractName: "USDT",
    functionName: "allowance",
    args: [address, OTC_ADDRESS],
  });

  const { writeContractAsync: writeLyraOtcSeller } = useScaffoldWriteContract("LyraOtcSeller");

  const handleUsdtSwap = useCallback(async () => {
    try {
      setIsLoading(true);

      const usdtAmountWei = parseUnits(usdtAmount, 6); // USDT has 6 decimals
      const minLyraOut = (lyraPerUsdt * usdtAmountWei) / BigInt(1e6); // Calculate expected LYRA output

      // Use the new multiple recipients function instead of looping
      await writeLyraOtcSeller({
        functionName: "govSwapUsdtAndSendMultiple",
        args: [selectedUsers, usdtAmountWei, minLyraOut],
      });

      // alert("USDT换LYRA交易成功！");
      setUsdtAmount("");
      setSelectedUsers([]);
    } catch (error) {
      console.error("USDT swap error:", error);
      // alert("交易失败，请检查余额和网络连接");
    } finally {
      setIsLoading(false);
    }
  }, [usdtAmount, lyraPerUsdt, writeLyraOtcSeller, selectedUsers]);

  const handleNativeSwap = useCallback(async () => {
    try {
      setIsLoading(true);

      const nativeAmountWei = parseUnits(nativeAmount, 18);
      const expectedUsdtValue = (nativeAmountWei * priceUsdtPerNative) / BigInt(1e18);
      const minLyraOut = (lyraPerUsdt * expectedUsdtValue) / BigInt(1e6);

      // Use the new multiple recipients function instead of looping
      await writeLyraOtcSeller({
        functionName: "govSwapNativeAndSendMultiple",
        args: [selectedUsers, minLyraOut],
        value: nativeAmountWei,
      });

      // alert("MATIC换LYRA交易成功！");
      setNativeAmount("");
      setSelectedUsers([]);
    } catch (error) {
      console.error("Native swap error:", error);
      // alert("交易失败，请检查余额和网络连接");
    } finally {
      setIsLoading(false);
    }
  }, [nativeAmount, priceUsdtPerNative, lyraPerUsdt, writeLyraOtcSeller, selectedUsers]);

  const handleNextWithApprove = useCallback(async () => {
    try {
      setIsLoading(true);

      // Check current allowance
      const hasUsdtAllowance = usdtAllowance && usdtAllowance > parseUnits("1000", 6);

      if (!hasUsdtAllowance) {
        const approveAmount = parseUnits("1000000", 6);
        await writeUsdt({
          functionName: "approve",
          args: [OTC_ADDRESS, approveAmount],
        });
      }

      if (swapType === "usdt") {
        await handleUsdtSwap();
      } else {
        await handleNativeSwap();
      }

      setStep(1);
    } catch (error) {
      console.error("Error in approval process:", error);
    } finally {
      setIsLoading(false);
    }
  }, [handleNativeSwap, handleUsdtSwap, swapType, usdtAllowance, writeUsdt]);

  const stepComponents = useMemo(
    () => [
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

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Swap Type</label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="usdt"
                checked={swapType === "usdt"}
                onChange={e => setSwapType(e.target.value as "usdt" | "native")}
                className="mr-2"
              />
              USDT to LYRA
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="native"
                checked={swapType === "native"}
                onChange={e => setSwapType(e.target.value as "usdt" | "native")}
                className="mr-2"
              />
              MATIC to LYRA
            </label>
          </div>
        </div>

        <motion.div
          className="flex flex-col gap-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-gray-400 text-sm">Each user will receive</p>
          <div className="relative inline-block">
            {swapType === "usdt" ? (
              <input
                type="number"
                value={usdtAmount}
                onChange={e => setUsdtAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors box-border [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            ) : (
              <input
                type="number"
                value={nativeAmount}
                onChange={e => setNativeAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors box-border [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            )}
          </div>
        </motion.div>

        <motion.div
          className="mb-6 p-4 bg-base-200 rounded"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-sm text-gray-600">Estimated LYRA Output:</p>
          <p className="text-lg font-semibold">{getQuote()} LYRA</p>
        </motion.div>
      </motion.div>,

      // Step 2: Complete Payment
      <motion.div
        key="step2"
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
    [activeUsers, swapType, usdtAmount, getQuote, nativeAmount],
  );

  // Memoize StepContent to prevent unnecessary re-renders
  const StepContent = useMemo(() => {
    return stepComponents[step];
  }, [stepComponents, step]);

  if (!isPolygonNetwork) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <RainbowKitCustomConnectButton />
          </div>
          <h1 className="text-2xl font-bold mb-4">Wrong Network</h1>
          <p className="text-gray-600 mb-4">Please switch to Polygon network to access the government portal.</p>
          <button
            onClick={handleSwitchToPolygon}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Switch to Polygon
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[calc(100%-4rem)] mx-auto rounded-md overflow-hidden flex justify-center items-center min-h-screen">
      {/* <RainbowKitCustomConnectButton /> */}
      <Vortex
        backgroundColor="black"
        className="flex items-center flex-col justify-center px-2 md:px-10 py-4 w-full h-full"
      >
        <div className="w-full flex items-center justify-center p-4">
          <Island />
          <motion.div
            className="border-white/30 bg-gray-900/20 backdrop-blur-md md:w-[70vw] w-[80vw] rounded-2xl p-8 flex flex-col gap-6 border"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <h1 className="text-2xl font-bold text-white mb-2">Send Funds</h1>
              <div className="h-px bg-gradient-to-r from-blue-500 to-purple-500 mt-2"></div>
            </motion.div>

            {/* Content Area */}
            <div className="flex-2 flex flex-col">
              <div className="bg-gray-800/30 rounded-xl p-6 backdrop-blur-sm border border-gray-700/50 flex-1 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
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
                  // disabled={isLoading}
                  onClick={step == 0 ? handleNextWithApprove : () => router.back()}
                  className="flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
                  whileHover={step !== steps.length - 1 ? { scale: 1.02, y: -2 } : {}}
                  whileTap={step !== steps.length - 1 ? { scale: 0.98 } : {}}
                >
                  {step === steps.length - 1 ? "Complete" : "Make Payment"}
                </motion.button>
              </motion.div>
            </div>
            {/* </div> */}
          </motion.div>
        </div>
      </Vortex>
    </div>
  );
};

export default SendCoinPage;
