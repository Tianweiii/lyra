"use client";

import React from "react";
import { useWeb3AuthConnect, useWeb3AuthDisconnect, useWeb3AuthUser } from "@web3auth/modal/react";
import { useAccount } from "wagmi";

const LoginPage = () => {
  const { connect, isConnected, loading: connectLoading, error: connectError } = useWeb3AuthConnect();
  const { disconnect, loading: disconnectLoading, error: disconnectError } = useWeb3AuthDisconnect();
  const { userInfo } = useWeb3AuthUser();
  const { address, connector } = useAccount();

  const printToConsole = () => {
    const el = document.querySelector("#console > p");
    if (el) {
      el.innerHTML = JSON.stringify(userInfo || {}, null, 2);
      console.log("User Info:", userInfo);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-4">
      <h1 className="text-3xl font-bold mb-6">Web3Auth Login with Next.js</h1>

      {isConnected ? (
        <div className="space-y-4 text-center">
          <p>
            Connected with <strong>{connector?.name}</strong>
          </p>
          <p>
            Address: <span className="text-blue-400">{address}</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4">
            <button onClick={printToConsole} className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600">
              Show User Info
            </button>

            <button onClick={() => disconnect()} className="px-4 py-2 bg-red-600 rounded hover:bg-red-700">
              Log Out
            </button>
          </div>

          {disconnectLoading && <p>Disconnecting...</p>}
          {disconnectError && <p className="text-red-500">{disconnectError.message}</p>}
        </div>
      ) : (
        <div className="space-y-4">
          <button onClick={() => connect()} className="px-6 py-2 bg-blue-600 rounded hover:bg-blue-700">
            Login with Web3Auth
          </button>

          {connectLoading && <p>Connecting...</p>}
          {connectError && <p className="text-red-500">{connectError.message}</p>}
        </div>
      )}

      <div id="console" className="mt-6 text-sm bg-gray-900 p-4 rounded w-full max-w-xl">
        <p style={{ whiteSpace: "pre-line" }}></p>
      </div>
    </div>
  );
};

export default LoginPage;
