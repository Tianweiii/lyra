"use server";

import { headers } from "next/headers";
import { supabaseAdmin } from "../../../lib/forge-std/supabase";
import webpush from "web-push";

webpush.setVapidDetails(
  "mailto:zhongchengteh@gmail.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

export async function subscribeUser(sub: PushSubscription) {
  try {
    const subscriptionData = JSON.parse(JSON.stringify(sub));
    const headersList = headers();
    const userAgent = (await headersList).get("user-agent") || "";
    const forwardedFor = (await headersList).get("x-forwarded-for");
    const realIp = (await headersList).get("x-real-ip");
    const ipAddress = forwardedFor?.split(",")[0] || realIp || "";

    // Extract the keys from the subscription
    const { endpoint, keys } = subscriptionData;
    const { p256dh, auth } = keys;

    // Check if subscription already exists
    const { data: existingSubscription } = await supabaseAdmin
      .from("push_subscriptions")
      .select("id, is_active")
      .eq("endpoint", endpoint)
      .single();

    if (existingSubscription) {
      // Reactivate existing subscription if it was deactivated
      if (!existingSubscription.is_active) {
        const { error: updateError } = await supabaseAdmin
          .from("push_subscriptions")
          .update({
            is_active: true,
            updated_at: new Date().toISOString(),
            user_agent: userAgent,
          })
          .eq("id", existingSubscription.id);

        if (updateError) {
          console.error("Error reactivating subscription:", updateError);
          return { success: false, error: "Failed to reactivate subscription" };
        }
      }

      return { success: true, key: endpoint, message: "Subscription already exists and is active" };
    }

    // Insert new subscription
    const { data: newSubscription, error: insertError } = await supabaseAdmin
      .from("push_subscriptions")
      .insert({
        endpoint,
        p256dh,
        auth,
        user_agent: userAgent,
        ip_address: ipAddress,
        is_active: true,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting subscription:", insertError);
      return { success: false, error: "Failed to save subscription" };
    }

    console.log("New subscription created:", newSubscription.id);

    return { success: true, key: endpoint, message: "Successfully subscribed!" };
  } catch (error) {
    console.error("Error subscribing user:", error);
    return { success: false, error: "Failed to subscribe" };
  }
}

// New function to associate wallet address with push subscription
export async function associateWalletWithSubscription(endpoint: string, walletAddress: string) {
  try {
    const { error: updateError } = await supabaseAdmin
      .from("push_subscriptions")
      .update({
        wallet_address: walletAddress.toLowerCase(),
        updated_at: new Date().toISOString(),
      })
      .eq("endpoint", endpoint);

    if (updateError) {
      console.error("Error associating wallet with subscription:", updateError);
      return { success: false, error: "Failed to associate wallet" };
    }

    console.log("Wallet associated with subscription:", walletAddress);
    return { success: true, message: "Wallet associated successfully!" };
  } catch (error) {
    console.error("Error associating wallet:", error);
    return { success: false, error: "Failed to associate wallet" };
  }
}

// New function to get subscription endpoint by wallet address
export async function getSubscriptionByWallet(walletAddress: string) {
  try {
    const { data: subscription, error } = await supabaseAdmin
      .from("push_subscriptions")
      .select("endpoint, is_active")
      .eq("wallet_address", walletAddress.toLowerCase())
      .eq("is_active", true)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching subscription by wallet:", error);
      return { success: false, error: "Failed to fetch subscription" };
    }

    return {
      success: true,
      endpoint: subscription?.endpoint || null,
      exists: !!subscription,
    };
  } catch (error) {
    console.error("Error getting subscription by wallet:", error);
    return { success: false, error: "Failed to get subscription" };
  }
}

export async function unsubscribeUser(endpoint?: string) {
  try {
    if (!endpoint) {
      return { success: false, error: "Endpoint required for unsubscription" };
    }

    // Soft delete - mark as inactive instead of deleting
    const { error: updateError } = await supabaseAdmin
      .from("push_subscriptions")
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq("endpoint", endpoint);

    if (updateError) {
      console.error("Error unsubscribing user:", updateError);
      return { success: false, error: "Failed to unsubscribe" };
    }

    console.log("Subscription deactivated:", endpoint);
    return { success: true, message: "Successfully unsubscribed!" };
  } catch (error) {
    console.error("Error unsubscribing user:", error);
    return { success: false, error: "Failed to unsubscribe" };
  }
}

export async function sendNotification(message: string, targetEndpoint?: string, walletAddress?: string) {
  try {
    let query = supabaseAdmin.from("push_subscriptions").select("*").eq("is_active", true);

    // If targeting specific endpoint, add that filter
    if (targetEndpoint) {
      query = query.eq("endpoint", targetEndpoint);
    }

    // If targeting by wallet address, add that filter
    if (walletAddress && !targetEndpoint) {
      query = query.eq("wallet_address", walletAddress.toLowerCase());
    }

    const { data: subscriptions, error: fetchError } = await query;

    if (fetchError) {
      console.error("Error fetching subscriptions:", fetchError);
      return { success: false, error: "Failed to fetch subscriptions" };
    }

    if (!subscriptions || subscriptions.length === 0) {
      return {
        success: false,
        error:
          targetEndpoint || walletAddress
            ? "No active subscription found for this user"
            : "No active subscriptions found. Please subscribe first.",
      };
    }

    const results = [];
    const failedEndpoints = [];

    for (const subscription of subscriptions) {
      try {
        // Reconstruct the subscription object for web-push
        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth,
          },
        };

        await webpush.sendNotification(
          pushSubscription,
          JSON.stringify({
            title: "LyraStudios Notification",
            body: message,
            icon: "/images/lyra-192x192.png",
            badge: "/images/lyra-192x192.png",
            timestamp: Date.now(),
            data: {
              url: "/", // URL to open when notification is clicked
            },
          }),
        );

        results.push({ endpoint: subscription.endpoint, success: true });
      } catch (error) {
        console.error(`Failed to send notification to ${subscription.endpoint}:`, error);
        results.push({
          endpoint: subscription.endpoint,
          success: false,
          error: error instanceof Error ? error.message : String(error),
        });
        failedEndpoints.push(subscription.endpoint);
      }
    }

    // Deactivate subscriptions that failed with certain errors (like expired subscriptions)
    if (failedEndpoints.length > 0) {
      await supabaseAdmin.from("push_subscriptions").update({ is_active: false }).in("endpoint", failedEndpoints);
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`Notifications sent: ${successful} successful, ${failed} failed`);

    return {
      success: successful > 0,
      results,
      message: `Sent to ${successful} subscription(s)${failed > 0 ? `, ${failed} failed` : ""}`,
    };
  } catch (error) {
    console.error("Error sending push notification:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send notification",
    };
  }
}

// Helper function to get subscription statistics
export async function getSubscriptionStats() {
  try {
    const { count: totalCount } = await supabaseAdmin
      .from("push_subscriptions")
      .select("*", { count: "exact", head: true });

    const { count: activeCount } = await supabaseAdmin
      .from("push_subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);

    return {
      success: true,
      total: totalCount || 0,
      active: activeCount || 0,
      inactive: (totalCount || 0) - (activeCount || 0),
    };
  } catch (error) {
    console.error("Error fetching subscription stats:", error);
    return { success: false, error: "Failed to fetch stats" };
  }
}

// Helper function to check if a user is subscribed
export async function checkSubscriptionStatus(endpoint: string) {
  try {
    const { data: subscription, error } = await supabaseAdmin
      .from("push_subscriptions")
      .select("is_active")
      .eq("endpoint", endpoint)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "not found"
      console.error("Error checking subscription status:", error);
      return { success: false, error: "Failed to check subscription status" };
    }

    return {
      success: true,
      subscribed: !!subscription?.is_active,
      exists: !!subscription,
    };
  } catch (error) {
    console.error("Error checking subscription status:", error);
    return { success: false, error: "Failed to check subscription status" };
  }
}
