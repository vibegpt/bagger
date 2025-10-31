import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { PlatformConnections } from "./platform-connections";

/**
 * Server component that fetches user's platform connections
 * and passes them to the client component
 */
export async function PlatformConnectionsServer() {
  try {
    // Get current user from Clerk
    const clerkUser = await currentUser();

    if (!clerkUser) {
      // User not authenticated - show default state
      return <PlatformConnections />;
    }

    // Find user in database
    const user = await db.user.findUnique({
      where: { clerkId: clerkUser.id },
      include: {
        platformConnections: {
          where: {
            platform: {
              in: ["youtube", "instagram", "twitch", "tiktok"],
            },
          },
        },
      },
    });

    if (!user) {
      // User not in database yet - show default state
      return <PlatformConnections />;
    }

    // Map database connections to component props
    const connections = [
      {
        platform: "YouTube",
        connected: false,
        color: "text-red-500",
      },
      {
        platform: "Instagram",
        connected: false,
        color: "text-pink-500",
      },
      {
        platform: "Twitch",
        connected: false,
        color: "text-purple-500",
      },
      {
        platform: "TikTok",
        connected: false,
        color: "text-cyan-500",
      },
    ];

    // Update with actual connection data
    user.platformConnections.forEach((conn) => {
      console.log('Platform connection found:', {
        platform: conn.platform,
        syncStatus: conn.syncStatus,
        channelName: conn.youtubeChannelName,
        subscribers: conn.youtubeSubscribers
      });

      if (conn.platform === "youtube") {
        const youtubeConnection = connections.find((c) => c.platform === "YouTube");
        if (youtubeConnection) {
          youtubeConnection.connected = conn.syncStatus === "active";
          youtubeConnection.channelName = conn.youtubeChannelName ?? undefined;
          youtubeConnection.subscribers = conn.youtubeSubscribers ?? undefined;
          youtubeConnection.lastSynced = conn.lastSyncedAt
            ? new Date(conn.lastSyncedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : undefined;
        }
        console.log('YouTube connection updated:', youtubeConnection);
      } else if (conn.platform === "instagram") {
        const instaConnection = connections.find((c) => c.platform === "Instagram");
        if (instaConnection) {
          instaConnection.connected = conn.syncStatus === "active";
          instaConnection.channelName = `@${conn.instagramUsername}` ?? undefined;
          instaConnection.subscribers = conn.instagramFollowers ?? undefined;
          instaConnection.lastSynced = conn.lastSyncedAt
            ? new Date(conn.lastSyncedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : undefined;
        }
      } else if (conn.platform === "twitch") {
        const twitchConnection = connections.find((c) => c.platform === "Twitch");
        if (twitchConnection) {
          twitchConnection.connected = conn.syncStatus === "active";
          twitchConnection.channelName = conn.tiktokUsername ?? undefined; // Re-using field
          twitchConnection.subscribers = conn.tiktokFollowers ?? undefined; // Re-using field
          twitchConnection.lastSynced = conn.lastSyncedAt
            ? new Date(conn.lastSyncedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : undefined;
        }
      } else if (conn.platform === "tiktok") {
        const tiktokConnection = connections.find((c) => c.platform === "TikTok");
        if (tiktokConnection) {
          tiktokConnection.connected = conn.syncStatus === "active";
          tiktokConnection.channelName = conn.tiktokUsername ?? undefined;
          tiktokConnection.subscribers = conn.tiktokFollowers ?? undefined;
          tiktokConnection.lastSynced = conn.lastSyncedAt
            ? new Date(conn.lastSyncedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : undefined;
        }
      }
    });

    return <PlatformConnections connections={connections} />;
  } catch (error) {
    console.error("Error fetching platform connections:", error);
    // Show default state on error
    return <PlatformConnections />;
  }
}
