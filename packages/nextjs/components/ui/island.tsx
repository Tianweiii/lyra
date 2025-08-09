"use client";

import React, { memo, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useAccount, useDisconnect } from "wagmi";
import { Bars3Icon } from "@heroicons/react/24/outline";

export type IslandProps = {
  leftOnPress?: () => void;
};

export const IslandView: React.FC<IslandProps> = () => {
  const [hover, setHover] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState(false);
  const { disconnect } = useDisconnect();

  // TODO: disable Web3Auth temporarily
  const { isConnected } = useAccount();
  // const { isConnected, address } = useAccount();
  // const { userInfo } = useWeb3AuthUser();
  // const { isConnected } = useAccount();
  // const { disconnect } = useWeb3AuthDisconnect();
  // Fake user info
  const userInfo = {
    profileImage: "https://avatars.dicebear.com/api/identicon/123.svg",
  };
  const router = useRouter();

  useEffect(() => {
    const checkIfMobile = () => {
      const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.matchMedia("(max-width: 768px)").matches;
      setIsMobile(hasTouch || isSmallScreen);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isExpanded) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isExpanded]);

  const handleIslandClick = (e: any) => {
    e.stopPropagation();
    if (isMobile) {
      setHover(!hover);
      if (!hover) {
        setShowButtons(true);
      } else {
        setShowButtons(false);
      }
    }
  };

  const onPressButton = (e: any) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleLogout = async () => {
    try {
      await disconnect();
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleHoverStart = () => {
    if (!isMobile) {
      setHover(true);
    }
  };

  const handleHoverEnd = () => {
    if (!isMobile) {
      setHover(false);
      setShowButtons(false);
    }
  };

  const handleAnimationComplete = () => {
    if (hover) {
      setShowButtons(true);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (isMobile && hover && !isExpanded) {
        const target = event.target as HTMLElement;
        const islandElement = document.querySelector('[data-island="true"]');
        if (islandElement && !islandElement.contains(target)) {
          setHover(false);
          setShowButtons(false);
        }
      }
    };

    if (isMobile && hover && !isExpanded) {
      document.addEventListener("click", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isMobile, hover, isExpanded]);

  return (
    <AnimatePresence>
      <motion.div
        key="container1"
        data-island="true"
        className={`
          fixed top-[50px] left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[20vw] h-[50px] rounded-full flex justify-center items-center border border-white/30 bg-white/10 backdrop-blur-md shadow-lg z-[100]
          ${isMobile ? "cursor-pointer" : ""}
        `}
        whileHover={!isMobile ? { width: "40vw" } : {}}
        animate={isMobile && hover ? { width: "40vw" } : {}}
        transition={{
          duration: 0.3,
          ease: "easeInOut",
        }}
        onHoverStart={handleHoverStart}
        onHoverEnd={handleHoverEnd}
        onClick={handleIslandClick}
        onAnimationComplete={handleAnimationComplete}
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
                className="absolute left-0 top-1/2 -translate-y-1/2 ml-2 h-[80%] px-4 rounded-full border border-white/50 flex justify-center items-center text-white hover:cursor-pointer"
                onClick={onPressButton}
              >
                <Bars3Icon className="h-6 w-6 text-white" />
              </motion.button>

              {/* Profile/Login Button */}
              <motion.button
                key="profile-btn"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.1 }}
                className="absolute right-0 top-1/2 -translate-y-1/2 mr-2 h-[80%] px-4 rounded-full border border-white/50 flex justify-center items-center text-white hover:cursor-pointer"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation();
                  if (!isConnected) {
                    router.push("/login");
                  }
                }}
              >
                {isConnected && userInfo && userInfo.profileImage ? (
                  <div className="w-8 h-8 rounded-full border-2 border-gray-400 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={userInfo.profileImage} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                ) : isConnected ? (
                  // Show a default avatar
                  <div className="w-8 h-8 rounded-full border-2 border-gray-400 bg-gray-600 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                ) : (
                  <p className="text-sm px-6">Login</p>
                )}
              </motion.button>
            </>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div
        key="container2"
        className={`
          bg-white/10 backdrop-blur-md fixed transform flex justify-center items-center flex-col gap-10 z-50
          ${isExpanded ? "inset-0 w-screen h-screen top-0 left-0 bottom-0 -translate-x-0 -translate-y-0" : "w-10 h-10 top-[50px] left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-4xl"}
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
              // ROLE: ROUTE FOR ROLE
              onClick={() => router.push("/dashboard/124")}
            >
              Dashboard
            </motion.p>
            {/* <motion.p
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
            </motion.p> */}
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
              onClick={() => router.push("/support")}
            >
              FAQ
            </motion.p>
            {isConnected && (
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
                onClick={handleLogout}
              >
                Logout
              </motion.p>
            )}
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export const Island = memo(IslandView);
export default Island;
