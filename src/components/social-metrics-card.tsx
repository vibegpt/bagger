'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Twitter, MessageCircle, Send, ThumbsUp, TrendingUp, TrendingDown } from 'lucide-react';
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

interface SocialMetricsCardProps {
  mintAddress: string;
  tokenSymbol?: string;
}

export function SocialMetricsCard({ mintAddress, tokenSymbol }: SocialMetricsCardProps) {
  const [metrics, setMetrics] = useState<SocialMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        setLoading(true);
        const response = await fetch(`/api/social-metrics/${mintAddress}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError('Not available on CoinGecko');
          } else {
            setError('Failed to load social metrics');
          }
          return;
        }

        const data = await response.json();
        setMetrics(data.data.current);
      } catch (err) {
        console.error('Error fetching social metrics:', err);
        setError('Failed to load social metrics');
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

  if (error || !metrics) {
    return (
      <Card className="border-muted">
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">Community Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {error || 'No social data available'}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            This token is not yet tracked on CoinGecko
          </p>
        </CardContent>
      </Card>
    );
  }

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
