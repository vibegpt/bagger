"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Coins, TrendingUp, Users, Wallet, Zap } from "lucide-react";
import { ZoraWalletConnect } from "@/components/crypto/zora-wallet-connect";
import { PhantomWalletButton } from "@/components/crypto/phantom-wallet-button";
import { WalletSecurityTooltip } from "@/components/crypto/wallet-security-tooltip";
import { ZoraHoldingsDashboard } from "@/components/crypto/zora-holdings-dashboard";
import { PumpFunHoldingsDashboard } from "@/components/crypto/pumpfun-holdings-dashboard";
import { PortfolioOverview } from "@/components/crypto/portfolio-overview";
import { PortfolioChart } from "@/components/crypto/portfolio-chart";
import { EarningsChart } from "@/components/crypto/earnings-chart";
import { useZoraStats } from "@/hooks/use-zora-stats";
import { usePumpFunStats } from "@/hooks/use-pumpfun-stats";
import { usePortfolioTrends } from "@/hooks/use-portfolio-trends";

export default function CryptoPage() {
  const [ethWallet, setEthWallet] = useState<string | null>(null);
  const [solanaWallet, setSolanaWallet] = useState<string | null>(null);

  // Handle ETH wallet connection with logging
  const handleEthWalletConnect = (address: string) => {
    console.log('[CryptoPage] ETH wallet connected:', address);
    setEthWallet(address || null);
  };

  // Handle Solana wallet connection with logging
  const handleSolanaWalletConnect = (address: string) => {
    console.log('[CryptoPage] Solana wallet connected:', address);
    setSolanaWallet(address || null);
  };

  // Fetch stats for charts
  const { stats: zoraStats } = useZoraStats(ethWallet);
  const { stats: pumpStats } = usePumpFunStats(solanaWallet);

  // Calculate totals for trend data
  const zoraTotalValue = zoraStats
    ? (zoraStats.creatorCoin?.marketCap || 0) +
      zoraStats.performance.totalContentCoinsValue
    : 0;
  const pumpTotalValue = pumpStats ? pumpStats.totalMarketCap : 0;
  const totalPortfolioValue = zoraTotalValue + pumpTotalValue;

  const totalEarnings =
    (zoraStats?.earnings.totalEarnings || 0) +
    (pumpStats?.earnings.estimatedTotalEarnings || 0);

  // Generate trend data
  const trendData = usePortfolioTrends(totalPortfolioValue, totalEarnings);

  const hasAnyWallet = ethWallet || solanaWallet;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Your Bags</h1>
          <p className="mt-2 text-muted-foreground">
            Track your creator bags across Zora (Base) and Pump.fun (Solana)
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Base Wallet (Zora)</span>
              <WalletSecurityTooltip />
            </div>
            <ZoraWalletConnect onConnect={handleEthWalletConnect} />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Solana Wallet (Pump.fun)</span>
              <WalletSecurityTooltip />
            </div>
            <PhantomWalletButton onConnect={handleSolanaWalletConnect} />
          </div>
        </div>
      </div>

      {/* Portfolio Overview */}
      <PortfolioOverview ethWallet={ethWallet} solanaWallet={solanaWallet} />

      {/* Charts - Only show when wallet is connected */}
      {hasAnyWallet && totalPortfolioValue > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          <PortfolioChart
            data={trendData}
            title="Portfolio Value"
            description="Track your total bag value over time"
          />
          <EarningsChart
            data={trendData}
            title="Bags Secured"
          />
        </div>
      )}

      {/* Platform Tabs */}
      <Tabs defaultValue="zora" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="zora">Zora (Base)</TabsTrigger>
          <TabsTrigger value="pumpfun">Pump.fun (Solana)</TabsTrigger>
        </TabsList>

        {/* Zora Tab */}
        <TabsContent value="zora" className="space-y-6">
          {ethWallet ? (
            <ZoraHoldingsDashboard walletAddress={ethWallet} />
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
          {/* Zora Integration */}
          <Card className="cyber-border bento-item">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
                  <Coins className="h-6 w-6 text-white" />
                </div>
                <Badge variant="secondary" className="bg-green-500/20 text-green-500">
                  Live
                </Badge>
              </div>
              <CardTitle className="mt-4">Zora Creator Coins</CardTitle>
              <CardDescription>
                Track your bags from Creator Coins, Content Coins, and trading fees on Zora
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Creator Coin Price</span>
                  <span className="font-semibold">-</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Content Coins</span>
                  <span className="font-semibold">-</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Trading Fees Earned</span>
                  <span className="font-semibold">-</span>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground text-center">
                Connect wallet to view your stats
              </p>
            </CardContent>
          </Card>

            </div>
          )}
        </TabsContent>

        {/* Pump.fun Tab */}
        <TabsContent value="pumpfun" className="space-y-6">
          {solanaWallet ? (
            <PumpFunHoldingsDashboard walletAddress={solanaWallet} />
          ) : (
            <Card className="cyber-border bento-item">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-between rounded-xl bg-gradient-to-br from-accent to-primary">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <Badge variant="secondary" className="bg-green-500/20 text-green-500">
                    Live
                  </Badge>
                </div>
                <CardTitle className="mt-4">Pump.fun</CardTitle>
                <CardDescription>
                  Track your bags from Solana tokens and see your holder growth
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Tokens Created</span>
                    <span className="font-semibold">-</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Market Cap</span>
                    <span className="font-semibold">-</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Success Rate</span>
                    <span className="font-semibold">-</span>
                  </div>
                </div>
                <p className="mt-4 text-sm text-muted-foreground text-center">
                  Connect Phantom wallet to view your stats
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Info Card */}
      <Card className="bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Secure The Bag</CardTitle>
              <CardDescription className="mt-1">
                The first multi-platform bag tracker for Web3 creators
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <span className="text-primary">✓</span>
              Track your bags from Zora creator coins
            </p>
            <p className="flex items-center gap-2">
              <span className="text-primary">✓</span>
              Monitor Solana token bags on Pump.fun
            </p>
            <p className="flex items-center gap-2">
              <span className="text-primary">✓</span>
              Unified dashboard for all your Web3 bags
            </p>
            <p className="flex items-center gap-2">
              <span className="text-primary">✓</span>
              Real-time tracking of bags secured
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Preview - Only shown when wallet NOT connected */}
      {!ethWallet && !solanaWallet && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Earnings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">Connect to view</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Active Coins</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">Creator & content</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Trading Volume</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">24h activity</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Market Cap</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">Total value</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
