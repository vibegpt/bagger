"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Coins, Wallet } from "lucide-react";
import { useZoraStats } from "@/hooks/use-zora-stats";
import { usePumpFunStats } from "@/hooks/use-pumpfun-stats";
import { Skeleton } from "@/components/ui/skeleton";

interface PortfolioOverviewProps {
  ethWallet: string | null;
  solanaWallet: string | null;
}

export function PortfolioOverview({ ethWallet, solanaWallet }: PortfolioOverviewProps) {
  const { stats: zoraStats, isLoading: zoraLoading } = useZoraStats(ethWallet);
  const { stats: pumpStats, isLoading: pumpLoading } = usePumpFunStats(solanaWallet);

  const isLoading = zoraLoading || pumpLoading;
  const hasAnyWallet = ethWallet || solanaWallet;

  if (!hasAnyWallet) {
    return (
      <Card className="bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Connect Your Wallets</CardTitle>
              <CardDescription className="mt-1">
                Connect MetaMask (Zora) and Phantom (Pump.fun) to see your bags
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-primary/20 bg-background/50 p-4">
              <p className="text-sm font-medium">Zora (Base)</p>
              <p className="text-xs text-muted-foreground mt-1">
                Track bags from Creator & Content Coins
              </p>
            </div>
            <div className="rounded-lg border border-accent/20 bg-background/50 p-4">
              <p className="text-sm font-medium">Pump.fun (Solana)</p>
              <p className="text-xs text-muted-foreground mt-1">
                Monitor bags from token launches
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Bags</CardTitle>
          <CardDescription>Loading your bags...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate totals
  const zoraTotalValue = zoraStats
    ? (zoraStats.creatorCoin?.marketCap || 0) +
      zoraStats.performance.totalContentCoinsValue
    : 0;

  const pumpTotalValue = pumpStats ? pumpStats.totalMarketCap : 0;

  const totalPortfolioValue = zoraTotalValue + pumpTotalValue;

  const totalEarnings =
    (zoraStats?.earnings.totalEarnings || 0) +
    (pumpStats?.earnings.estimatedTotalEarnings || 0);

  const totalCoins =
    (zoraStats?.totalPosts || 0) + (pumpStats?.totalTokensCreated || 0) + (zoraStats?.creatorCoin ? 1 : 0);

  const formatCurrency = (value: number) => {
    if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(2)}M`;
    }
    if (value >= 1_000) {
      return `$${(value / 1_000).toFixed(1)}K`;
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card className="bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Your Bags</CardTitle>
            <CardDescription className="mt-1">
              All your bags across Zora and Pump.fun
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {ethWallet && (
              <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-xs font-medium">Base</span>
              </div>
            )}
            {solanaWallet && (
              <div className="flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1.5">
                <div className="h-2 w-2 rounded-full bg-purple-500" />
                <span className="text-xs font-medium">Solana</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-primary/20 bg-background/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <p className="text-xs text-muted-foreground">Total Value</p>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(totalPortfolioValue)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Market cap across all tokens
            </p>
          </div>

          <div className="rounded-lg border border-primary/20 bg-background/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <p className="text-xs text-muted-foreground">Total Earnings</p>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(totalEarnings)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Total bags secured
            </p>
          </div>

          <div className="rounded-lg border border-primary/20 bg-background/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Coins className="h-4 w-4 text-primary" />
              <p className="text-xs text-muted-foreground">Total Coins</p>
            </div>
            <p className="text-2xl font-bold">{totalCoins}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Creator + content + tokens
            </p>
          </div>

          <div className="rounded-lg border border-primary/20 bg-background/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="h-4 w-4 text-primary" />
              <p className="text-xs text-muted-foreground">Platforms</p>
            </div>
            <p className="text-2xl font-bold">
              {(ethWallet ? 1 : 0) + (solanaWallet ? 1 : 0)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Connected wallets
            </p>
          </div>
        </div>

        {/* Breakdown */}
        <div className="mt-4 pt-4 border-t border-primary/10">
          <div className="grid gap-3 md:grid-cols-2">
            {ethWallet && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm font-medium">Zora (Base)</span>
                </div>
                <span className="text-sm font-semibold">{formatCurrency(zoraTotalValue)}</span>
              </div>
            )}
            {solanaWallet && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-purple-500" />
                  <span className="text-sm font-medium">Pump.fun (Solana)</span>
                </div>
                <span className="text-sm font-semibold">{formatCurrency(pumpTotalValue)}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
