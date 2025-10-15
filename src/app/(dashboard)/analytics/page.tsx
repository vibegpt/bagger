"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Coins, BarChart3, DollarSign, Users } from "lucide-react";
import { ZoraWalletConnect } from "@/components/crypto/zora-wallet-connect";
import { PhantomWalletButton } from "@/components/crypto/phantom-wallet-button";
import { useZoraStats } from "@/hooks/use-zora-stats";
import { usePumpFunStats } from "@/hooks/use-pumpfun-stats";
import { VolumeChart, HolderGrowthChart, CombinedMetricsChart } from "@/components/charts/volume-chart";
import { useAggregatedVolumeHistory } from "@/hooks/use-volume-history";

export default function AnalyticsPage() {
  const [ethWallet, setEthWallet] = useState<string | null>(null);
  const [solanaWallet, setSolanaWallet] = useState<string | null>(null);

  const { stats: zoraStats, isLoading: zoraLoading } = useZoraStats(ethWallet);
  const { stats: pumpStats, isLoading: pumpLoading } = usePumpFunStats(solanaWallet);

  // Generate historical data for charts
  const zoraCoins = useMemo(() => {
    return (zoraStats?.contentCoins || []).map(coin => ({
      address: coin.address,
      volume24h: coin.volume24h,
      holderCount: coin.holderCount
    }));
  }, [zoraStats?.contentCoins]);

  const { data: zoraVolumeData, isLoading: zoraVolumeLoading } = useAggregatedVolumeHistory(zoraCoins);

  const pumpCoins = useMemo(() => {
    return (pumpStats?.tokens || []).map(token => ({
      address: token.mint,
      volume24h: token.volume24h || 0,
      holderCount: token.holderCount
    }));
  }, [pumpStats?.tokens]);

  const { data: pumpVolumeData, isLoading: pumpVolumeLoading } = useAggregatedVolumeHistory(pumpCoins);

  const handleEthWalletConnect = (address: string) => {
    setEthWallet(address || null);
  };

  const handleSolanaWalletConnect = (address: string) => {
    setSolanaWallet(address || null);
  };

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Creator Analytics</h1>
          <p className="mt-2 text-muted-foreground">
            Track your creator coin performance and content coin metrics
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Base Wallet (Zora)</span>
            <ZoraWalletConnect onConnect={handleEthWalletConnect} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Solana Wallet (Pump.fun)</span>
            <PhantomWalletButton onConnect={handleSolanaWalletConnect} />
          </div>
        </div>
      </div>

      {!ethWallet && !solanaWallet ? (
        <Card className="bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>
              Connect your wallet to see detailed analytics about your creator coins and content performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Track your Creator Coin market cap, Content Coin performance, earnings, and more.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="zora" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="zora">Zora Analytics</TabsTrigger>
            <TabsTrigger value="pumpfun">Pump.fun Analytics</TabsTrigger>
          </TabsList>

          {/* Zora Analytics Tab */}
          <TabsContent value="zora" className="space-y-6">
            {zoraLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading analytics...
              </div>
            ) : !zoraStats ? (
              <div className="text-center py-8 text-muted-foreground">
                No data available. Connect your wallet to see analytics.
              </div>
            ) : (
              <>
                {/* Overview Metrics */}
                <div className="grid gap-4 md:grid-cols-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Creator Coin Value</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatCurrency(zoraStats.creatorCoin?.marketCap || 0)}
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        {zoraStats.creatorCoin?.priceChange24h ? (
                          <>
                            {zoraStats.creatorCoin.priceChange24h >= 0 ? (
                              <TrendingUp className="h-3 w-3 text-green-500" />
                            ) : (
                              <TrendingDown className="h-3 w-3 text-red-500" />
                            )}
                            <span className={zoraStats.creatorCoin.priceChange24h >= 0 ? "text-green-500" : "text-red-500"}>
                              {zoraStats.creatorCoin.priceChange24h >= 0 ? "+" : ""}
                              {zoraStats.creatorCoin.priceChange24h.toFixed(2)}%
                            </span>
                          </>
                        ) : (
                          "No change data"
                        )}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Content Coins Value</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatCurrency(zoraStats.performance.totalContentCoinsValue)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {zoraStats.totalPosts} coins created
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Total Earnings</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatCurrency(zoraStats.earnings.totalEarnings)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        From trading fees
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Total Portfolio</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatCurrency(
                          (zoraStats.creatorCoin?.marketCap || 0) +
                          zoraStats.performance.totalContentCoinsValue
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Combined value
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Top Performing Content Coins */}
                {zoraStats.contentCoins.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Performing Content Coins</CardTitle>
                      <CardDescription>
                        Your best performing content coins by market cap
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {zoraStats.contentCoins
                          .sort((a, b) => b.marketCap - a.marketCap)
                          .slice(0, 5)
                          .map((coin, index) => (
                            <div key={coin.id} className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-white text-sm font-bold">
                                  {index + 1}
                                </div>
                                <div>
                                  <p className="font-medium text-sm line-clamp-1">
                                    {coin.name || coin.postContent || `Post #${coin.postId.slice(0, 8)}`}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatCurrency(coin.volume24h)} 24h volume
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">{formatCurrency(coin.marketCap)}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatCurrency(coin.price)} per token
                                </p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Earnings Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle>Earnings Breakdown</CardTitle>
                    <CardDescription>
                      How you're earning from your coins
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Coins className="h-4 w-4 text-primary" />
                          <span className="text-sm">From Creator Coin</span>
                        </div>
                        <span className="font-semibold">
                          {formatCurrency(zoraStats.earnings.earningsBreakdown.fromCreatorCoin)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-accent" />
                          <span className="text-sm">From Content Coins</span>
                        </div>
                        <span className="font-semibold">
                          {formatCurrency(zoraStats.earnings.earningsBreakdown.fromContentCoins)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-semibold">Total Earnings</span>
                        </div>
                        <span className="font-bold text-lg">
                          {formatCurrency(zoraStats.earnings.totalEarnings)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Performance Charts */}
                {zoraVolumeData.length > 0 && (
                  <>
                    <CombinedMetricsChart
                      data={zoraVolumeData}
                      title="Content Coins Performance Over Time"
                      description="Combined trading volume and holder growth for all your content coins"
                    />
                    <div className="grid gap-6 md:grid-cols-2">
                      <VolumeChart
                        data={zoraVolumeData}
                        title="Trading Volume Trend"
                        description="Daily trading volume across all content coins"
                      />
                      <HolderGrowthChart
                        data={zoraVolumeData}
                        title="Holder Growth"
                        description="Total holders across all content coins"
                      />
                    </div>
                  </>
                )}
              </>
            )}
          </TabsContent>

          {/* Pump.fun Analytics Tab */}
          <TabsContent value="pumpfun" className="space-y-6">
            {pumpLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading analytics...
              </div>
            ) : !pumpStats ? (
              <div className="text-center py-8 text-muted-foreground">
                No data available. Connect your wallet to see analytics.
              </div>
            ) : (
              <>
                {/* Overview Metrics */}
                <div className="grid gap-4 md:grid-cols-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Total Market Cap</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatCurrency(pumpStats.totalMarketCap)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        All tokens combined
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Tokens Created</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {pumpStats.totalTokensCreated}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Total launches
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Success Rate</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {pumpStats.performance.successRate.toFixed(1)}%
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {pumpStats.successfulTokens} graduated
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Est. Earnings</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatCurrency(pumpStats.earnings.estimatedTotalEarnings)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        From bonding curves
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Performance Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Total Volume</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatCurrency(pumpStats.totalVolume)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        All-time trading volume
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Avg Market Cap</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatCurrency(pumpStats.performance.avgMarketCap)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Per token
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Total Buyers</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {pumpStats.performance.totalBuyers.toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Across all tokens
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Top Performing Tokens */}
                {pumpStats.tokens.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Performing Tokens</CardTitle>
                      <CardDescription>
                        Your best performing tokens by market cap
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {pumpStats.tokens
                          .sort((a, b) => b.marketCap - a.marketCap)
                          .slice(0, 5)
                          .map((token, index) => (
                          <div key={token.mint} className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-accent to-primary text-white text-sm font-bold">
                                {index + 1}
                              </div>
                              {token.imageUri && (
                                <img
                                  src={token.imageUri}
                                  alt={token.name}
                                  className="h-10 w-10 rounded-full object-cover"
                                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                              )}
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-sm">{token.name}</p>
                                  {token.complete && (
                                    <Badge variant="secondary" className="bg-green-500/20 text-green-400 text-xs">
                                      Graduated
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  ${token.symbol}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{formatCurrency(token.marketCap)}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                <Users className="h-3 w-3" />
                                {token.holderCount} holders
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Token Details Table */}
                {pumpStats.tokens.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>All Your Tokens</CardTitle>
                      <CardDescription>
                        Complete list of tokens you've created
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {pumpStats.tokens.map((token) => (
                          <div key={token.mint} className="grid grid-cols-4 gap-4 p-3 rounded-lg border text-sm">
                            <div>
                              <p className="font-medium">{token.name}</p>
                              <p className="text-xs text-muted-foreground">${token.symbol}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">Market Cap</p>
                              <p className="font-medium">{formatCurrency(token.marketCap)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">Volume</p>
                              <p className="font-medium">{formatCurrency(token.volumeAllTime)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">Holders</p>
                              <p className="font-medium">{token.holderCount}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
