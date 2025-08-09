"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";

interface QRCodeGeneratorProps {
  data: string;
  size?: number;
  className?: string;
}

export default function QRCodeGenerator({ data, size = 200, className = "" }: QRCodeGeneratorProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [error, setError] = useState<string>("");

  const generateQRCode = useCallback(async () => {
    try {
      const url = await QRCode.toDataURL(data, {
        width: size,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
      setQrCodeUrl(url);
      setError("");
    } catch (err) {
      setError("Failed to generate QR code");
      console.error("QR Code generation error:", err);
    }
  }, [data, size]);

  useEffect(() => {
    if (data) {
      generateQRCode();
    }
  }, [generateQRCode, data]);

  const downloadQRCode = () => {
    if (qrCodeUrl) {
      const link = document.createElement("a");
      link.download = "lyra-ramp-qr.png";
      link.href = qrCodeUrl;
      link.click();
    }
  };

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      {qrCodeUrl && (
        <>
          <Image
            src={qrCodeUrl}
            alt="QR Code"
            width={size}
            height={size}
            className="border-2 border-gray-300 rounded-lg"
          />
          <button onClick={downloadQRCode} className="btn btn-primary btn-sm">
            Download QR Code
          </button>
        </>
      )}
    </div>
  );
}
