"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, ExternalLink, ArrowLeft, TrendingUp, Users, Coins, DollarSign } from "lucide-react";
import { ZoraStatsDashboard } from "@/components/crypto/zora-stats-dashboard";
import { PumpFunStatsDashboard } from "@/components/crypto/pumpfun-stats-dashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CreatorProfilePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const address = params.address as string;
  const platform = (searchParams.get("platform") as "zora" | "pumpfun") || "zora";

  // Format address for display (show first 6 and last 4 chars)
  const formatAddress = (addr: string) => {
    if (addr.length < 12) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary via-accent to-primary glow-primary">
              <Zap className="h-6 w-6 text-white" fill="white" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">Bagger</h1>
              <p className="text-xs text-muted-foreground">Analytics for Web3 Creators</p>
            </div>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Home
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button className="glow-primary">Track Your Tokens</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Creator Profile Header */}
      <section className="border-b bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">Creator Profile</h1>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  {platform === "zora" ? "Zora (Base)" : "Pump.fun (Solana)"}
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <code className="text-sm bg-muted px-3 py-1 rounded-lg font-mono">
                  {formatAddress(address)}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(address)}
                  className="h-8"
                >
                  Copy Full Address
                </Button>
              </div>
              <p className="text-sm text-muted-foreground max-w-2xl">
                Public creator analytics powered by Bagger. All metrics are derived from on-chain data.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Button variant="outline" size="sm" asChild>
                <a
                  href={
                    platform === "zora"
                      ? `https://basescan.org/address/${address}`
                      : `https://solscan.io/account/${address}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on Explorer
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Link href="/sign-up">
                <Button size="sm" className="w-full glow-primary">
                  Claim This Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Switcher & Stats */}
      <section className="container mx-auto px-4 py-8">
        <Tabs defaultValue={platform} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="zora" asChild>
                <Link href={`/creator/${address}?platform=zora`}>
                  Zora Stats
                </Link>
              </TabsTrigger>
              <TabsTrigger value="pumpfun" asChild>
                <Link href={`/creator/${address}?platform=pumpfun`}>
                  Pump.fun Stats
                </Link>
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                🔓 Public View
              </Badge>
              <Badge variant="outline" className="text-xs bg-green-500/10 text-green-500 border-green-500/20">
                Live Data
              </Badge>
            </div>
          </div>

          <TabsContent value="zora" className="space-y-6">
            {/* Info Banner */}
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">
                      Viewing Zora Creator Stats
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      This shows the creator's Zora Creator Coin and Content Coins performance.
                      <Link href="/sign-up" className="text-primary hover:underline ml-1">
                        Sign up to track your own tokens
                      </Link>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Zora Dashboard */}
            <ZoraStatsDashboard walletAddress={address} />
          </TabsContent>

          <TabsContent value="pumpfun" className="space-y-6">
            {/* Info Banner */}
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <Coins className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">
                      Viewing Pump.fun Creator Stats
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      This shows all tokens created by this address on Pump.fun.
                      <Link href="/sign-up" className="text-primary hover:underline ml-1">
                        Sign up to track your own portfolio
                      </Link>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pump.fun Dashboard */}
            <PumpFunStatsDashboard creatorAddress={address} />
          </TabsContent>
        </Tabs>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-12">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              Track Your Own Creator Tokens
            </CardTitle>
            <CardDescription>
              Get advanced analytics, LTV predictions, and churn alerts for your portfolio
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center pb-6">
            <div className="grid gap-4 md:grid-cols-3 max-w-3xl mx-auto mb-6">
              <div className="flex flex-col items-center gap-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm font-medium">LTV Predictions</p>
                <p className="text-xs text-muted-foreground">Forecast holder lifetime value</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-primary">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm font-medium">Churn Alerts</p>
                <p className="text-xs text-muted-foreground">Identify at-risk holders</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm font-medium">Advanced Insights</p>
                <p className="text-xs text-muted-foreground">Content performance analysis</p>
              </div>
            </div>
            <Link href="/sign-up">
              <Button size="lg" className="glow-primary">
                Get Started Free
              </Button>
            </Link>
            <p className="mt-3 text-xs text-muted-foreground">
              No credit card required • Free tier available
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t mt-12">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>
            © 2025 Bagger • Built for Web3 Creators •{" "}
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            {" • "}
            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
