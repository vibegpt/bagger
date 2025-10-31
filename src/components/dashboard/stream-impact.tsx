"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Play,
  TrendingUp,
  TrendingDown,
  Zap,
  Users,
  Activity,
  Clock,
  Trophy,
  Sparkles,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface StreamImpact {
  streamId: string;
  title?: string;
  startedAt: Date;
  endedAt?: Date;
  durationMinutes?: number;
  priceChange: number;
  priceChangeAbsolute: number;
  volumeChange: number;
  holderChange: number;
  marketCapChange: number;
  marketCapChangeAbsolute: number;
  confidenceScore: number;
  comparisonToPrevious?: {
    priceImprovementPercent: number;
    volumeImprovementPercent: number;
    description: string;
  };
  postStream24h?: {
    priceChange: number;
    volumeChange: number;
  };
}

interface StreamImpactProps {
  limit?: number;
}

export function StreamImpact({ limit = 5 }: StreamImpactProps) {
  const [streams, setStreams] = useState<StreamImpact[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStreamId, setActiveStreamId] = useState<string | null>(null);

  const fetchStreams = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/stream/track?limit=${limit}`);
      const data = await response.json();

      if (data.success) {
        setStreams(data.streams);
      }
    } catch (error) {
      console.error('Error fetching stream analytics:', error);
      toast.error('Failed to load stream analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStreams();
  }, []);

  const formatNumber = (num: number) => {
    if (Math.abs(num) >= 1000000) {
      return `$${(num / 1000000).toFixed(2)}M`;
    }
    if (Math.abs(num) >= 1000) {
      return `$${(num / 1000).toFixed(1)}K`;
    }
    return `$${num.toFixed(2)}`;
  };

  const formatPercentage = (num: number) => {
    return `${num > 0 ? '+' : ''}${num.toFixed(1)}%`;
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-primary" />
            Live Stream Impact
          </CardTitle>
          <CardDescription>
            Loading stream analytics...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <Activity className="h-8 w-8 animate-pulse text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (streams.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-primary" />
            Live Stream Impact
          </CardTitle>
          <CardDescription>
            Track how your streams affect token performance in real-time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Zap className="h-16 w-16 text-muted-foreground/20 mb-4" />
            <h3 className="text-lg font-medium mb-2">No streams tracked yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-4">
              Start tracking your streams to see real-time token impact metrics like price movement,
              volume changes, and holder growth.
            </p>
            <Button variant="outline">
              <Play className="h-4 w-4 mr-2" />
              Start Tracking Stream
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get the most recent stream for highlight
  const latestStream = streams[0];

  return (
    <div className="space-y-6">
      {/* Latest Stream Highlight */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Latest Stream Impact
              </CardTitle>
              <CardDescription className="mt-1">
                {latestStream.title || 'Stream'} • {new Date(latestStream.startedAt).toLocaleDateString()}
              </CardDescription>
            </div>
            {latestStream.durationMinutes && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDuration(latestStream.durationMinutes)}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Main Metrics Grid */}
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <div className="text-center p-4 rounded-lg border bg-background/50">
              <div className={`text-2xl font-bold flex items-center justify-center gap-1 ${
                latestStream.priceChange > 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {latestStream.priceChange > 0 ? (
                  <TrendingUp className="h-5 w-5" />
                ) : (
                  <TrendingDown className="h-5 w-5" />
                )}
                {formatPercentage(latestStream.priceChange)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Price Change</p>
              <p className="text-xs text-muted-foreground">
                {formatNumber(latestStream.priceChangeAbsolute)}
              </p>
            </div>

            <div className="text-center p-4 rounded-lg border bg-background/50">
              <div className={`text-2xl font-bold flex items-center justify-center gap-1 ${
                latestStream.volumeChange > 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                <Activity className="h-5 w-5" />
                {formatPercentage(latestStream.volumeChange)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Volume Change</p>
            </div>

            <div className="text-center p-4 rounded-lg border bg-background/50">
              <div className={`text-2xl font-bold flex items-center justify-center gap-1 ${
                latestStream.holderChange > 0 ? 'text-green-500' : latestStream.holderChange < 0 ? 'text-red-500' : ''
              }`}>
                <Users className="h-5 w-5" />
                {latestStream.holderChange > 0 ? '+' : ''}{latestStream.holderChange}
              </div>
              <p className="text-xs text-muted-foreground mt-1">New Holders</p>
            </div>

            <div className="text-center p-4 rounded-lg border bg-background/50">
              <div className={`text-2xl font-bold flex items-center justify-center gap-1 ${
                latestStream.marketCapChange > 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                <Zap className="h-5 w-5" />
                {formatPercentage(latestStream.marketCapChange)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Market Cap Change</p>
              <p className="text-xs text-muted-foreground">
                {formatNumber(latestStream.marketCapChangeAbsolute)}
              </p>
            </div>
          </div>

          {/* Comparison to Previous Stream */}
          {latestStream.comparisonToPrevious && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
              <Sparkles className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-primary mb-1">
                  {latestStream.comparisonToPrevious.priceImprovementPercent > 0 ? '🎉 ' : ''}
                  {latestStream.comparisonToPrevious.description}
                </p>
                <p className="text-muted-foreground text-xs">
                  Your streams are getting better at driving token performance!
                </p>
              </div>
            </div>
          )}

          {/* Post-Stream Performance */}
          {latestStream.postStream24h && (
            <div className="mt-4 pt-4 border-t">
              <h4 className="text-sm font-medium mb-3">24 Hours After Stream</h4>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="flex items-center justify-between p-3 rounded-lg border bg-background/50">
                  <span className="text-sm text-muted-foreground">Price Movement</span>
                  <span className={`text-sm font-semibold ${
                    latestStream.postStream24h.priceChange > 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {formatPercentage(latestStream.postStream24h.priceChange)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border bg-background/50">
                  <span className="text-sm text-muted-foreground">Volume Change</span>
                  <span className={`text-sm font-semibold ${
                    latestStream.postStream24h.volumeChange > 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {formatPercentage(latestStream.postStream24h.volumeChange)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Streams List */}
      {streams.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Stream History
            </CardTitle>
            <CardDescription>
              Your recent {streams.length} stream{streams.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {streams.map((stream, index) => (
                <div
                  key={stream.streamId}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/5 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">
                        {stream.title || `Stream ${index + 1}`}
                      </p>
                      {index === 0 && (
                        <Badge variant="default" className="text-xs">Latest</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(stream.startedAt).toLocaleDateString()} • {formatDuration(stream.durationMinutes)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className={`font-semibold ${
                      stream.priceChange > 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {formatPercentage(stream.priceChange)}
                    </div>
                    <div className="text-muted-foreground">
                      {stream.holderChange > 0 ? '+' : ''}{stream.holderChange} holders
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
