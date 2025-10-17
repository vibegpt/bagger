"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Wallet } from "lucide-react";
import { PumpFunStatsDashboard } from "./pumpfun-stats-dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { TokenCardWithHolders } from "./token-card-with-holders";
import { ShareToTwitterButton } from "./share-to-twitter-button";

interface PumpFunHoldingsDashboardProps {
  walletAddress: string | null;
}

export function PumpFunHoldingsDashboard({ walletAddress }: PumpFunHoldingsDashboardProps) {
  const [holdings, setHoldings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch holdings when wallet changes
  useEffect(() => {
    if (!walletAddress) {
      setHoldings(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    fetch(`/api/pumpfun/holdings?address=${walletAddress}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setHoldings(data.data);
        } else {
          setError(data.error);
        }
      })
      .catch((err) => {
        console.error("Error fetching Pump.fun holdings:", err);
        setError(err.message);
      })
      .finally(() => setIsLoading(false));
  }, [walletAddress]);

  if (!walletAddress) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Connect your Phantom wallet to view your bags
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

  const formatNumber = (value: number) => {
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(2)}M`;
    }
    if (value >= 1_000) {
      return `${(value / 1_000).toFixed(1)}K`;
    }
    return new Intl.NumberFormat("en-US").format(value);
  };

  return (
    <Tabs defaultValue="created" className="space-y-6">
      <TabsList className="grid w-full max-w-md grid-cols-2">
        <TabsTrigger value="created">
          Created (0)
        </TabsTrigger>
        <TabsTrigger value="holdings">
          Holdings ({holdings?.tokenCount || 0})
        </TabsTrigger>
      </TabsList>

      {/* Holdings Tab */}
      <TabsContent value="holdings" className="space-y-6">
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-[200px]" />
            <Skeleton className="h-[200px]" />
            <Skeleton className="h-[200px]" />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-destructive">Error loading holdings: {error}</p>
          </div>
        ) : !holdings || holdings.tokenCount === 0 ? (
          <Card className="bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Wallet className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>No Pump.fun Tokens Yet</CardTitle>
                  <CardDescription className="mt-1">
                    Start buying tokens on Pump.fun to track them here
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        ) : (
          <div>
            {/* Summary Card */}
            <Card className="mb-6 bg-gradient-to-br from-accent/5 via-primary/5 to-accent/5 border-accent/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Total Holdings</CardTitle>
                    <CardDescription>
                      {holdings.tokenCount} Pump.fun {holdings.tokenCount === 1 ? 'token' : 'tokens'}
                    </CardDescription>
                  </div>
                  {holdings.holdings && holdings.holdings.length > 0 && (
                    <ShareToTwitterButton
                      cardType="bag-status"
                      params={{
                        totalPnl: '0', // Would need to calculate actual P&L
                        topToken1: holdings.holdings[0]?.token?.symbol || 'N/A',
                        topToken2: holdings.holdings[1]?.token?.symbol || 'N/A',
                        topToken3: holdings.holdings[2]?.token?.symbol || 'N/A',
                        topPnl1: '0', // Would need to calculate actual P&L
                        topPnl2: '0',
                        topPnl3: '0',
                      }}
                      variant="outline"
                      size="sm"
                    />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold gradient-text">
                  {formatCurrency(holdings.totalValueUsd)}
                </div>
              </CardContent>
            </Card>

            {/* Token Holdings Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {holdings.holdings.map((holding: any) => (
                <TokenCardWithHolders
                  key={holding.token.mint}
                  token={holding.token}
                  holding={{
                    balance: holding.balance,
                    valueUsd: holding.valueUsd,
                  }}
                  platform="pumpfun"
                  formatCurrency={formatCurrency}
                  formatNumber={formatNumber}
                />
              ))}
            </div>
          </div>
        )}
      </TabsContent>

      {/* Created Tab */}
      <TabsContent value="created" className="space-y-6">
        <PumpFunStatsDashboard creatorAddress={walletAddress} />
      </TabsContent>
    </Tabs>
  );
}
