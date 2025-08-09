"use client";

import React, { memo, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWeb3Auth, useWeb3AuthConnect, useWeb3AuthDisconnect, useWeb3AuthUser } from "@web3auth/modal/react";
import { AnimatePresence, motion } from "framer-motion";
import { useAccount, useDisconnect } from "wagmi";
import { Bars3Icon } from "@heroicons/react/24/outline";

interface IslandProps {
  leftOnPress?: () => void;
}

export const IslandView: React.FC<IslandProps> = () => {
  const [showButtons, setShowButtons] = useState(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState(false);

  const { isConnected: wagmiConnected } = useAccount();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const { isConnected: web3AuthConnected } = useWeb3AuthConnect();
  const { userInfo } = useWeb3AuthUser();
  const { disconnect: web3AuthDisconnect } = useWeb3AuthDisconnect();
  const { provider } = useWeb3Auth();
  const [web3AuthAddress, setWeb3AuthAddress] = useState<string | null>(null);

  // Get address from Web3Auth provider
  useEffect(() => {
    const getWeb3AuthAddress = async () => {
      if (web3AuthConnected && provider && userInfo) {
        try {
          const accounts = await provider.request({ method: "eth_accounts" });
          if (accounts && Array.isArray(accounts) && accounts.length > 0) {
            setWeb3AuthAddress(accounts[0]);
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

  // Prioritize Web3Auth connection over wagmi
  const isConnected = (web3AuthConnected && userInfo && web3AuthAddress) || wagmiConnected;

  const router = useRouter();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleLogout = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    try {
      // Disconnect Web3Auth first
      await web3AuthDisconnect();
      // Then disconnect wagmi
      wagmiDisconnect();
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const onPressButton = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (isMobile) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleMouseEnter = () => {
    if (!isMobile) {
      setShowButtons(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setShowButtons(false);
    }
  };

  const handleClickOutside = () => {
    if (isMobile) {
      setIsExpanded(false);
    }
  };

  const displayButtons = isMobile ? isExpanded : showButtons;

  return (
    <div className="fixed top-6 left-6 z-50">
      {isMobile && isExpanded && <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleClickOutside} />}
      <motion.div
        className="relative flex items-center gap-2"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        animate={{ width: displayButtons ? "auto" : "auto" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <AnimatePresence>
          {displayButtons && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex gap-2"
            >
              <motion.button
                className="px-4 py-2 bg-gray-800 text-white rounded-full text-sm hover:bg-gray-700 transition-colors whitespace-nowrap"
                onClick={() => router.push("/government")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Government
              </motion.button>
              <motion.button
                className="px-4 py-2 bg-gray-800 text-white rounded-full text-sm hover:bg-gray-700 transition-colors whitespace-nowrap"
                onClick={() => router.push("/merchant")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Merchant
              </motion.button>
              <motion.button
                className="px-4 py-2 bg-gray-800 text-white rounded-full text-sm hover:bg-gray-700 transition-colors whitespace-nowrap"
                onClick={() => router.push("/payment")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Payment
              </motion.button>
              {isConnected && (
                <motion.button
                  className="px-4 py-2 bg-red-600 text-white rounded-full text-sm hover:bg-red-700 transition-colors whitespace-nowrap"
                  onClick={handleLogout}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Logout
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          className="relative flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200"
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            if (!isConnected) {
              router.push("/login");
            }
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isConnected ? (
            <div className="w-8 h-8 rounded-full border-2 border-gray-400 bg-gray-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
          ) : (
            <p className="text-sm px-6">Login</p>
          )}
          {isMobile && (
            <motion.button
              className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center"
              onClick={onPressButton}
              animate={{ rotate: isExpanded ? 45 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <Bars3Icon className="w-3 h-3 text-gray-600" />
            </motion.button>
          )}
        </motion.button>
      </motion.div>
    </div>
  );
};

const Island: React.FC<IslandProps> = memo(() => {
  return <IslandView />;
});

Island.displayName = "Island";

export default Island;
