"use client";

import React, { memo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

export const IslandView = () => {
  const [hover, setHover] = useState(false);
  const [showButtons, setShowButtons] = useState(false);

  const router = useRouter();

  return (
    <motion.div
      className="fixed top-[100px] left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[20vw] h-[50px] rounded-full flex justify-center items-center border border-white/30 bg-white/10 backdrop-blur-md shadow-lg z-50"
      whileHover={{ width: "40vw" }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => {
        setHover(false);
        setShowButtons(false);
      }}
      onAnimationComplete={() => {
        if (hover) {
          setShowButtons(true);
        }
      }}
    >
      <p className="text-white font-semibold">Lyra</p>

      <AnimatePresence>
        {showButtons && (
          <>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.05 }}
              className="absolute left-0 top-1/2 -translate-y-1/2 ml-2 h-[80%] px-10 rounded-full border border-white/50 flex justify-center items-center text-white"
              onClick={() => router.push("/dashboard/123")}
            >
              <p className="text-sm">Something</p>
            </motion.button>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.1 }}
              className="absolute right-0 top-1/2 -translate-y-1/2 mr-2 h-[80%] px-10 rounded-full border border-white/50 flex justify-center items-center text-white"
              onClick={() => {
                router.push("/login");
              }}
            >
              <p className="text-sm">Login</p>
            </motion.button>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const Island = memo(IslandView);
export default Island;
