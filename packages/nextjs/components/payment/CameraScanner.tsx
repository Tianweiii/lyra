"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader, type IScannerControls } from "@zxing/browser";
import { Result } from "@zxing/library";
import { motion } from "framer-motion";

interface CameraScannerProps {
  onScanSuccess: (qrText: string) => void;
  balance: number;
  validationError: string;
}

type ScannerControls = typeof IScannerControls;

export const CameraScanner = ({ balance, onScanSuccess, validationError }: CameraScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [qrResult, setQrResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [controls, setControls] = useState<ScannerControls | null>(null);
  const [rate, setRate] = useState<number | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const codeReader = new BrowserQRCodeReader();
    let active = true;

    const startCamera = async () => {
      try {
        const videoInputDevices = await BrowserQRCodeReader.listVideoInputDevices();

        if (videoInputDevices.length === 0) {
          setError("No camera found.");
          return;
        }

        // Try to get back camera if available (based on device label)
        // let selectedDeviceId: string | undefined;
        const backCam = videoInputDevices.find((device: MediaDeviceInfo) =>
          /back|rear|environment/i.test(device.label),
        );

        const selectedDeviceId = backCam?.deviceId || videoInputDevices[0].deviceId;

        const previewElem = videoRef.current!;
        const scanControls = await codeReader.decodeFromVideoDevice(
          selectedDeviceId,
          previewElem,
          (result: Result | undefined, err: unknown, ctrl: ScannerControls) => {
            if (result && active) {
              const scannedText = result.getText();
              setQrResult(scannedText);

              ctrl.stop(); // stop scanning once result is found
              onScanSuccess(result.getText());
              setControls(null);
            }
          },
        );
        setControls(scanControls);
      } catch (err: any) {
        console.error("Camera error:", err);
        setError("Failed to access camera.");
      }
    };

    startCamera();

    return () => {
      active = false;
      if (controls) controls.stop();
    };
  }, [onScanSuccess]);
  // controls

  const handleScanAgain = () => {
    setQrResult(null);
    setError(null);
    if (!controls) window.location.reload();
  };

  useEffect(() => {
    const fetchRate = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_EXCHANGE_RATE_API}/USDT`);
        const data = await response.json();
        setRate(data.rates.MYR); // USDT to MYR rate
      } catch (error) {
        console.error("Error fetching rates:", error);
        setRate(4.68); // Fallback rate
      } finally {
        setLoading(false);
      }
    };

    fetchRate();
  }, []);

  const convertedAmount = rate ? (balance / rate).toFixed(2) : "--";

  const fadeUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <div className="flex flex-col items-center">
      {/* Balance info */}
      <motion.div {...fadeUp} className="space-y-3 w-full max-w-xl mb-5">
        <h2 className="text-lg md:text-xl font-bold text-white/80">Balance in Wallet</h2>

        <div className="w-full flex flex-row items-center justify-between p-4 rounded-xl bg-black/10 border border-gray-500/40 gap-4 text-sm md:text-base">
          <div className="flex-1 min-w-0">
            <div className="flex flex-col">
              <span className="text-gray-400">MYR</span>
              <span className="text-white font-sm md:text-lg text whitespace-nowrap overflow-hidden text-ellipsis">
                RM {balance.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="w-px bg-gray-500/40 h-10 mx-2"></div>

          <div className="flex-1 min-w-0 text-right">
            <div className="flex flex-col items-end">
              <span className="text-gray-400">Equivalent (USD)</span>
              {loading ? (
                <span className="text-gray-500 md:text-lg text">Loading...</span>
              ) : (
                <span className="text-white font-medium md:text-lg text whitespace-nowrap overflow-hidden text-ellipsis">
                  ~ {convertedAmount}
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* <motion.div {...fadeUp} className="space-y-3">
        <h2 className="text-lg md:text-xl font-bold text-white/80">Balance in Wallet</h2>

        <div className="flex flex-row items-center justify-between p-4 rounded-xl bg-black/10 border border-gray-500/40 gap-4 text-sm md:text-base">
          <div className="flex-1 min-w-0">
            <div className="flex flex-col">
              <span className="text-gray-400">MYR</span>
              <span className="text-white font-sm md:text-lg text whitespace-nowrap overflow-hidden text-ellipsis">
                RM {balance.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="w-px bg-gray-500/40 h-10 mx-2"></div>

          <div className="flex-1 min-w-0 text-right">
            <div className="flex flex-col items-end">
              <span className="text-gray-400">Equivalent (USD)</span>
              {loading ? (
                <span className="text-gray-500 md:text-lg text">Loading...</span>
              ) : (
                <span className="text-white font-medium md:text-lg text whitespace-nowrap overflow-hidden text-ellipsis">
                  ~ {convertedAmount}
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div> */}
      <div className="w-72 h-72 md:w-90 md:h-90 border-4 border-green-500 rounded-xl overflow-hidden shadow-lg">
        {error ? (
          <div className="w-full h-full flex items-center justify-center text-red-500">{error}</div>
        ) : (
          <video ref={videoRef} className="w-full h-full object-cover" muted playsInline autoPlay />
        )}
      </div>

      {qrResult ? (
        <div className="mt-4 text-center">
          <p className="text-green-400 font-bold">
            QR Code:{" "}
            <a href={qrResult} target="_blank" rel="noopener noreferrer">
              {qrResult}
            </a>
          </p>
          {validationError && <p className="mt-2 text-red-500 font-medium">{validationError}</p>}
          <button onClick={handleScanAgain} className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Scan Again
          </button>
        </div>
      ) : (
        <p className="mt-4 text-gray-400">Scanning for QR code...</p>
      )}
    </div>
  );
};
