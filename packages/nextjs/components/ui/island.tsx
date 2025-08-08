"use client";

import React, { memo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Bars3Icon } from "@heroicons/react/24/outline";

export type IslandProps = {
  leftOnPress?: () => void;
  rightOnPress?: () => void;
};

export const IslandView: React.FC<IslandProps> = ({ rightOnPress }) => {
  const [hover, setHover] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const onPressButton = (e: any) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const router = useRouter();

  return (
    <AnimatePresence>
      <motion.div
        key="container1"
        className={`
          fixed top-[100px] left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[20vw] h-[50px] rounded-full flex justify-center items-center border border-white/30 bg-white/10 backdrop-blur-md shadow-lg z-[100]
        `}
        whileHover={{ width: "40vw" }}
        transition={{
          duration: 0.3,
          ease: "easeInOut",
        }}
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
                key="menu-btn"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.05 }}
                className="absolute left-0 top-1/2 -translate-y-1/2 ml-2 h-[80%] px-4 rounded-full border border-white/50 flex justify-center items-center text-white"
                onClick={onPressButton}
              >
                <Bars3Icon className="h-6 w-6 text-white" />
              </motion.button>
              <motion.button
                key="profile-btn"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.1 }}
                className="absolute right-0 top-1/2 -translate-y-1/2 mr-2 h-[80%] px-10 rounded-full border border-white/50 flex justify-center items-center text-white"
                onClick={rightOnPress}
              >
                <p className="text-sm">Login</p>
              </motion.button>
            </>
          )}
        </AnimatePresence>
      </motion.div>
      <motion.div
        key="container2"
        className={`
          bg-white/10 backdrop-blur-md fixed transform flex justify-center items-center flex-col gap-10 z-50
          ${isExpanded ? "inset-0 w-screen h-screen top-0 left-0 bottom-0 -translate-x-0 -translate-y-0" : "w-10 h-10 top-[100px] left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-4xl"}
        `}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
          duration: 0.8,
        }}
        layout
      >
        {isExpanded && (
          <>
            <motion.p
              className="text-3xl text-white cursor-pointer hover:underline"
              initial={{
                opacity: 0,
                y: 20,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.3,
                delay: 0.5,
              }}
              onClick={() => router.push("/")}
            >
              Home
            </motion.p>
            <motion.p
              className="text-3xl text-white cursor-pointer hover:underline"
              initial={{
                opacity: 0,
                y: 20,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.3,
                delay: 0.6,
              }}
              onClick={() => router.push("/dashboard/124")}
            >
              Dashboard
            </motion.p>
            <motion.p
              className="text-3xl text-white cursor-pointer hover:underline"
              initial={{
                opacity: 0,
                y: 20,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.3,
                delay: 0.8,
              }}
            >
              Profile
            </motion.p>
            <motion.p
              className="text-3xl text-white cursor-pointer hover:underline"
              initial={{
                opacity: 0,
                y: 20,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.3,
                delay: 1.0,
              }}
            >
              FAQ
            </motion.p>
            <motion.p
              className="text-3xl text-white cursor-pointer hover:underline"
              initial={{
                opacity: 0,
                y: 20,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.3,
                delay: 1.2,
              }}
            >
              Logout
            </motion.p>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export const Island = memo(IslandView);
export default Island;
