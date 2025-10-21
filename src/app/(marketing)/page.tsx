"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Zap, TrendingUp, BarChart3, Video, MessageSquare, CheckCircle2, ArrowRight, Coins, Users, Activity, Search, Trophy, DollarSign, Sparkles, Target, Bell, Lock } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// Leaderboard preview types
interface LeaderboardEntry {
  rank: number;
  address: string;
  name?: string;
  imageUrl?: string;
  totalMarketCap: number;
  totalVolume: number;
  totalHolders: number;
  platform: "zora" | "pumpfun";
}

export default function LandingPage() {
  const [zoraLeaderboard, setZoraLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [pumpfunLeaderboard, setPumpfunLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);

  useEffect(() => {
    async function fetchLeaderboards() {
      try {
        const [zoraRes, pumpfunRes] = await Promise.all([
          fetch("/api/leaderboard?platform=zora&limit=5"),
          fetch("/api/leaderboard?platform=pumpfun&limit=5"),
        ]);

        if (zoraRes.ok) {
          const zoraData = await zoraRes.json();
          if (zoraData.success) {
            setZoraLeaderboard(zoraData.data);
          }
        }

        if (pumpfunRes.ok) {
          const pumpfunData = await pumpfunRes.json();
          if (pumpfunData.success) {
            setPumpfunLeaderboard(pumpfunData.data);
          }
        }
      } catch (error) {
        console.error("Failed to fetch leaderboards:", error);
      } finally {
        setLoadingLeaderboard(false);
      }
    }

    fetchLeaderboards();
  }, []);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
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
            <Link href="/discover">
              <Button variant="ghost">Search</Button>
            </Link>
            <Link href="/leaderboard">
              <Button variant="ghost">Leaderboard</Button>
            </Link>
            <Link href="/sign-in">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button className="glow-primary">Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section - Creator Dashboard Focus */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Value Prop */}
          <div>
            <div className="flex flex-wrap gap-2 mb-6">
              <Badge className="bg-primary/10 text-primary border-primary/20" variant="outline">
                For Web3 Creators
              </Badge>
              <Badge className="bg-green-500/10 text-green-500 border-green-500/20" variant="outline">
                Free Beta Access
              </Badge>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Track Your Token Revenue
              <span className="block gradient-text mt-2">Across All Platforms</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Unified analytics dashboard for creators managing tokens on Pump.fun and Zora. Track earnings, predict LTV, and optimize your strategy.
            </p>

            {/* Key Benefits */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mt-0.5">
                  <Coins className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Multi-Chain</p>
                  <p className="text-sm text-muted-foreground">Solana + Base</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 mt-0.5">
                  <TrendingUp className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="font-semibold">LTV Predictions</p>
                  <p className="text-sm text-muted-foreground">AI-powered</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mt-0.5">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Churn Alerts</p>
                  <p className="text-sm text-muted-foreground">Real-time</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 mt-0.5">
                  <Target className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="font-semibold">Performance</p>
                  <p className="text-sm text-muted-foreground">Insights</p>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/sign-up">
                <Button size="lg" className="text-lg px-8 glow-primary w-full sm:w-auto">
                  Start Tracking Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/crypto">
                <Button size="lg" variant="outline" className="text-lg px-8 w-full sm:w-auto">
                  <Sparkles className="mr-2 h-5 w-5" />
                  View Demo
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              No credit card required • Free forever • Join 100+ creators
            </p>
          </div>

          {/* Right: Dashboard Preview */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 blur-3xl" />
            <Card className="relative border-primary/20 bg-gradient-to-br from-background/95 to-background/80 backdrop-blur">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Your Portfolio</CardTitle>
                  <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                    Live
                  </Badge>
                </div>
                <CardDescription>Real-time analytics across all your tokens</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Total Value Card */}
                <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-accent/5 border border-primary/20">
                  <p className="text-sm text-muted-foreground mb-1">Total Portfolio Value</p>
                  <p className="text-3xl font-bold gradient-text">$124,567</p>
                  <p className="text-sm text-green-500 mt-1">+23.4% (24h)</p>
                </div>

                {/* Token List Preview */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent" />
                      <div>
                        <p className="font-semibold">Creator Coin #1</p>
                        <p className="text-xs text-muted-foreground">Zora • Base</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">$45.2K</p>
                      <p className="text-xs text-green-500">+12.3%</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-accent to-primary" />
                      <div>
                        <p className="font-semibold">Token #2</p>
                        <p className="text-xs text-muted-foreground">Pump.fun • SOL</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">$32.1K</p>
                      <p className="text-xs text-green-500">+8.7%</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent" />
                      <div>
                        <p className="font-semibold">Creator Coin #3</p>
                        <p className="text-xs text-muted-foreground">Zora • Base</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">$18.9K</p>
                      <p className="text-xs text-red-500">-2.1%</p>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="text-center p-2">
                    <p className="text-2xl font-bold gradient-text">8</p>
                    <p className="text-xs text-muted-foreground">Total Tokens</p>
                  </div>
                  <div className="text-center p-2">
                    <p className="text-2xl font-bold gradient-text">1.2K</p>
                    <p className="text-xs text-muted-foreground">Total Holders</p>
                  </div>
                  <div className="text-center p-2">
                    <p className="text-2xl font-bold gradient-text">75%</p>
                    <p className="text-xs text-muted-foreground">Success Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Proof - Stats */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
          <Card className="text-center border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader>
              <CardTitle className="text-4xl font-bold gradient-text">2</CardTitle>
              <CardDescription>Blockchain Networks</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Solana & Base</p>
            </CardContent>
          </Card>
          <Card className="text-center border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
            <CardHeader>
              <CardTitle className="text-4xl font-bold gradient-text">∞</CardTitle>
              <CardDescription>Unlimited Tokens</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Track as many as you create</p>
            </CardContent>
          </Card>
          <Card className="text-center border-green-500/20 bg-gradient-to-br from-green-500/5 to-transparent">
            <CardHeader>
              <CardTitle className="text-4xl font-bold text-green-500">Free</CardTitle>
              <CardDescription>Beta Access</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Early adopter benefits</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Free Search Section - Lead Magnet (Below Fold) */}
      <section className="container mx-auto px-4 py-16 border-t">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <Badge className="mb-4 bg-green-500/10 text-green-500 border-green-500/20" variant="outline">
            Free Public Tools
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Or Search Any Token for Free
          </h2>
          <p className="text-lg text-muted-foreground">
            View live market data for any creator or token on Pump.fun and Zora. No account required.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <Link href="/discover" className="block">
            <div className="flex gap-2 p-2 rounded-lg border-2 border-dashed border-primary/30 hover:border-primary/50 transition-colors cursor-pointer bg-background/50">
              <Input
                type="text"
                placeholder="Search token address or creator wallet..."
                className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 cursor-pointer"
                readOnly
              />
              <Button className="glow-primary">
                <Search className="h-4 w-4 mr-2" />
                Search Free
              </Button>
            </div>
          </Link>
          <p className="text-center text-xs text-muted-foreground mt-3">
            <Lock className="h-3 w-3 inline mr-1" />
            No registration needed • View live market cap, volume, and holder data
          </p>
        </div>

        {/* Leaderboard Preview */}
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Top Performing Creators
            </h3>
            <Link href="/leaderboard">
              <Button variant="outline" size="sm">
                View Full Leaderboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Zora Top 5 */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  Zora (Base)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {loadingLeaderboard ? (
                  <>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 animate-pulse">
                        <div className="h-8 w-8 rounded-full bg-muted" />
                        <div className="flex-1 space-y-1">
                          <div className="h-4 bg-muted rounded w-24" />
                          <div className="h-3 bg-muted rounded w-16" />
                        </div>
                      </div>
                    ))}
                  </>
                ) : zoraLeaderboard.length > 0 ? (
                  zoraLeaderboard.map((entry) => (
                    <Link
                      key={entry.address}
                      href={`/creator/${entry.address}?platform=zora`}
                      className="block hover:bg-muted/30 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-3 p-2">
                        <span className="text-sm font-bold text-muted-foreground w-6">
                          #{entry.rank}
                        </span>
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={entry.imageUrl || ""} />
                          <AvatarFallback className="text-xs">{entry.rank}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {entry.name || formatAddress(entry.address)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency(entry.totalMarketCap)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Coming soon
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Pump.fun Top 5 */}
            <Card className="border-accent/20">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Activity className="h-4 w-4 text-accent" />
                  Pump.fun (Solana)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {loadingLeaderboard ? (
                  <>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 animate-pulse">
                        <div className="h-8 w-8 rounded-full bg-muted" />
                        <div className="flex-1 space-y-1">
                          <div className="h-4 bg-muted rounded w-24" />
                          <div className="h-3 bg-muted rounded w-16" />
                        </div>
                      </div>
                    ))}
                  </>
                ) : pumpfunLeaderboard.length > 0 ? (
                  pumpfunLeaderboard.map((entry) => (
                    <Link
                      key={entry.address}
                      href={`/creator/${entry.address}?platform=pumpfun`}
                      className="block hover:bg-muted/30 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-3 p-2">
                        <span className="text-sm font-bold text-muted-foreground w-6">
                          #{entry.rank}
                        </span>
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={entry.imageUrl || ""} />
                          <AvatarFallback className="text-xs">{entry.rank}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {entry.name || formatAddress(entry.address)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency(entry.totalMarketCap)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Coming soon
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Conversion CTA */}
          <Card className="mt-6 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <p className="font-semibold mb-1">Is this your creator profile?</p>
                  <p className="text-sm text-muted-foreground">
                    Claim it to access your full analytics dashboard, LTV predictions, and more
                  </p>
                </div>
                <Link href="/sign-up">
                  <Button className="glow-primary whitespace-nowrap">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Track Your Tokens
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <Badge className="mb-4" variant="outline">Creator Features</Badge>
          <h2 className="text-4xl font-bold mb-4">Everything You Need to Manage Your Tokens</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A complete analytics suite designed specifically for Web3 creators
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Feature 1 */}
          <Card className="cyber-border bento-item hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent mb-4 glow-primary">
                <Coins className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Multi-Chain Portfolio</CardTitle>
              <CardDescription>
                Track all your tokens across Pump.fun (Solana) and Zora (Base) in one unified dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Unlimited token tracking
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Real-time market data
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Portfolio aggregation
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Feature 2 */}
          <Card className="cyber-border bento-item hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-primary mb-4 glow-primary">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <CardTitle>LTV Predictions</CardTitle>
              <CardDescription>
                AI-powered lifetime value predictions for your token holders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Holder value scoring
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Churn risk alerts
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Revenue forecasting
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Feature 3 */}
          <Card className="cyber-border bento-item hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent mb-4 glow-primary">
                <Video className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Stream Correlation</CardTitle>
              <CardDescription>
                See how your streams impact token performance with before/after analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Stream logging
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Token snapshots
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Impact metrics
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Feature 4 */}
          <Card className="cyber-border bento-item hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-primary mb-4 glow-primary">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Social Engagement</CardTitle>
              <CardDescription>
                Track posts across platforms and discover your best posting times
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Multi-platform tracking
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Best time to post
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Engagement analytics
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Feature 5 */}
          <Card className="cyber-border bento-item hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent mb-4 glow-primary">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Advanced Analytics</CardTitle>
              <CardDescription>
                Compare tokens side-by-side with powerful visualization tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Token comparison charts
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Performance metrics
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Graduation tracking
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Feature 6 */}
          <Card className="cyber-border bento-item hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-primary mb-4 glow-primary">
                <Users className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Holder Analytics</CardTitle>
              <CardDescription>
                Track holder counts and growth across all your tokens
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Holder tracking
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Growth metrics
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Community size
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-24 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="text-center mb-16">
          <Badge className="mb-4" variant="outline">How It Works</Badge>
          <h2 className="text-4xl font-bold mb-4">Get Started in 3 Simple Steps</h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent mx-auto mb-4 text-2xl font-bold text-white glow-primary">
              1
            </div>
            <h3 className="text-xl font-bold mb-2">Connect Your Wallets</h3>
            <p className="text-muted-foreground">
              Link your Phantom wallet (Solana) and Base wallet to start tracking
            </p>
          </div>

          <div className="text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent mx-auto mb-4 text-2xl font-bold text-white glow-primary">
              2
            </div>
            <h3 className="text-xl font-bold mb-2">View Your Portfolio</h3>
            <p className="text-muted-foreground">
              See all your tokens, market caps, and performance in one dashboard
            </p>
          </div>

          <div className="text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent mx-auto mb-4 text-2xl font-bold text-white glow-primary">
              3
            </div>
            <h3 className="text-xl font-bold mb-2">Track & Optimize</h3>
            <p className="text-muted-foreground">
              Log streams and posts to see what drives your token performance
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-24">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-4xl font-bold mb-4">
              Ready to Track Your Token Revenue?
            </CardTitle>
            <CardDescription className="text-lg">
              Join Web3 creators managing their portfolios with Bagger
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center pb-8">
            <Link href="/sign-up">
              <Button size="lg" className="text-lg px-12 glow-primary">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              No credit card required • Free forever
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary via-accent to-primary glow-primary">
                  <Zap className="h-4 w-4 text-white" fill="white" />
                </div>
                <h3 className="font-bold gradient-text">Bagger</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Analytics for Web3 Creators
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#features" className="hover:text-foreground">Features</Link></li>
                <li><Link href="/sign-up" className="hover:text-foreground">Get Started</Link></li>
                <li><Link href="/crypto" className="hover:text-foreground">Portfolio</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/discover" className="hover:text-foreground">Search Tokens</Link></li>
                <li><Link href="/leaderboard" className="hover:text-foreground">Leaderboard</Link></li>
                <li><a href="#" className="hover:text-foreground">Documentation</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-foreground">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>© 2025 Bagger. Built with ❤️ for Web3 creators.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
