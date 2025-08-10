"use server";

import webpush from "web-push";

webpush.setVapidDetails(
  "mailto:zhongchengteh@gmail.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

// Simplified subscription function without database
export async function subscribeUser(sub: PushSubscription) {
  try {
    console.log("Subscription received:", sub.endpoint);
    return { success: true, key: sub.endpoint, message: "Successfully subscribed!" };
  } catch (error) {
    console.error("Error subscribing user:", error);
    return { success: false, error: "Failed to subscribe" };
  }
}

// Simplified notification sending without database
export async function sendNotification(message: string, targetEndpoint?: string, walletAddress?: string) {
  try {
    // For now, just log the notification attempt
    console.log("Notification attempt:", { message, targetEndpoint, walletAddress });

    return {
      success: true,
      message: "Notification logged (database not configured)",
    };
  } catch (error) {
    console.error("Error sending push notification:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send notification",
    };
  }
}

// Simplified subscription status check
export async function checkSubscriptionStatus(endpoint: string) {
  try {
    // For now, assume subscription is active if endpoint exists
    return {
      success: true,
      subscribed: !!endpoint,
      exists: !!endpoint,
    };
  } catch (error) {
    console.error("Error checking subscription status:", error);
    return { success: false, error: "Failed to check subscription status" };
  }
}
