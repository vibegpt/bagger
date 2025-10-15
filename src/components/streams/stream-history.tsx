"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Video, Clock, Users, Eye, ExternalLink, TrendingUp, Calendar } from "lucide-react";
import { format } from "date-fns";

interface TokenSnapshot {
  id: string;
  snapshotType: string;
  snapshotTime: string;
  marketCap: string;
  price: string;
  volume24h: string;
  holderCount: number | null;
  priceChange1h: string | null;
  priceChange24h: string | null;
}

interface StreamSession {
  id: string;
  platform: string;
  platformUrl: string | null;
  title: string | null;
  description: string | null;
  category: string | null;
  startedAt: string;
  endedAt: string | null;
  durationMinutes: number | null;
  peakViewers: number | null;
  averageViewers: number | null;
  totalViews: number | null;
  relatedTokenMint: string | null;
  relatedTokenAddress: string | null;
  source: string;
  tokenSnapshots: TokenSnapshot[];
}

export function StreamHistory() {
  const [streams, setStreams] = useState<StreamSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStreams();
  }, []);

  const fetchStreams = async () => {
    try {
      const response = await fetch('/api/streams/log');
      const data = await response.json();

      if (data.success) {
        setStreams(data.data);
      }
    } catch (error) {
      console.error('Error fetching streams:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      pumpfun: "bg-purple-500/20 text-purple-400",
      zora: "bg-blue-500/20 text-blue-400",
      youtube: "bg-red-500/20 text-red-400",
      twitch: "bg-violet-500/20 text-violet-400",
      kick: "bg-green-500/20 text-green-400",
    };
    return colors[platform] || "bg-gray-500/20 text-gray-400";
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            Loading stream history...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (streams.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Stream History</CardTitle>
          <CardDescription>No streams logged yet</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Log your first stream to start tracking performance metrics and token correlations.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stream History</CardTitle>
        <CardDescription>
          Your recent streaming sessions and their performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {streams.map((stream) => (
            <div
              key={stream.id}
              className="border rounded-lg p-4 space-y-3 hover:bg-accent/50 transition-colors"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={getPlatformColor(stream.platform)}>
                      {stream.platform}
                    </Badge>
                    {stream.source === 'manual' && (
                      <Badge variant="outline" className="text-xs">
                        Manual
                      </Badge>
                    )}
                  </div>
                  <h4 className="font-semibold text-sm">
                    {stream.title || "Untitled Stream"}
                  </h4>
                  {stream.category && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {stream.category}
                    </p>
                  )}
                </div>
                {stream.platformUrl && (
                  <a
                    href={stream.platformUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>

              {/* Description */}
              {stream.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {stream.description}
                </p>
              )}

              {/* Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs">
                    {format(new Date(stream.startedAt), "MMM d, h:mm a")}
                  </span>
                </div>

                {stream.durationMinutes && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs">
                      {formatDuration(stream.durationMinutes)}
                    </span>
                  </div>
                )}

                {stream.peakViewers !== null && (
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs">
                      {stream.peakViewers.toLocaleString()} peak
                    </span>
                  </div>
                )}

                {stream.totalViews !== null && (
                  <div className="flex items-center gap-2 text-sm">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs">
                      {stream.totalViews.toLocaleString()} views
                    </span>
                  </div>
                )}
              </div>

              {/* Associated Tokens */}
              {(stream.relatedTokenMint || stream.relatedTokenAddress) && (
                <div className="pt-2 border-t">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3" />
                    <span>Associated with:</span>
                    {stream.relatedTokenMint && (
                      <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                        {stream.relatedTokenMint.slice(0, 8)}...
                      </code>
                    )}
                    {stream.relatedTokenAddress && (
                      <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                        {stream.relatedTokenAddress.slice(0, 8)}...
                      </code>
                    )}
                  </div>

                  {/* Token Snapshots */}
                  {stream.tokenSnapshots.length > 0 && (
                    <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      {stream.tokenSnapshots.map((snapshot) => (
                        <div
                          key={snapshot.id}
                          className="bg-muted/50 rounded p-2"
                        >
                          <div className="font-medium text-xs mb-1">
                            {snapshot.snapshotType.replace(/_/g, ' ')}
                          </div>
                          <div className="text-muted-foreground">
                            ${parseFloat(snapshot.price).toFixed(6)}
                          </div>
                          {snapshot.priceChange24h && (
                            <div className={parseFloat(snapshot.priceChange24h) >= 0 ? "text-green-500" : "text-red-500"}>
                              {parseFloat(snapshot.priceChange24h) >= 0 ? "+" : ""}
                              {parseFloat(snapshot.priceChange24h).toFixed(2)}%
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
