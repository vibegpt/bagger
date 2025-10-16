"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, TrendingUp, PieChart as PieChartIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface HolderAnalyticsProps {
  tokenMint?: string;
  tokenAddress?: string;
  tokenName: string;
  platform: "pumpfun" | "zora";
}

export function HolderAnalytics({ tokenMint, tokenAddress, tokenName, platform }: HolderAnalyticsProps) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHolderData = async () => {
      if (!tokenMint && !tokenAddress) return;

      setIsLoading(true);
      setError(null);

      try {
        const endpoint = platform === "pumpfun"
          ? `/api/pumpfun/holders?mint=${tokenMint}`
          : `/api/zora/holders?address=${tokenAddress}`;

        const response = await fetch(endpoint);
        const result = await response.json();

        if (result.success) {
          setData(result.data);
        } else {
          setError(result.error || "Failed to fetch holder data");
        }
      } catch (err) {
        console.error("Error fetching holder data:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch holder data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHolderData();
  }, [tokenMint, tokenAddress, platform]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Error Loading Holder Data</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!data) return null;

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 0,
    }).format(num);
  };

  const formatPercentage = (num: number) => {
    return num.toFixed(2) + "%";
  };

  const getDistributionHealth = (gini: number) => {
    if (gini < 0.4) return { label: "Excellent", color: "text-green-500" };
    if (gini < 0.6) return { label: "Good", color: "text-blue-500" };
    if (gini < 0.8) return { label: "Fair", color: "text-yellow-500" };
    return { label: "Concentrated", color: "text-red-500" };
  };

  const health = getDistributionHealth(data.distribution?.giniCoefficient || 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cyber-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Holders</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.totalHolders || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Unique wallet addresses
            </p>
          </CardContent>
        </Card>

        <Card className="cyber-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top 10 Hold</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercentage(data.distribution?.top10Percentage || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              of total supply
            </p>
          </CardContent>
        </Card>

        <Card className="cyber-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Distribution</CardTitle>
            <PieChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${health.color}`}>
              {health.label}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Gini: {(data.distribution?.giniCoefficient || 0).toFixed(3)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Holders List */}
      {data.topHolders && data.topHolders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Holders</CardTitle>
            <CardDescription>
              Top {data.topHolders.length} holders by balance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.topHolders.slice(0, 20).map((holder: any, index: number) => (
                <div
                  key={holder.address}
                  className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-8 justify-center">
                      #{index + 1}
                    </Badge>
                    <div>
                      <p className="font-mono text-sm">
                        {holder.address.slice(0, 6)}...{holder.address.slice(-4)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatNumber(holder.balance)} tokens
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">
                      {formatPercentage(holder.percentageOfSupply)}
                    </p>
                    <p className="text-xs text-muted-foreground">of supply</p>
                  </div>
                </div>
              ))}
            </div>

            {data.topHolders.length > 20 && (
              <p className="text-center text-sm text-muted-foreground mt-4">
                Showing top 20 of {data.topHolders.length} holders
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Distribution Insights */}
      {data.distribution && (
        <Card className="bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle>Distribution Insights</CardTitle>
            <CardDescription>Token concentration analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-medium">Top 10 Holders</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-primary">
                    {formatPercentage(data.distribution.top10Percentage)}
                  </span>
                  <span className="text-sm text-muted-foreground">of supply</span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Top 50 Holders</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-primary">
                    {formatPercentage(data.distribution.top50Percentage)}
                  </span>
                  <span className="text-sm text-muted-foreground">of supply</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                <strong>Distribution Health: {health.label}</strong>
                <br />
                {health.label === "Excellent" && "Tokens are well distributed across many holders."}
                {health.label === "Good" && "Healthy distribution with moderate concentration."}
                {health.label === "Fair" && "Some concentration in top holders, monitor for risks."}
                {health.label === "Concentrated" && "High concentration - whale risk present."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
