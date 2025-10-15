"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Activity, Users, BarChart3, Eye, Zap, Target } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface TokenSnapshot {
  price: number;
  marketCap: number;
  volume24h: number;
  holderCount: number;
}

interface StreamCorrelation {
  streamId: string;
  streamTitle: string;
  streamPlatform: string;
  startedAt: string;
  endedAt: string | null;
  durationMinutes: number | null;
  peakViewers: number | null;
  averageViewers: number | null;
  totalViews: number | null;
  relatedTokenMint: string | null;
  relatedTokenAddress: string | null;
  tokenSnapshots: {
    beforeStream?: TokenSnapshot;
    duringStream?: TokenSnapshot;
    afterStream?: TokenSnapshot;
  };
  impact: {
    priceChangePercent: number | null;
    volumeChangePercent: number | null;
    holderChangePercent: number | null;
    marketCapChangePercent: number | null;
  };
}

interface AggregateStats {
  totalStreams: number;
  streamsWithData: number;
  averagePriceChange: number;
  averageVolumeChange: number;
  averageHolderChange: number;
  positiveStreams: number;
  negativeStreams: number;
  bestPerformingStream: StreamCorrelation | null;
  worstPerformingStream: StreamCorrelation | null;
}

export function StreamCorrelation() {
  const [correlations, setCorrelations] = useState<StreamCorrelation[]>([]);
  const [aggregateStats, setAggregateStats] = useState<AggregateStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCorrelations();
  }, []);

  const fetchCorrelations = async () => {
    try {
      const response = await fetch('/api/streams/correlation');
      const result = await response.json();

      if (result.success) {
        setCorrelations(result.data.correlations);
        setAggregateStats(result.data.aggregateStats);
      }
    } catch (error) {
      console.error('Error fetching correlations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPercent = (value: number | null) => {
    if (value === null) return 'N/A';
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const formatCurrency = (value: number) => {
    if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(2)}M`;
    } else if (value >= 1_000) {
      return `$${(value / 1_000).toFixed(2)}K`;
    }
    return `$${value.toFixed(2)}`;
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

  // Prepare chart data
  const priceImpactChartData = correlations
    .filter(c => c.impact.priceChangePercent !== null)
    .map(c => ({
      name: c.streamTitle.length > 20 ? c.streamTitle.slice(0, 20) + '...' : c.streamTitle,
      priceChange: c.impact.priceChangePercent,
      viewers: c.peakViewers || 0,
    }));

  const metricsComparisonData = correlations
    .filter(c => c.tokenSnapshots.beforeStream && c.tokenSnapshots.afterStream)
    .slice(0, 5)
    .map(c => ({
      name: c.streamTitle.length > 15 ? c.streamTitle.slice(0, 15) + '...' : c.streamTitle,
      priceBefore: c.tokenSnapshots.beforeStream!.price,
      priceAfter: c.tokenSnapshots.afterStream!.price,
      volumeBefore: c.tokenSnapshots.beforeStream!.volume24h,
      volumeAfter: c.tokenSnapshots.afterStream!.volume24h,
    }));

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            Analyzing stream correlations...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!aggregateStats || aggregateStats.totalStreams === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Stream Impact Analysis</CardTitle>
          <CardDescription>No stream data available yet</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Log streams with associated tokens to see how your streams impact token performance.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Aggregate Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Avg Price Impact
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${aggregateStats.averagePriceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {formatPercent(aggregateStats.averagePriceChange)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {aggregateStats.streamsWithData} streams
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Success Rate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {aggregateStats.streamsWithData > 0
                ? ((aggregateStats.positiveStreams / aggregateStats.streamsWithData) * 100).toFixed(1)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {aggregateStats.positiveStreams} positive / {aggregateStats.negativeStreams} negative
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Avg Volume Change
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${aggregateStats.averageVolumeChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {formatPercent(aggregateStats.averageVolumeChange)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Trading volume impact
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Avg Holder Growth
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${aggregateStats.averageHolderChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {formatPercent(aggregateStats.averageHolderChange)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              New holders gained
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Price Impact Chart */}
      {priceImpactChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Price Impact by Stream</CardTitle>
            <CardDescription>
              How each stream affected token price
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priceImpactChartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))' }}
                  formatter={(value: number) => `${value.toFixed(2)}%`}
                />
                <Bar
                  dataKey="priceChange"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Best and Worst Performing Streams */}
      {(aggregateStats.bestPerformingStream || aggregateStats.worstPerformingStream) && (
        <div className="grid gap-4 md:grid-cols-2">
          {aggregateStats.bestPerformingStream && (
            <Card className="border-green-500/20 bg-green-500/5">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-green-500" />
                  <CardTitle className="text-green-500">Best Performing Stream</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-semibold">{aggregateStats.bestPerformingStream.streamTitle}</h4>
                  <Badge className={getPlatformColor(aggregateStats.bestPerformingStream.streamPlatform)}>
                    {aggregateStats.bestPerformingStream.streamPlatform}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Price Impact</p>
                    <p className="font-bold text-green-500">
                      {formatPercent(aggregateStats.bestPerformingStream.impact.priceChangePercent)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Peak Viewers</p>
                    <p className="font-semibold">
                      {aggregateStats.bestPerformingStream.peakViewers?.toLocaleString() || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Volume Change</p>
                    <p className="font-semibold text-green-500">
                      {formatPercent(aggregateStats.bestPerformingStream.impact.volumeChangePercent)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Holder Growth</p>
                    <p className="font-semibold text-green-500">
                      {formatPercent(aggregateStats.bestPerformingStream.impact.holderChangePercent)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {aggregateStats.worstPerformingStream && (
            <Card className="border-red-500/20 bg-red-500/5">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-red-500" />
                  <CardTitle className="text-red-500">Worst Performing Stream</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-semibold">{aggregateStats.worstPerformingStream.streamTitle}</h4>
                  <Badge className={getPlatformColor(aggregateStats.worstPerformingStream.streamPlatform)}>
                    {aggregateStats.worstPerformingStream.streamPlatform}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Price Impact</p>
                    <p className="font-bold text-red-500">
                      {formatPercent(aggregateStats.worstPerformingStream.impact.priceChangePercent)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Peak Viewers</p>
                    <p className="font-semibold">
                      {aggregateStats.worstPerformingStream.peakViewers?.toLocaleString() || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Volume Change</p>
                    <p className="font-semibold text-red-500">
                      {formatPercent(aggregateStats.worstPerformingStream.impact.volumeChangePercent)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Holder Growth</p>
                    <p className="font-semibold text-red-500">
                      {formatPercent(aggregateStats.worstPerformingStream.impact.holderChangePercent)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Detailed Stream List */}
      <Card>
        <CardHeader>
          <CardTitle>All Stream Impacts</CardTitle>
          <CardDescription>
            Detailed breakdown of each stream's effect on token performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {correlations.map((stream) => (
              <div
                key={stream.streamId}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-sm">{stream.streamTitle}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getPlatformColor(stream.streamPlatform)}>
                        {stream.streamPlatform}
                      </Badge>
                      {stream.peakViewers && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {stream.peakViewers.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  {stream.impact.priceChangePercent !== null && (
                    <div className={`text-right ${stream.impact.priceChangePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      <div className="flex items-center gap-1">
                        {stream.impact.priceChangePercent >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        <span className="font-bold">{formatPercent(stream.impact.priceChangePercent)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">price change</p>
                    </div>
                  )}
                </div>

                {stream.impact.priceChangePercent !== null && (
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div className="bg-muted/50 rounded p-2">
                      <p className="text-muted-foreground mb-1">Volume Change</p>
                      <p className={`font-semibold ${(stream.impact.volumeChangePercent || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {formatPercent(stream.impact.volumeChangePercent)}
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded p-2">
                      <p className="text-muted-foreground mb-1">Holder Growth</p>
                      <p className={`font-semibold ${(stream.impact.holderChangePercent || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {formatPercent(stream.impact.holderChangePercent)}
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded p-2">
                      <p className="text-muted-foreground mb-1">Market Cap</p>
                      <p className={`font-semibold ${(stream.impact.marketCapChangePercent || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {formatPercent(stream.impact.marketCapChangePercent)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
