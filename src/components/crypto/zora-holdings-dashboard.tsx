"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Coins, TrendingUp, Wallet } from "lucide-react";
import { ZoraStatsDashboard } from "./zora-stats-dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import type { ZoraCreatorCoin, ZoraContentCoin } from "@/lib/integrations/zora/types";

interface ZoraHoldingsDashboardProps {
  walletAddress: string | null;
}

export function ZoraHoldingsDashboard({ walletAddress }: ZoraHoldingsDashboardProps) {
  const [holdings, setHoldings] = useState<{
    creatorCoins: ZoraCreatorCoin[];
    contentCoins: ZoraContentCoin[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch holdings when wallet changes
  useEffect(() => {
    console.log('[ZoraHoldingsDashboard] useEffect triggered, walletAddress:', walletAddress);

    if (!walletAddress) {
      console.log('[ZoraHoldingsDashboard] No wallet address, skipping fetch');
      return;
    }

    console.log('[ZoraHoldingsDashboard] Fetching holdings for wallet:', walletAddress);
    setIsLoading(true);
    setError(null);

    fetch(`/api/zora/holdings?address=${walletAddress}`)
      .then((res) => {
        console.log('[ZoraHoldingsDashboard] API response status:', res.status);
        return res.json();
      })
      .then((data) => {
        console.log('[ZoraHoldingsDashboard] API response data:', data);
        if (data.success) {
          setHoldings(data.data);
          console.log('[ZoraHoldingsDashboard] Holdings set:', data.data);
        } else {
          console.error('[ZoraHoldingsDashboard] API error:', data.error);
          setError(data.error);
        }
      })
      .catch((err) => {
        console.error('[ZoraHoldingsDashboard] Fetch error:', err);
        setError(err.message);
      })
      .finally(() => {
        console.log('[ZoraHoldingsDashboard] Fetch complete');
        setIsLoading(false);
      });
  }, [walletAddress]);

  if (!walletAddress) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Connect your wallet to view your bags
      </div>
    );
  }

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
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Separate created vs holdings
  const createdCoins = holdings?.creatorCoins.filter((c) => !c.isOwnedByWallet) || [];
  const heldCreatorCoins = holdings?.creatorCoins.filter((c) => c.isOwnedByWallet) || [];
  const createdContentCoins = holdings?.contentCoins.filter((c) => !c.isOwnedByWallet) || [];
  const heldContentCoins = holdings?.contentCoins.filter((c) => c.isOwnedByWallet) || [];

  // Debug logging
  if (heldCreatorCoins.length > 0) {
    console.log('[UI] First creator coin:', heldCreatorCoins[0]);
  }
  if (heldContentCoins.length > 0) {
    console.log('[UI] First content coin:', heldContentCoins[0]);
  }

  return (
    <Tabs defaultValue="created" className="space-y-6">
      <TabsList className="grid w-full max-w-md grid-cols-2">
        <TabsTrigger value="created">
          Created ({createdCoins.length + createdContentCoins.length})
        </TabsTrigger>
        <TabsTrigger value="holdings">
          Holdings ({heldCreatorCoins.length + heldContentCoins.length})
        </TabsTrigger>
      </TabsList>

      {/* Created Tab */}
      <TabsContent value="created" className="space-y-6">
        <ZoraStatsDashboard walletAddress={walletAddress} />
      </TabsContent>

      {/* Holdings Tab */}
      <TabsContent value="holdings" className="space-y-6">
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-[200px]" />
            <Skeleton className="h-[200px]" />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-destructive">Error loading holdings: {error}</p>
          </div>
        ) : heldCreatorCoins.length === 0 && heldContentCoins.length === 0 ? (
          <Card className="bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Wallet className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>No Holdings Yet</CardTitle>
                  <CardDescription className="mt-1">
                    Start buying other creators' coins to track them here
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Creator Coins Holdings */}
            {heldCreatorCoins.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Creator Coins</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {heldCreatorCoins.map((coin, index) => (
                    <Card key={`${coin.address}-${index}`} className="cyber-border">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
                            <Coins className="h-5 w-5 text-white" />
                          </div>
                          <Badge variant="secondary" className="bg-primary/20 text-primary">
                            Holding
                          </Badge>
                        </div>
                        <CardTitle className="mt-3 text-base">{coin.name}</CardTitle>
                        <CardDescription className="text-xs">${coin.symbol}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Holdings Value</span>
                            <span className="font-semibold text-primary">
                              {coin.holdingsValue ? formatCurrency(coin.holdingsValue) : '$0.00'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Tokens Held</span>
                            <span className="font-semibold">
                              {coin.balance ? parseFloat(coin.balance).toLocaleString(undefined, { maximumFractionDigits: 0 }) : '-'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">24h Change</span>
                            <span className={`font-semibold ${coin.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {coin.priceChange24h >= 0 ? '+' : ''}{coin.priceChange24h.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Content Coins Holdings */}
            {heldContentCoins.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Content Coins</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {heldContentCoins.map((coin, index) => (
                    <Card key={`${coin.address}-${index}`} className="cyber-border">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-primary">
                            <TrendingUp className="h-5 w-5 text-white" />
                          </div>
                          <Badge variant="secondary" className="bg-accent/20 text-accent">
                            Holding
                          </Badge>
                        </div>
                        <CardTitle className="mt-3 text-sm line-clamp-2">
                          {coin.name || coin.postContent || `Post #${coin.postId.slice(0, 8)}`}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          by {coin.creatorAddress.slice(0, 6)}...{coin.creatorAddress.slice(-4)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Holdings Value</span>
                            <span className="font-semibold text-primary">
                              {coin.holdingsValue ? formatCurrency(coin.holdingsValue) : '$0.00'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Tokens Held</span>
                            <span className="font-semibold">
                              {coin.balance ? parseFloat(coin.balance).toLocaleString(undefined, { maximumFractionDigits: 0 }) : '-'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">24h Change</span>
                            <span className={`font-semibold ${coin.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {coin.priceChange24h >= 0 ? '+' : ''}{(coin.priceChange24h || 0).toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
