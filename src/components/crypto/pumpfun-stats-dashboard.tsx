"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Rocket, Users, DollarSign } from "lucide-react";
import { usePumpFunStats } from "@/hooks/use-pumpfun-stats";
import { Skeleton } from "@/components/ui/skeleton";
import { MultiTokenDashboard } from "./multi-token-dashboard";
import { HolderGrowthChart } from "@/components/analytics/holder-growth-chart";
import { HolderLTVCard } from "@/components/analytics/holder-ltv-card";
import { useHolderGrowth } from "@/hooks/analytics/use-holder-growth";

interface PumpFunStatsDashboardProps {
  creatorAddress: string | null;
}

export function PumpFunStatsDashboard({ creatorAddress }: PumpFunStatsDashboardProps) {
  const { stats, isLoading, error } = usePumpFunStats(creatorAddress);

  if (!creatorAddress) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Connect your Phantom wallet to view Pump.fun stats
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
        <p className="text-destructive">Error loading Pump.fun stats: {error}</p>
        <p className="text-sm text-muted-foreground mt-2">
          Make sure you have created tokens on Pump.fun
        </p>
      </div>
    );
  }

  if (!stats || stats.totalTokensCreated === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No Pump.fun tokens found for this address</p>
        <p className="text-sm text-muted-foreground mt-2">
          Create your first token on Pump.fun to get started
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
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList className="grid w-full max-w-md grid-cols-2">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="portfolio">Portfolio ({stats.totalTokensCreated})</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-2">
        {/* Creator Summary */}
        <Card className="cyber-border bento-item">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-primary">
                <Rocket className="h-6 w-6 text-white" />
              </div>
            </div>
            <CardTitle className="mt-4">Creator Stats</CardTitle>
            <CardDescription>
              {stats.totalTokensCreated} token{stats.totalTokensCreated !== 1 ? "s" : ""} created
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Success Rate</span>
                <span className="font-semibold">
                  {stats.performance.successRate.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Successful Tokens</span>
                <span className="font-semibold">
                  {stats.successfulTokens} / {stats.totalTokensCreated}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Volume</span>
                <span className="font-semibold">{formatCurrency(stats.totalVolume)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Buyers</span>
                <span className="font-semibold">
                  {formatNumber(stats.performance.totalBuyers)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Summary */}
        <Card className="cyber-border bento-item">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
            <CardTitle className="mt-4">Performance</CardTitle>
            <CardDescription>Market metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Market Cap</span>
                <span className="font-semibold">
                  {formatCurrency(stats.totalMarketCap)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Avg. Market Cap</span>
                <span className="font-semibold">
                  {formatCurrency(stats.performance.avgMarketCap)}
                </span>
              </div>
              {stats.performance.topToken && (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Top Token</span>
                    <span className="font-semibold">
                      ${stats.performance.topToken.symbol}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Top Token Value</span>
                    <span className="font-semibold">
                      {formatCurrency(stats.performance.topToken.marketCap)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tokens Created</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTokensCreated}</div>
            <p className="text-xs text-muted-foreground">All-time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Graduated Tokens</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successfulTokens}</div>
            <p className="text-xs text-muted-foreground">Bonding curve complete</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Estimated Earnings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.earnings.estimatedTotalEarnings)}
            </div>
            <p className="text-xs text-muted-foreground">From successful tokens</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg. Performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.performance.successRate.toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground">Success rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Token List */}
      {stats.tokens.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Tokens</CardTitle>
            <CardDescription>All tokens you've created on Pump.fun</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.tokens
                .sort((a, b) => b.marketCap - a.marketCap)
                .slice(0, 10)
                .map((token) => (
                  <div
                    key={token.mint}
                    className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {token.imageUri && (
                        <img
                          src={token.imageUri}
                          alt={token.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <p className="text-sm font-medium">{token.name}</p>
                        <p className="text-xs text-muted-foreground">${token.symbol}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        {formatCurrency(token.marketCap)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {token.complete ? (
                          <span className="text-green-500">✓ Graduated</span>
                        ) : (
                          <span>{formatNumber(token.holderCount)} holders</span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Holder Lifetime Value */}
      <HolderLTVCard
        totalRevenue={stats.earnings.estimatedTotalEarnings}
        totalHolders={stats.performance.totalBuyers}
        platform="pumpfun"
        tokenName="Creator Portfolio"
      />

      {/* Holder Growth & Retention */}
      {stats.performance.topToken && (
        <HolderGrowthChartWrapper
          currentHolderCount={stats.performance.topToken.holderCount || 0}
          tokenName={stats.performance.topToken.name}
          platform="pumpfun"
        />
      )}
      </TabsContent>

      <TabsContent value="portfolio" className="space-y-6">
        <MultiTokenDashboard tokens={stats.tokens} />
      </TabsContent>
    </Tabs>
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
