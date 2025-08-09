"use client";

import { useEffect, useState } from "react";
import { CheckCircleIcon, ClockIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { SecurityCheckResult, checkAddressSecurity, getSecurityRisks, isAddressSuspicious } from "~~/utils/security";

interface SecurityCheckProps {
  address: string;
  chainId?: string;
  onSecurityUpdate?: (isSuspicious: boolean, risks: Array<{ key: string; label: string; value: string }>) => void;
}

export const SecurityCheck: React.FC<SecurityCheckProps> = ({ address, chainId = "137", onSecurityUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SecurityCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (address && /^0x[a-fA-F0-9]{40}$/.test(address)) {
      checkSecurity();
    } else {
      setResult(null);
      setError(null);
      setChecked(false);
    }
  }, [address, chainId]);

  const checkSecurity = async () => {
    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      setError("Invalid address format");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await checkAddressSecurity(address, chainId);

      if (response.success && response.data) {
        setResult(response.data);
        const risks = getSecurityRisks(response.data);
        const isSuspicious = isAddressSuspicious(response.data);

        if (onSecurityUpdate) {
          onSecurityUpdate(isSuspicious, risks);
        }

        setChecked(true);
      } else {
        setError(response.error || "Check Failure");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown Error");
    } finally {
      setLoading(false);
    }
  };

  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
        <ClockIcon className="h-5 w-5 animate-spin" />
        <span className="text-sm">Checking address security...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
        <ExclamationTriangleIcon className="h-5 w-5" />
        <span className="text-sm">{error}</span>
        <button onClick={checkSecurity} className="ml-auto text-sm underline hover:no-underline">
          Retry
        </button>
      </div>
    );
  }

  if (!checked || !result) {
    return (
      <div className="flex items-center gap-2 text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">
        <ClockIcon className="h-5 w-5" />
        <span className="text-sm">Waiting for security check...</span>
      </div>
    );
  }

  const risks = getSecurityRisks(result);
  const isSuspicious = isAddressSuspicious(result);

  if (isSuspicious) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-700 mb-3">
          <ExclamationTriangleIcon className="h-6 w-6" />
          <span className="font-semibold">⚠️ Security Risk Detected</span>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-red-600 mb-2">This address has the following security risks:</p>
          <ul className="list-disc list-inside space-y-1">
            {risks.map((risk, index) => (
              <li key={index} className="text-sm text-red-600">
                {risk.label}
              </li>
            ))}
          </ul>
          <p className="text-xs text-red-500 mt-3">Please verify the address before sending.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">
      <CheckCircleIcon className="h-5 w-5" />
      <span className="text-sm">✅ Address security check passed</span>
    </div>
  );
};
