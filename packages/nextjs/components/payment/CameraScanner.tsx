"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader, type IScannerControls } from "@zxing/browser";

interface CameraScannerProps {
  onScanSuccess: (qrText: string) => void;
}

export const CameraScanner = ({ onScanSuccess }: CameraScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [qrResult, setQrResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [controls, setControls] = useState<IScannerControls | null>(null);

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
        const backCam = videoInputDevices.find(device => /back|rear|environment/i.test(device.label));

        const selectedDeviceId = backCam?.deviceId || videoInputDevices[0].deviceId;

        const previewElem = videoRef.current!;
        const scanControls = await codeReader.decodeFromVideoDevice(
          selectedDeviceId,
          previewElem,
          (result, err, ctrl) => {
            if (result && active) {
              setQrResult(result.getText());
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
  }, [onScanSuccess, controls]);

  const handleScanAgain = () => {
    setQrResult(null);
    setError(null);
    if (!controls) window.location.reload();
  };

  return (
    <div className="flex flex-col items-center">
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
