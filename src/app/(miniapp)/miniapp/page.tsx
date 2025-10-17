"use client";

import { useEffect, useState } from "react";
import sdk from "@farcaster/frame-sdk";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingTokens } from "@/components/crypto/trending-tokens";
import { CrossChainComparison } from "@/components/crypto/cross-chain-comparison";
import { PortfolioOverview } from "@/components/crypto/portfolio-overview";
import { ZoraHoldingsDashboard } from "@/components/crypto/zora-holdings-dashboard";
import { PumpFunHoldingsDashboard } from "@/components/crypto/pumpfun-holdings-dashboard";
import { ZoraWalletConnect } from "@/components/crypto/zora-wallet-connect";
import { PhantomWalletButton } from "@/components/crypto/phantom-wallet-button";
import { Flame, Zap, Activity, ExternalLink, User, Wallet as WalletIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function MiniAppPage() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [isInFrame, setIsInFrame] = useState(false);
  const [context, setContext] = useState<any>(null);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [ethWallet, setEthWallet] = useState<string | null>(null);
  const [solanaWallet, setSolanaWallet] = useState<string | null>(null);

  // Handle wallet connections
  const handleEthWalletConnect = (address: string) => {
    console.log('[MiniApp] ETH wallet connected:', address);
    setEthWallet(address || null);
  };

  const handleSolanaWalletConnect = (address: string) => {
    console.log('[MiniApp] Solana wallet connected:', address);
    setSolanaWallet(address || null);
  };

  const hasAnyWallet = ethWallet || solanaWallet;

  useEffect(() => {
    // Set a timeout to show fallback if SDK doesn't load
    const timeout = setTimeout(() => {
      setLoadingTimeout(true);
      setIsSDKLoaded(true);
    }, 3000);

    const load = async () => {
      try {
        // Initialize the Frame SDK
        const ctx = await sdk.context;
        setContext(ctx);
        sdk.actions.ready();
        setIsInFrame(true);
        setIsSDKLoaded(true);
        clearTimeout(timeout);
      } catch (error) {
        // Not in a Frame environment - show browser fallback
        console.log('[MiniApp] Not running in Frame context, showing browser fallback');
        setIsInFrame(false);
        setIsSDKLoaded(true);
        clearTimeout(timeout);
      }
    };

    if (sdk) {
      load();
    }

    return () => clearTimeout(timeout);
  }, []);

  if (!isSDKLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading Bagger Mini App...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <Link href="/" className="flex items-center gap-3 mb-2 hover:opacity-80 transition-opacity cursor-pointer">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold gradient-text">Bagger</h1>
            <p className="text-sm text-muted-foreground">Base & Solana Creator Coins</p>
          </div>
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-500">
              Base (Zora)
            </Badge>
            <Badge variant="secondary" className="bg-green-500/20 text-green-500">
              Solana (Pump.fun)
            </Badge>
          </div>
          {!isInFrame && (
            <Badge variant="outline" className="text-xs">
              Browser Preview
            </Badge>
          )}
        </div>
      </div>

      {/* Browser Preview Notice */}
      {!isInFrame && (
        <Card className="mb-6 border-blue-500/50 bg-blue-500/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <ExternalLink className="h-4 w-4 text-blue-500" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Preview Mode</p>
                <p className="text-xs text-muted-foreground">
                  You're viewing this Mini App in a browser. For the full experience with wallet
                  connections and personalized data, open this in the Base App or Farcaster.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => window.open('https://bagger.tools/crypto', '_blank')}
                >
                  Open Full Dashboard
                  <ExternalLink className="h-3 w-3 ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs defaultValue="trending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="portfolio">
            <User className="h-4 w-4 mr-2" />
            Portfolio
          </TabsTrigger>
          <TabsTrigger value="trending">
            <Flame className="h-4 w-4 mr-2" />
            Trending
          </TabsTrigger>
          <TabsTrigger value="compare">
            <Activity className="h-4 w-4 mr-2" />
            Compare
          </TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio" className="space-y-6">
          {!hasAnyWallet ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <WalletIcon className="h-5 w-5" />
                  Connect Your Wallets
                </CardTitle>
                <CardDescription>
                  View your personalized portfolio across Base and Solana
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Base Wallet (Zora)</span>
                    <Badge variant="secondary" className="bg-blue-500/20 text-blue-500">
                      ETH
                    </Badge>
                  </div>
                  <ZoraWalletConnect onConnect={handleEthWalletConnect} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Solana Wallet (Pump.fun)</span>
                    <Badge variant="secondary" className="bg-green-500/20 text-green-500">
                      SOL
                    </Badge>
                  </div>
                  <PhantomWalletButton onConnect={handleSolanaWalletConnect} />
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Portfolio Overview */}
              <PortfolioOverview ethWallet={ethWallet} solanaWallet={solanaWallet} />

              {/* Holdings Dashboards */}
              {ethWallet && <ZoraHoldingsDashboard walletAddress={ethWallet} />}
              {solanaWallet && <PumpFunHoldingsDashboard walletAddress={solanaWallet} />}
            </>
          )}
        </TabsContent>

        <TabsContent value="trending" className="space-y-6">
          <TrendingTokens />
        </TabsContent>

        <TabsContent value="compare" className="space-y-6">
          <CrossChainComparison />
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="mt-8 text-center text-xs text-muted-foreground">
        <p>Powered by Base & Solana</p>
        <p className="mt-1">bagger.tools - Track your creator coin bags</p>
      </div>
    </div>
  );
}
