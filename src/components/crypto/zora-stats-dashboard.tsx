"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, TrendingUp, Users, DollarSign } from "lucide-react";
import { useZoraStats } from "@/hooks/use-zora-stats";
import { Skeleton } from "@/components/ui/skeleton";

interface ZoraStatsDashboardProps {
  walletAddress: string | null;
}

export function ZoraStatsDashboard({ walletAddress }: ZoraStatsDashboardProps) {
  const { stats, isLoading, error } = useZoraStats(walletAddress);

  if (!walletAddress) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Connect your wallet to view Zora stats
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <Skeleton className="h-[120px]" />
          <Skeleton className="h-[120px]" />
          <Skeleton className="h-[120px]" />
          <Skeleton className="h-[120px]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Error loading Zora stats: {error}</p>
        <p className="text-sm text-muted-foreground mt-2">
          Make sure you have a Zora creator coin or content coins
        </p>
      </div>
    );
  }

  if (!stats?.creatorCoin && (!stats?.contentCoins || stats.contentCoins.length === 0)) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No Zora coins found for this address</p>
        <p className="text-sm text-muted-foreground mt-2">
          Create your first coin on Zora to get started
        </p>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("en-US").format(value);
  };

  return (
    <div className="space-y-6">
      {/* Creator Coin & Content Coins Summary */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Creator Coin Card */}
        {stats.creatorCoin && (
          <Card className="cyber-border bento-item">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
                  <Coins className="h-6 w-6 text-white" />
                </div>
              </div>
              <CardTitle className="mt-4">{stats.creatorCoin.name}</CardTitle>
              <CardDescription>${stats.creatorCoin.symbol}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-semibold">
                    {formatCurrency(stats.creatorCoin.price)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Market Cap</span>
                  <span className="font-semibold">
                    {formatCurrency(stats.creatorCoin.marketCap)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">24h Volume</span>
                  <span className="font-semibold">
                    {formatCurrency(stats.creatorCoin.volume24h)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">24h Change</span>
                  <span
                    className={`font-semibold ${
                      stats.creatorCoin.priceChange24h >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {stats.creatorCoin.priceChange24h >= 0 ? "+" : ""}
                    {stats.creatorCoin.priceChange24h.toFixed(2)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Content Coins Summary */}
        <Card className="cyber-border bento-item">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-primary">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
            <CardTitle className="mt-4">Content Coins</CardTitle>
            <CardDescription>
              {stats.totalPosts} post{stats.totalPosts !== 1 ? "s" : ""} tokenized
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Value</span>
                <span className="font-semibold">
                  {formatCurrency(stats.performance.totalContentCoinsValue)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Avg. Market Cap</span>
                <span className="font-semibold">
                  {formatCurrency(stats.performance.avgPostMarketCap)}
                </span>
              </div>
              {stats.performance.topPost && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Top Post Value</span>
                  <span className="font-semibold">
                    {formatCurrency(stats.performance.topPost.marketCap)}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Earnings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.earnings.totalEarnings)}
            </div>
            <p className="text-xs text-muted-foreground">All-time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Trading Fees</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.earnings.totalTradingFeesEarned)}
            </div>
            <p className="text-xs text-muted-foreground">50% in $ZORA</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Creator Cut</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.earnings.totalCreatorCutEarned)}
            </div>
            <p className="text-xs text-muted-foreground">1% of trades</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Vested Tokens</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.earnings.vestedTokensValue)}
            </div>
            <p className="text-xs text-muted-foreground">5 year vest</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Content Coins */}
      {stats.contentCoins.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Content Coins</CardTitle>
            <CardDescription>Your highest performing posts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.contentCoins
                .sort((a, b) => b.marketCap - a.marketCap)
                .slice(0, 5)
                .map((coin) => (
                  <div
                    key={coin.id}
                    className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium line-clamp-1">
                        {coin.postContent || "Untitled Post"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(coin.price)} per token
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        {formatCurrency(coin.marketCap)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(coin.volume24h)} 24h vol
                      </p>
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
