"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useWeb3AuthConnect } from "@web3auth/modal/react";
import { BackgroundGradient } from "~~/components/ui/neon-div";

const LoginPage = () => {
  const router = useRouter();
  const { connect, isConnected, loading: connectLoading, error: connectError } = useWeb3AuthConnect();
  // const { disconnect, loading: disconnectLoading, error: disconnectError } = useWeb3AuthDisconnect();
  // const { userInfo } = useWeb3AuthUser();
  // const { address, connector } = useAccount();

  useEffect(() => {
    if (isConnected) {
      router.push("/"); // Redirect to home page after login
    }
  }, [isConnected, router]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-background">
      {/* Backgrounds */}
      <div
        className="absolute inset-0 bg-gradient-glow bg-opacity-10"
        style={{
          backgroundImage: "url(/images/loginBackground.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      <div className="absolute inset-0 bg-gradient-glow" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-purple/10 rounded-full blur-3xl animate-float" />
      <div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-neon-blue/10 rounded-full blur-3xl animate-float"
        style={{ animationDelay: "1s" }}
      />

      {/* Main Card */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md p-8 bg-white/10 backdrop-blur-md border border-white/20 shadow-xl rounded-xl animate-glow-pulse">
          <div className="text-center space-y-8">
            {/* Lyra Logo */}
            <div className="space-y-5">
              <div className="mx-auto">
                <Image src="/images/Lyra-Logo.png" alt="Lyra Logo" width={200} height={50} />
              </div>
              <div>
                <p className="text-neon-blue font-bold text-[25px] leading-tight">Digital Payments</p>
              </div>
            </div>

            {/* Description */}
            <div className="text-muted-foreground leading-relaxed text-[15px] text-[#C6C6C6] mb-6">
              Lyra is a smart platform for governments and organizations to send USDC to users, who can spend it via QR
              payments. With currency conversion, secure smart contracts, and merchant vouchers, Lyra simplifies digital
              disbursements.
            </div>

            {/* Web3Auth Login Button */}
            <div className="space-y-4">
              <BackgroundGradient
                containerClassName="w-full h-14 rounded-xl"
                className="w-full h-full flex items-center justify-center text-white font-semibold text-lg cursor-pointer"
                onClick={() => connect()}
              >
                {connectLoading ? "Connecting..." : "Login with Web3Auth"}
              </BackgroundGradient>
              {connectError && <p className="text-red-500">{connectError.message}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
