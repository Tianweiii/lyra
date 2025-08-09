"use client";

import { useEffect, useState } from "react";
import { checkSubscriptionStatus, sendNotification, subscribeUser } from "../app/action";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Helper function to send payment notification
export async function sendPaymentNotification(merchantIdentifier: string, amount: number, paymentRef: string) {
  try {
    const message = `💰 Payment received: ${amount} LYRA - Ref: ${paymentRef}`;

    // Try to send notification by wallet address first, then fallback to endpoint
    const result = await sendNotification(message, undefined, merchantIdentifier);

    if (!result.success) {
      // Fallback: try as endpoint if wallet address lookup failed
      const fallbackResult = await sendNotification(message, merchantIdentifier);
      return fallbackResult;
    }

    return result;
  } catch (error) {
    console.error("Error sending payment notification:", error);
    return { success: false, error: "Failed to send notification" };
  }
}

export function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [, setSubscription] = useState<PushSubscription | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      initializeSubscription();
    } else {
      setIsLoading(false);
    }
  }, []);

  async function initializeSubscription() {
    try {
      setStatus("Checking subscription status...");

      // Register service worker
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
        updateViaCache: "none",
      });

      // Check if user has an existing subscription
      const existingSubscription = await registration.pushManager.getSubscription();
      setSubscription(existingSubscription);

      if (existingSubscription) {
        // Check if this subscription is still active in our database
        const statusCheck = await checkSubscriptionStatus(existingSubscription.endpoint);
        if (statusCheck.success && statusCheck.subscribed) {
          setIsSubscribed(true);
          setStatus("You are subscribed to payment notifications!");
        } else {
          setIsSubscribed(false);
          setStatus("Subscription exists but is not active in database");
        }
      } else {
        setIsSubscribed(false);
        setStatus("Not subscribed to payment notifications");
      }
    } catch (error) {
      console.error("Error initializing subscription:", error);
      setStatus("Failed to initialize subscription");
    } finally {
      setIsLoading(false);
    }
  }

  async function subscribeToPush() {
    try {
      setIsLoading(true);
      setStatus("Requesting notification permission...");

      // Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus("Notification permission denied");
        return;
      }

      setStatus("Creating subscription...");
      const registration = await navigator.serviceWorker.ready;

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
      });

      setSubscription(sub);

      setStatus("Saving subscription to database...");
      const result = await subscribeUser(sub);

      if (result.success) {
        setIsSubscribed(true);
        setStatus(result.message || "Successfully subscribed to payment notifications!");
      } else {
        setStatus("Failed to subscribe: " + result.error);
        // Clean up the browser subscription if database save failed
        await sub.unsubscribe();
        setSubscription(null);
      }
    } catch (error) {
      console.error("Error subscribing:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setStatus("Error subscribing: " + errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  // Don't render if not supported
  if (!isSupported) {
    return null;
  }

  // Don't render if loading
  if (isLoading) {
    return null;
  }

  // Show notification status
  if (isSubscribed) {
    return (
      <div className="bg-black/70 backdrop-blur-sm rounded-lg p-4 text-white max-w-sm mt-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <p className="text-sm">Payment notifications enabled</p>
          </div>

          <div className="text-xs text-gray-300 bg-green-900/30 p-3 rounded">
            <p className="font-medium mb-1">💰 You&apos;ll be notified when:</p>
            <ul className="space-y-1">
              <li>• Payments are received</li>
              <li>• Transaction status updates</li>
              <li>• Important account alerts</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/70 backdrop-blur-sm rounded-lg p-4 text-white max-w-sm mt-4">
      <h3 className="text-lg font-bold mb-2">🔔 Enable Payment Notifications</h3>

      {status && (
        <div
          className={`mb-3 text-xs p-2 rounded ${
            status.includes("Error") || status.includes("Failed")
              ? "bg-red-900/50 text-red-200"
              : status.includes("Success")
                ? "bg-green-900/50 text-green-200"
                : "bg-blue-900/50 text-blue-200"
          }`}
        >
          {status}
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <p className="text-sm">Payment notifications disabled</p>
        </div>

        <button
          onClick={subscribeToPush}
          disabled={isLoading}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-3 py-2 rounded text-sm font-medium transition-colors"
        >
          {isLoading ? "Enabling..." : "🔔 Enable Payment Notifications"}
        </button>

        <p className="text-xs text-gray-400">
          Get instant notifications when you receive payments and important updates from LyraStudios.
        </p>
      </div>
    </div>
  );
}

export function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isSafari, setIsSafari] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [debugInfo, setDebugInfo] = useState<string>("");

  useEffect(() => {
    const userAgent = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream);
    setIsSafari(/Safari/.test(userAgent) && !/Chrome/.test(userAgent));
    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);

    // Debug info
    setDebugInfo(`User Agent: ${userAgent}, Standalone: ${isStandalone}, Safari: ${isSafari}, iOS: ${isIOS}`);

    const handleBeforeInstallPrompt = (e: any) => {
      console.log("beforeinstallprompt event fired!", e);
      e.preventDefault();
      setDeferredPrompt(e);
      setDebugInfo(prev => prev + " - Install prompt available");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        console.log("Install choice result:", choiceResult);
        if (choiceResult.outcome === "accepted") {
          setDeferredPrompt(null);
          setDebugInfo(prev => prev + " - Install accepted");
        } else {
          setDebugInfo(prev => prev + " - Install declined");
        }
      } catch (error) {
        console.error("Error during install:", error);
        setDebugInfo(prev => prev + " - Install error: " + error);
      }
    }
  };

  // Hide if already installed (standalone mode)
  if (isStandalone) {
    return null;
  }

  // Show for Safari on macOS even if no deferredPrompt
  const shouldShow = deferredPrompt || isIOS || (isSafari && !isStandalone);

  if (!shouldShow) {
    return (
      <div className="bg-black/70 backdrop-blur-sm rounded-lg p-4 text-white max-w-sm mt-4">
        <h3 className="text-lg font-bold mb-2">📱 Install App</h3>
        <div className="text-xs text-gray-300 bg-yellow-900/30 p-3 rounded">
          <p className="font-medium mb-1">Debug Info:</p>
          <p className="break-all">{debugInfo}</p>
          <p className="mt-2">Install prompt not available. Try refreshing the page or using a different browser.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/70 backdrop-blur-sm rounded-lg p-4 text-white max-w-sm mt-4">
      <h3 className="text-lg font-bold mb-2">📱 Install App</h3>

      {deferredPrompt && (
        <button
          onClick={handleInstallClick}
          className="w-full bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-sm font-medium mb-3 transition-colors"
        >
          ⬇️ Install LyraStudios
        </button>
      )}

      {isIOS && (
        <div className="text-xs text-gray-300 bg-blue-900/30 p-3 rounded">
          <p className="font-medium mb-1">📱 Install on iOS:</p>
          <p>
            1. Tap the Share button <span className="font-mono bg-black/50 px-1 rounded">⎋</span>
          </p>
          <p>
            2. Select &quot;Add to Home Screen&quot; <span className="font-mono bg-black/50 px-1 rounded">➕</span>
          </p>
        </div>
      )}

      {isSafari && !isIOS && (
        <div className="text-xs text-gray-300 bg-blue-900/30 p-3 rounded">
          <p className="font-medium mb-1">🖥️ Install on macOS Safari:</p>
          <p>
            1. Click &quot;Share&quot; in the Safari toolbar{" "}
            <span className="font-mono bg-black/50 px-1 rounded">⎋</span>
          </p>
          <p>
            2. Select &quot;Add to Dock&quot; or &quot;Add to Applications&quot;{" "}
            <span className="font-mono bg-black/50 px-1 rounded">➕</span>
          </p>
          <p className="mt-2 text-yellow-300">
            Note: Safari on macOS may not show the install prompt automatically. Use the Share menu instead.
          </p>
        </div>
      )}

      {/* Debug info for development */}
      {process.env.NODE_ENV === "development" && (
        <div className="text-xs text-gray-400 mt-2 p-2 bg-gray-900/30 rounded">
          <p className="font-medium">Debug:</p>
          <p className="break-all text-xs">{debugInfo}</p>
        </div>
      )}
    </div>
  );
}
