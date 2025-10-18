"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, TrendingUp, Users, DollarSign } from "lucide-react";
import { useZoraStats } from "@/hooks/use-zora-stats";
import { Skeleton } from "@/components/ui/skeleton";
import { HolderGrowthChart } from "@/components/analytics/holder-growth-chart";
import { HolderLTVCard } from "@/components/analytics/holder-ltv-card";
import { ContentPerformanceTable } from "@/components/analytics/content-performance-table";
import { useHolderGrowth } from "@/hooks/analytics/use-holder-growth";

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

      {/* Content Performance Table */}
      {stats.contentCoins.length > 0 && (
        <ContentPerformanceTable
          contentCoins={stats.contentCoins}
          totalEarnings={stats.earnings.totalEarnings}
        />
      )}

      {/* Holder Lifetime Value */}
      <HolderLTVCard
        totalRevenue={stats.earnings.totalEarnings}
        totalHolders={stats.creatorCoin?.holderCount || stats.contentCoins.reduce((sum, c) => sum + (c.holderCount || 0), 0)}
        platform="zora"
        tokenName={stats.creatorCoin?.name}
      />

      {/* Holder Growth & Retention */}
      {stats.creatorCoin && (
        <HolderGrowthChartWrapper
          currentHolderCount={stats.creatorCoin.holderCount || 0}
          tokenName={stats.creatorCoin.name}
          platform="zora"
        />
      )}
    </div>
  );
}

// Wrapper component to use the hook
function HolderGrowthChartWrapper({
  currentHolderCount,
  tokenName,
  platform,
}: {
  currentHolderCount: number;
  tokenName: string;
  platform: "zora" | "pumpfun";
}) {
  const { data, isLoading } = useHolderGrowth(currentHolderCount, platform);

  if (isLoading) {
    return <Skeleton className="h-[400px]" />;
  }

  return <HolderGrowthChart data={data} tokenName={tokenName} platform={platform} />;
}
