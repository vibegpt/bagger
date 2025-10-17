"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, Flame, Zap, Activity, Users, DollarSign, ArrowRight, ExternalLink, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface TrendingToken {
  mint: string;
  name: string;
  symbol: string;
  imageUri?: string;
  marketCap: number;
  price: number;
  volume24h: number;
  priceChange24h?: number;
  holderCount: number;
  chain: 'base' | 'solana';
  platform: 'zora' | 'pumpfun';
}

export function TrendingTokens() {
  const [baseTrending, setBaseTrending] = useState<TrendingToken[]>([]);
  const [solanaTrending, setSolanaTrending] = useState<TrendingToken[]>([]);
  const [loading, setLoading] = useState({ base: true, solana: true });
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Format currency
  const formatCurrency = (value: number) => {
    if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(2)}M`;
    }
    if (value >= 1_000) {
      return `$${(value / 1_000).toFixed(1)}K`;
    }
    return `$${value.toFixed(2)}`;
  };

  const formatNumber = (value: number) => {
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(2)}M`;
    }
    if (value >= 1_000) {
      return `${(value / 1_000).toFixed(1)}K`;
    }
    return value.toLocaleString();
  };

  // Fetch trending tokens
  const fetchTrending = async () => {
    setLoading({ base: true, solana: true });

    // Fetch Base (Zora) trending - For now, show placeholder data
    // TODO: Implement actual Zora trending API
    setTimeout(() => {
      setBaseTrending([
        {
          mint: "0x1111111111166b7fe7bd91427724b487980afc69",
          name: "Zora",
          symbol: "ZORA",
          marketCap: 150000000,
          price: 0.015,
          volume24h: 5000000,
          priceChange24h: 12.5,
          holderCount: 45000,
          chain: 'base',
          platform: 'zora',
        },
        {
          mint: "0xca416D6D3C2b3A8a2c48419B53DD611420ffA776",
          name: "kazonomics",
          symbol: "kazonomics",
          marketCap: 85000,
          price: 0.000085,
          volume24h: 12000,
          priceChange24h: 45.2,
          holderCount: 230,
          chain: 'base',
          platform: 'zora',
        },
      ]);
      setLoading(prev => ({ ...prev, base: false }));
    }, 1000);

    // Fetch Solana (Pump.fun) trending
    try {
      const response = await fetch('https://frontend-api.pump.fun/coins/king-of-the-hill');
      const data = await response.json();

      if (Array.isArray(data)) {
        const formatted = data.slice(0, 10).map((token: any) => ({
          mint: token.mint,
          name: token.name,
          symbol: token.symbol,
          imageUri: token.image_uri,
          marketCap: token.usd_market_cap || 0,
          price: token.price || 0,
          volume24h: token.volume_24h || 0,
          priceChange24h: 0, // Not provided by API
          holderCount: token.holder_count || 0,
          chain: 'solana' as const,
          platform: 'pumpfun' as const,
        }));
        setSolanaTrending(formatted);
      }
    } catch (error) {
      console.error('Error fetching Pump.fun trending:', error);
    } finally {
      setLoading(prev => ({ ...prev, solana: false }));
    }

    setLastUpdate(new Date());
  };

  useEffect(() => {
    fetchTrending();

    // Refresh every 2 minutes
    const interval = setInterval(fetchTrending, 120000);
    return () => clearInterval(interval);
  }, []);

  const TokenCard = ({ token }: { token: TrendingToken }) => {
    const isPositive = (token.priceChange24h || 0) >= 0;
    const chainColor = token.chain === 'base' ? 'blue' : 'green';
    const explorerUrl = token.chain === 'base'
      ? `https://basescan.org/token/${token.mint}`
      : `https://solscan.io/token/${token.mint}`;

    return (
      <Card className={`hover:shadow-lg transition-all cursor-pointer border-${chainColor}-500/20 hover:border-${chainColor}-500/40`}>
        <CardHeader>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              {token.imageUri ? (
                <img
                  src={token.imageUri}
                  alt={token.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              ) : (
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-${chainColor}-500/20 to-${chainColor}-600/20 flex items-center justify-center`}>
                  {token.chain === 'base' ? (
                    <Zap className={`h-6 w-6 text-${chainColor}-500`} />
                  ) : (
                    <Activity className={`h-6 w-6 text-${chainColor}-500`} />
                  )}
                </div>
              )}
              <div>
                <CardTitle className="text-base line-clamp-1">{token.name}</CardTitle>
                <CardDescription className="text-xs">${token.symbol}</CardDescription>
              </div>
            </div>
            <Badge
              variant="secondary"
              className={token.chain === 'base' ? "bg-blue-500/20 text-blue-500" : "bg-green-500/20 text-green-500"}
            >
              {token.platform === 'zora' ? 'Zora' : 'Pump.fun'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              Market Cap
            </span>
            <span className="font-semibold">{formatCurrency(token.marketCap)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <Activity className="h-3 w-3" />
              24h Volume
            </span>
            <span className="font-semibold">{formatCurrency(token.volume24h)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <Users className="h-3 w-3" />
              Holders
            </span>
            <span className="font-semibold">{formatNumber(token.holderCount)}</span>
          </div>
          {token.priceChange24h !== undefined && token.priceChange24h !== 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">24h Change</span>
              <span className={`font-semibold flex items-center gap-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {isPositive ? '+' : ''}{token.priceChange24h.toFixed(2)}%
              </span>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-2"
            onClick={() => window.open(explorerUrl, '_blank')}
          >
            View on Explorer
            <ExternalLink className="ml-2 h-3 w-3" />
          </Button>
        </CardContent>
      </Card>
    );
  };

  const LoadingCard = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3 mb-3">
          <Skeleton className="w-12 h-12 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold gradient-text flex items-center gap-2">
            <Flame className="h-6 w-6 text-orange-500" />
            Trending Creator Coins
          </h2>
          <p className="mt-2 text-muted-foreground">
            Hottest coins across Base (Zora) and Solana (Pump.fun)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            Last update: {lastUpdate.toLocaleTimeString()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTrending}
            disabled={loading.base || loading.solana}
          >
            <RefreshCw className={`h-4 w-4 ${(loading.base || loading.solana) ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Tabs for Chain Selection */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="all">All Chains</TabsTrigger>
          <TabsTrigger value="base">Base</TabsTrigger>
          <TabsTrigger value="solana">Solana</TabsTrigger>
        </TabsList>

        {/* All Chains View */}
        <TabsContent value="all" className="space-y-6">
          {/* Base Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Zap className="h-4 w-4 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold">Base Network (Zora)</h3>
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-500">
                {baseTrending.length} coins
              </Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {loading.base ? (
                Array.from({ length: 3 }).map((_, i) => <LoadingCard key={i} />)
              ) : baseTrending.length > 0 ? (
                baseTrending.map((token) => <TokenCard key={token.mint} token={token} />)
              ) : (
                <Card className="col-span-full">
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    No trending Base tokens found
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Solana Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Activity className="h-4 w-4 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold">Solana Network (Pump.fun)</h3>
              <Badge variant="secondary" className="bg-green-500/20 text-green-500">
                {solanaTrending.length} coins
              </Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {loading.solana ? (
                Array.from({ length: 6 }).map((_, i) => <LoadingCard key={i} />)
              ) : solanaTrending.length > 0 ? (
                solanaTrending.map((token) => <TokenCard key={token.mint} token={token} />)
              ) : (
                <Card className="col-span-full">
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    No trending Solana tokens found
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Base Only */}
        <TabsContent value="base">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {loading.base ? (
              Array.from({ length: 3 }).map((_, i) => <LoadingCard key={i} />)
            ) : baseTrending.length > 0 ? (
              baseTrending.map((token) => <TokenCard key={token.mint} token={token} />)
            ) : (
              <Card className="col-span-full">
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No trending Base tokens found
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Solana Only */}
        <TabsContent value="solana">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {loading.solana ? (
              Array.from({ length: 6 }).map((_, i) => <LoadingCard key={i} />)
            ) : solanaTrending.length > 0 ? (
              solanaTrending.map((token) => <TokenCard key={token.mint} token={token} />)
            ) : (
              <Card className="col-span-full">
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No trending Solana tokens found
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Summary Stats */}
      <Card className="border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Market Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-3 rounded-lg bg-background">
              <p className="text-xs text-muted-foreground mb-1">Total Trending</p>
              <p className="text-2xl font-bold">{baseTrending.length + solanaTrending.length}</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-background">
              <p className="text-xs text-muted-foreground mb-1">Base Coins</p>
              <p className="text-2xl font-bold text-blue-500">{baseTrending.length}</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-background">
              <p className="text-xs text-muted-foreground mb-1">Solana Coins</p>
              <p className="text-2xl font-bold text-green-500">{solanaTrending.length}</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-background">
              <p className="text-xs text-muted-foreground mb-1">Total Market Cap</p>
              <p className="text-2xl font-bold">
                {formatCurrency(
                  [...baseTrending, ...solanaTrending].reduce((sum, t) => sum + t.marketCap, 0)
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
