"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Youtube,
  Instagram,
  Radio,
  Music2,
  TrendingUp,
  CheckCircle2,
  LinkIcon,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

interface PlatformConnection {
  platform: string;
  connected: boolean;
  channelName?: string;
  subscribers?: number;
  lastSynced?: string;
  color: string;
}

interface PlatformConnectionsProps {
  connections?: PlatformConnection[];
}

export function PlatformConnections({ connections }: PlatformConnectionsProps) {
  const router = useRouter();
  const [connecting, setConnecting] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);

  // Default platforms to show
  const defaultPlatforms: PlatformConnection[] = [
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

  const platformsList = connections || defaultPlatforms;

  // Map platform names to icon components
  const getIcon = (platform: string) => {
    switch (platform) {
      case "YouTube":
        return Youtube;
      case "Instagram":
        return Instagram;
      case "Twitch":
        return Radio;
      case "TikTok":
        return Music2;
      default:
        return LinkIcon;
    }
  };

  const handleConnect = async (platform: string) => {
    setConnecting(platform);

    try {
      // Redirect to OAuth flow
      if (platform === "YouTube") {
        window.location.href = "/api/auth/youtube";
      } else if (platform === "Instagram") {
        window.location.href = "/api/auth/instagram";
      } else if (platform === "Twitch") {
        window.location.href = "/api/auth/twitch";
      } else if (platform === "TikTok") {
        window.location.href = "/api/auth/tiktok";
      } else {
        toast.info(`${platform} integration coming soon!`);
        setConnecting(null);
      }
    } catch (error) {
      toast.error(`Failed to connect to ${platform}`);
      setConnecting(null);
    }
  };

  const handleDisconnect = async (platform: string) => {
    try {
      const response = await fetch(`/api/auth/${platform.toLowerCase()}/disconnect`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to disconnect");
      }

      toast.success(`Disconnected from ${platform}`);
      window.location.reload();
    } catch (error) {
      toast.error(`Failed to disconnect from ${platform}`);
    }
  };

  const handleSync = async (platform: string) => {
    setSyncing(platform);

    // Platform-specific content type
    const contentType = platform === "YouTube" ? "videos" :
                       platform === "Instagram" ? "posts" :
                       platform === "Twitch" ? "streams" : "content";

    toast.loading(`Syncing ${platform} ${contentType}...`, { id: "sync" });

    try {
      const response = await fetch(`/api/sync/${platform.toLowerCase()}`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Sync failed");
      }

      // Use generic totalMedia or fallback to totalVideos for backward compatibility
      const totalCount = data.totalMedia || data.totalVideos || 0;
      toast.success(data.message || `Synced ${totalCount} ${contentType}`, {
        id: "sync",
        description: `${data.syncedCount} new, ${data.updatedCount} updated`,
      });

      // Refresh the page to show updated last synced time
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : `Failed to sync ${platform} ${contentType}`,
        { id: "sync" }
      );
    } finally {
      setSyncing(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LinkIcon className="h-5 w-5 text-primary" />
          Platform Connections
        </CardTitle>
        <CardDescription>
          Connect your social media accounts to enable Web2+Web3 analytics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {platformsList.map((platform) => {
          const Icon = getIcon(platform.platform);
          const isConnecting = connecting === platform.platform;

          return (
            <div
              key={platform.platform}
              className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-background border ${platform.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{platform.platform}</h4>
                    {platform.connected ? (
                      <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-500/20">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Connected
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        Not connected
                      </Badge>
                    )}
                  </div>
                  {platform.connected && platform.channelName && (
                    <div className="space-y-0.5">
                      <p className="text-sm text-muted-foreground">
                        {platform.channelName}
                      </p>
                      {platform.subscribers !== undefined && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {platform.subscribers.toLocaleString()} subscribers
                        </p>
                      )}
                      {platform.lastSynced && (
                        <p className="text-xs text-muted-foreground">
                          Last synced: {platform.lastSynced}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {platform.connected ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSync(platform.platform)}
                      disabled={syncing === platform.platform}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${syncing === platform.platform ? "animate-spin" : ""}`} />
                      {syncing === platform.platform ? "Syncing..." : "Sync"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDisconnect(platform.platform)}
                    >
                      Disconnect
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleConnect(platform.platform)}
                    disabled={isConnecting}
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <LinkIcon className="h-4 w-4 mr-2" />
                        Connect
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          );
        })}

        {/* Info banner */}
        <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20 mt-4">
          <AlertCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-primary mb-1">Why connect your platforms?</p>
            <p className="text-muted-foreground">
              See how your content across YouTube, Instagram, Twitch, and TikTok affects your token performance.
              Get insights like "Your Tuesday streams drive +15% token price increase."
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
