'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Twitter, MessageCircle, Send, ThumbsUp, TrendingUp, TrendingDown, Users, Activity } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SocialMetrics {
  twitterFollowers: number | null;
  redditSubscribers: number | null;
  telegramUsers: number | null;
  facebookLikes: number | null;
  communityScore: number | null;
  sentimentUpPercentage: number | null;
  sentimentDownPercentage: number | null;
  twitterGrowth7d: number | null;
  redditGrowth7d: number | null;
  communityGrowthRate: number | null;
  lastSyncedAt: Date;
}

interface OnChainMetrics {
  currentHolders: number;
  holderGrowth24h: number;
  holderChange24h: number;
  estimatedTradesPerHour: number;
  snapshotCount24h: number;
  volumeTrend24h: number;
}

interface SocialMetricsCardProps {
  mintAddress: string;
  tokenSymbol?: string;
}

export function SocialMetricsCard({ mintAddress, tokenSymbol }: SocialMetricsCardProps) {
  const [metrics, setMetrics] = useState<SocialMetrics | null>(null);
  const [onChainMetrics, setOnChainMetrics] = useState<OnChainMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useOnChain, setUseOnChain] = useState(false);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        setLoading(true);

        // Try CoinGecko social metrics first
        const socialResponse = await fetch(`/api/social-metrics/${mintAddress}`);

        if (socialResponse.ok) {
          const data = await socialResponse.json();
          setMetrics(data.data.current);
          setUseOnChain(false);
        } else {
          // Fallback to on-chain metrics
          const onChainResponse = await fetch(`/api/on-chain-metrics/${mintAddress}`);

          if (onChainResponse.ok) {
            const data = await onChainResponse.json();
            setOnChainMetrics(data.data);
            setUseOnChain(true);
          } else {
            setError('No metrics available');
          }
        }
      } catch (err) {
        console.error('Error fetching metrics:', err);
        setError('Failed to load metrics');
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();
  }, [mintAddress]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Community Metrics</CardTitle>
          <CardDescription>Social media and community engagement</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || (!metrics && !onChainMetrics)) {
    return (
      <Card className="border-muted">
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">Community Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {error || 'No metrics available'}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Token needs more tracking data
          </p>
        </CardContent>
      </Card>
    );
  }

  // Render on-chain metrics if using that data
  if (useOnChain && onChainMetrics) {
    const formatGrowth = (growth: number) => {
      const isPositive = growth >= 0;
      const Icon = isPositive ? TrendingUp : TrendingDown;
      const color = isPositive ? 'text-green-600' : 'text-red-600';

      return (
        <span className={`flex items-center gap-1 text-xs ${color}`}>
          <Icon className="w-3 h-3" />
          {isPositive ? '+' : ''}{growth.toFixed(2)}%
        </span>
      );
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>On-Chain Metrics</span>
            <Badge variant="secondary">24h Data</Badge>
          </CardTitle>
          <CardDescription>Community activity from blockchain data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Holder Growth */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Holder Growth</p>
                <p className="text-xs text-muted-foreground">Last 24 hours</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">{formatGrowth(onChainMetrics.holderGrowth24h)}</p>
              <p className="text-xs text-muted-foreground">
                {onChainMetrics.holderChange24h > 0 ? '+' : ''}{onChainMetrics.holderChange24h} holders
              </p>
            </div>
          </div>

          {/* Trade Activity */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Trade Activity</p>
                <p className="text-xs text-muted-foreground">Estimated rate</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">{onChainMetrics.estimatedTradesPerHour}</p>
              <p className="text-xs text-muted-foreground">trades/hour</p>
            </div>
          </div>

          {/* Current Holders */}
          <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
            <div>
              <p className="text-xs text-muted-foreground">Total Holders</p>
              <p className="text-lg font-bold">{onChainMetrics.currentHolders.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Original CoinGecko metrics render
  if (!metrics) return null;

  const formatNumber = (num: number | null) => {
    if (num === null) return 'N/A';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const formatGrowth = (growth: number | null) => {
    if (growth === null) return null;
    const isPositive = growth >= 0;
    const Icon = isPositive ? TrendingUp : TrendingDown;
    const color = isPositive ? 'text-green-600' : 'text-red-600';

    return (
      <span className={`flex items-center gap-1 text-xs ${color}`}>
        <Icon className="w-3 h-3" />
        {isPositive ? '+' : ''}{formatNumber(growth)}
      </span>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Community Metrics</span>
          {metrics.communityScore && (
            <Badge variant="secondary">
              Score: {metrics.communityScore}/100
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Social media and community engagement
          {tokenSymbol && ` for ${tokenSymbol}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Twitter */}
        {metrics.twitterFollowers !== null && (
          <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-500/10">
                <Twitter className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium">Twitter</p>
                <p className="text-2xl font-bold">{formatNumber(metrics.twitterFollowers)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">7d change</p>
              {formatGrowth(metrics.twitterGrowth7d) || (
                <span className="text-xs text-muted-foreground">-</span>
              )}
            </div>
          </div>
        )}

        {/* Reddit */}
        {metrics.redditSubscribers !== null && (
          <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-orange-500/10">
                <MessageCircle className="w-4 h-4 text-orange-500" />
              </div>
              <div>
                <p className="text-sm font-medium">Reddit</p>
                <p className="text-2xl font-bold">{formatNumber(metrics.redditSubscribers)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">7d change</p>
              {formatGrowth(metrics.redditGrowth7d) || (
                <span className="text-xs text-muted-foreground">-</span>
              )}
            </div>
          </div>
        )}

        {/* Telegram */}
        {metrics.telegramUsers !== null && (
          <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-sky-500/10">
                <Send className="w-4 h-4 text-sky-500" />
              </div>
              <div>
                <p className="text-sm font-medium">Telegram</p>
                <p className="text-2xl font-bold">{formatNumber(metrics.telegramUsers)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Sentiment */}
        {metrics.sentimentUpPercentage !== null && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Sentiment</span>
              <ThumbsUp className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex gap-2">
              <Badge variant="default" className="bg-green-500/10 text-green-700 hover:bg-green-500/20">
                {metrics.sentimentUpPercentage.toFixed(1)}% Positive
              </Badge>
              {metrics.sentimentDownPercentage && (
                <Badge variant="secondary" className="bg-red-500/10 text-red-700">
                  {metrics.sentimentDownPercentage.toFixed(1)}% Negative
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Last updated */}
        <p className="text-xs text-muted-foreground mt-4 pt-4 border-t">
          Last updated: {new Date(metrics.lastSyncedAt).toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  );
}
