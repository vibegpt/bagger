"use client";

import { useEffect, useState } from "react";
import sdk from "@farcaster/frame-sdk";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingTokens } from "@/components/crypto/trending-tokens";
import { CrossChainComparison } from "@/components/crypto/cross-chain-comparison";
import { Flame, Zap, Activity } from "lucide-react";

export default function MiniAppPage() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      // Initialize the Frame SDK
      const ctx = await sdk.context;
      setContext(ctx);
      sdk.actions.ready();
      setIsSDKLoaded(true);
    };

    if (sdk) {
      load();
    }
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
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold gradient-text">Bagger</h1>
            <p className="text-sm text-muted-foreground">Base & Solana Creator Coins</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="bg-blue-500/20 text-blue-500">
            Base (Zora)
          </Badge>
          <Badge variant="secondary" className="bg-green-500/20 text-green-500">
            Solana (Pump.fun)
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="trending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="trending">
            <Flame className="h-4 w-4 mr-2" />
            Trending
          </TabsTrigger>
          <TabsTrigger value="compare">
            <Activity className="h-4 w-4 mr-2" />
            Compare
          </TabsTrigger>
        </TabsList>

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
