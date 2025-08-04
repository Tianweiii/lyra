"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import QRCodeGenerator from "~~/components/LyraRamp/QRCodeGenerator";
import { Address } from "~~/components/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

interface RampRequest {
  recipient: string;
  currency: string;
  recipientName: string;
  amount: number;
  usdtEquivalent: number;
  requestId: number;
  isCompleted: boolean;
  timestamp: number;
  selectedChain: string;
}

export default function LyraRampPage() {
  const { address } = useAccount();
  const { targetNetwork } = useTargetNetwork();
  const [activeTab, setActiveTab] = useState<"create" | "complete" | "requests">("create");

  // Form states for creating request
  const [currency, setCurrency] = useState("MYR");
  const [recipientName, setRecipientName] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedChain, setSelectedChain] = useState("polygon");

  // Form states for completing request
  const [requestId, setRequestId] = useState("");
  const [tokenAddress, setTokenAddress] = useState("");

  // Request details and QR code
  const [currentRequest, setCurrentRequest] = useState<RampRequest | null>(null);
  const [qrData, setQrData] = useState("");
  const [createdRequestId, setCreatedRequestId] = useState<number | null>(null);

  const { writeContractAsync: writeLyraRampAsync } = useScaffoldWriteContract({
    contractName: "LyraRamp",
  });

  const { data: requestCounter } = useScaffoldReadContract({
    contractName: "LyraRamp",
    functionName: "requestCounter",
  });

  // Check if user is on the correct network
  const isCorrectNetwork = targetNetwork.id === 534351; // Scroll Sepolia

  // Fetch user requests
  const fetchUserRequests = async () => {
    if (!address) return;

    try {
      // For now, we'll use a simple approach to track requests
      // In a real implementation, you'd want to use a read contract hook
      console.log("Fetching user requests for:", address);
      // This will be implemented when we have proper read contract support
    } catch (error) {
      console.error("Error fetching user requests:", error);
    }
  };

  // Fetch user requests when address changes
  useEffect(() => {
    if (address) {
      fetchUserRequests();
    }
  }, [address, fetchUserRequests]);

  // Get request details for a specific request ID
  const { data: requestDetails } = useScaffoldReadContract({
    contractName: "LyraRamp",
    functionName: "getRampRequest",
    args: createdRequestId ? [BigInt(createdRequestId)] : [BigInt(0)],
  });

  // Get QR code data for the created request
  const { data: qrDataResult } = useScaffoldReadContract({
    contractName: "LyraRamp",
    functionName: "getQRCodeData",
    args: createdRequestId ? [BigInt(createdRequestId)] : [BigInt(0)],
  });

  // Update QR data when request is created
  useEffect(() => {
    if (qrDataResult && createdRequestId) {
      setQrData(qrDataResult as string);
    }
  }, [qrDataResult, createdRequestId]);

  // Update current request when details are fetched
  useEffect(() => {
    if (requestDetails && createdRequestId) {
      setCurrentRequest(requestDetails as any);
    }
  }, [requestDetails, createdRequestId]);

  const handleCreateRequest = async () => {
    if (!currency || !recipientName || !amount || !selectedChain) {
      alert("Please fill in all fields");
      return;
    }

    if (!isCorrectNetwork) {
      alert("Please switch to Scroll Sepolia network");
      return;
    }

    try {
      const result = await writeLyraRampAsync({
        functionName: "createRampRequest",
        args: [currency, recipientName, BigInt(amount), selectedChain],
      });

      console.log("Request created:", result);

      // Get the request ID from the transaction result
      const newRequestId = requestCounter ? Number(requestCounter) + 1 : 1;
      setCreatedRequestId(newRequestId);

      // Update user requests
      await fetchUserRequests();

      // Switch to requests tab to show QR code
      setActiveTab("requests");

      alert("Ramp request created successfully! QR code generated.");

      // Reset form
      setCurrency("MYR");
      setRecipientName("");
      setAmount("");
      setSelectedChain("polygon");
    } catch (error) {
      console.error("Error creating request:", error);
      alert("Failed to create request");
    }
  };

  const handleCompleteRequest = async () => {
    if (!requestId || !tokenAddress) {
      alert("Please fill in all fields");
      return;
    }

    if (!isCorrectNetwork) {
      alert("Please switch to Scroll Sepolia network");
      return;
    }

    try {
      const result = await writeLyraRampAsync({
        functionName: "completeRampRequest",
        args: [BigInt(requestId), tokenAddress as `0x${string}`],
      });

      console.log("Request completed:", result);
      alert("Ramp request completed successfully!");

      // Reset form
      setRequestId("");
      setTokenAddress("");

      // Refresh user requests
      await fetchUserRequests();
    } catch (error) {
      console.error("Error completing request:", error);
      alert("Failed to complete request");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Lyra Ramp Service</h1>

      {/* Network Status */}
      <div className="mb-6 text-center">
        {isCorrectNetwork ? (
          <div className="alert alert-success">
            <span>✅ Connected to Scroll Sepolia</span>
          </div>
        ) : (
          <div className="alert alert-warning">
            <span>⚠️ Please switch to Scroll Sepolia network</span>
          </div>
        )}
        <div className="text-sm text-gray-600 mt-2">
          Contract Address: <Address address="0xf750e0b6d4f6a1c0b0b3707cb2191b8b521c2797" />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-8">
        <div className="tabs tabs-boxed">
          <button
            className={`tab ${activeTab === "create" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("create")}
          >
            Create Request
          </button>
          <button
            className={`tab ${activeTab === "complete" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("complete")}
          >
            Complete Request
          </button>
          <button
            className={`tab ${activeTab === "requests" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("requests")}
          >
            View Requests
          </button>
        </div>
      </div>

      {/* Create Request Tab */}
      {activeTab === "create" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-base-200 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Create Ramp Request</h2>

            <div className="space-y-4">
              <div>
                <label className="label">
                  <span className="label-text">Currency</span>
                </label>
                <select
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                  className="select select-bordered w-full"
                >
                  <option value="MYR">MYR (Malaysian Ringgit)</option>
                  <option value="USD">USD (US Dollar)</option>
                  <option value="SGD">SGD (Singapore Dollar)</option>
                </select>
              </div>

              <div>
                <label className="label">
                  <span className="label-text">Recipient Name</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter recipient name"
                  value={recipientName}
                  onChange={e => setRecipientName(e.target.value)}
                  className="input input-bordered w-full"
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text">Amount</span>
                </label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="input input-bordered w-full"
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text">Selected Chain</span>
                </label>
                <select
                  value={selectedChain}
                  onChange={e => setSelectedChain(e.target.value)}
                  className="select select-bordered w-full"
                >
                  <option value="polygon">Polygon</option>
                  <option value="arbitrum">Arbitrum</option>
                  <option value="scroll">Scroll</option>
                  <option value="base">Base</option>
                </select>
              </div>

              <button
                onClick={handleCreateRequest}
                className="btn btn-primary w-full"
                disabled={!currency || !recipientName || !amount || !selectedChain || !isCorrectNetwork}
              >
                Create Request
              </button>
            </div>
          </div>

          <div className="bg-base-200 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Request Info</h2>
            <div className="space-y-2">
              <p>
                <strong>Total Requests:</strong> {requestCounter?.toString() || "0"}
              </p>
              {address && (
                <p>
                  <strong>Your Address:</strong> <Address address={address} />
                </p>
              )}
              <p>
                <strong>Current Network:</strong> {targetNetwork.name || "Not connected"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Complete Request Tab */}
      {activeTab === "complete" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-base-200 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Complete Ramp Request</h2>

            <div className="space-y-4">
              <div>
                <label className="label">
                  <span className="label-text">Request ID</span>
                </label>
                <input
                  type="number"
                  placeholder="Enter request ID"
                  value={requestId}
                  onChange={e => setRequestId(e.target.value)}
                  className="input input-bordered w-full"
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text">Token Address</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter token address (USDT/USDC)"
                  value={tokenAddress}
                  onChange={e => setTokenAddress(e.target.value)}
                  className="input input-bordered w-full"
                />
              </div>

              <button
                onClick={handleCompleteRequest}
                className="btn btn-primary w-full"
                disabled={!requestId || !tokenAddress || !isCorrectNetwork}
              >
                Complete Request
              </button>
            </div>
          </div>

          <div className="bg-base-200 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">How to Complete a Request</h2>
            <div className="space-y-4">
              <div className="alert alert-info">
                <span>📱 Scan QR Code</span>
              </div>
              <p>1. Ask the recipient for their QR code</p>
              <p>2. Scan the QR code with your wallet</p>
              <p>3. Enter the amount you want to send</p>
              <p>4. Choose your preferred stablecoin</p>
              <p>5. Complete the transaction</p>
            </div>
          </div>
        </div>
      )}

      {/* View Requests Tab */}
      {activeTab === "requests" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Request Details */}
          <div className="bg-base-200 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Request Details</h2>

            {currentRequest ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <p>
                      <strong>Request ID:</strong> {currentRequest.requestId}
                    </p>
                    <p>
                      <strong>Recipient:</strong> <Address address={currentRequest.recipient as `0x${string}`} />
                    </p>
                    <p>
                      <strong>Currency:</strong> {currentRequest.currency}
                    </p>
                    <p>
                      <strong>Recipient Name:</strong> {currentRequest.recipientName}
                    </p>
                  </div>
                  <div>
                    <p>
                      <strong>Amount:</strong> {currentRequest.amount}
                    </p>
                    <p>
                      <strong>USDT Equivalent:</strong> {currentRequest.usdtEquivalent}
                    </p>
                    <p>
                      <strong>Selected Chain:</strong> {currentRequest.selectedChain}
                    </p>
                    <p>
                      <strong>Status:</strong> {currentRequest.isCompleted ? "Completed" : "Pending"}
                    </p>
                  </div>
                </div>

                {currentRequest.isCompleted && (
                  <div className="alert alert-success">
                    <span>✅ This request has been completed!</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">No request selected</p>
                <p className="text-sm text-gray-500 mt-2">Create a new request or select from your recent requests</p>
              </div>
            )}
          </div>

          {/* QR Code */}
          <div className="bg-base-200 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Payment QR Code</h2>

            {qrData ? (
              <div className="space-y-4">
                <QRCodeGenerator data={qrData} />
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Share this QR code with the sender</p>
                  <p className="text-xs text-gray-500">The QR code contains the payment link for this request</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">No QR code available</p>
                <p className="text-sm text-gray-500 mt-2">Create a new request to generate a QR code</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600">
          Make sure you&apos;re connected to Scroll Sepolia network and have some test ETH
        </p>
        <p className="text-sm text-gray-600 mt-2">
          Get test ETH from:{" "}
          <a
            href="https://sepolia.scrollscan.com/faucet"
            target="_blank"
            rel="noopener noreferrer"
            className="link link-primary"
          >
            Scroll Sepolia Faucet
          </a>
        </p>
        <p className="text-sm text-gray-600 mt-2">
          View contract on:{" "}
          <a
            href="https://sepolia.scrollscan.com/address/0xf750e0b6d4f6a1c0b0b3707cb2191b8b521c2797"
            target="_blank"
            rel="noopener noreferrer"
            className="link link-primary"
          >
            ScrollScan
          </a>
        </p>
      </div>
    </div>
  );
}
