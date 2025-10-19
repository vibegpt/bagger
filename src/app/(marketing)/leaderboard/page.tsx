"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Zap, TrendingUp, Users, DollarSign, Trophy, Medal, Award, ExternalLink } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LeaderboardEntry {
  rank: number;
  address: string;
  name?: string;
  imageUrl?: string;
  totalMarketCap: number;
  totalVolume: number;
  totalHolders: number;
  successRate?: number;
  tokensCreated?: number;
  platform: "zora" | "pumpfun";
}

export default function LeaderboardPage() {
  const [zoraLeaderboard, setZoraLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [pumpfunLeaderboard, setPumpfunLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboards() {
      try {
        const [zoraRes, pumpfunRes] = await Promise.all([
          fetch("/api/leaderboard?platform=zora&limit=10"),
          fetch("/api/leaderboard?platform=pumpfun&limit=10"),
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
        setLoading(false);
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

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("en-US").format(value);
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Award className="h-6 w-6 text-amber-600" />;
    return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
  };

  const LeaderboardTable = ({ entries, platform }: { entries: LeaderboardEntry[]; platform: "zora" | "pumpfun" }) => {
    if (loading) {
      return (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-16 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (entries.length === 0) {
      return (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No leaderboard data available yet.</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-3">
        {entries.map((entry) => (
          <Link
            key={entry.address}
            href={`/creator/${entry.address}?platform=${platform}`}
            className="block"
          >
            <Card className={`hover:border-primary/50 transition-all ${
              entry.rank <= 3 ? "border-primary/30 bg-gradient-to-r from-primary/5 to-transparent" : ""
            }`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className="flex items-center justify-center w-12">
                    {getRankIcon(entry.rank)}
                  </div>

                  {/* Avatar */}
                  <Avatar className="size-10 border-2 border-muted">
                    <AvatarImage src={entry.imageUrl || ""} alt={entry.name || `Creator #${entry.rank}`} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-xs font-bold">
                      {entry.name?.slice(0, 2).toUpperCase() || entry.rank}
                    </AvatarFallback>
                  </Avatar>

                {/* Creator Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate mb-1">
                    {entry.name || `Creator #${entry.rank}`}
                  </p>
                  <code className="text-xs text-muted-foreground">
                    {formatAddress(entry.address)}
                  </code>
                </div>

                {/* Stats Grid */}
                <div className="hidden md:grid grid-cols-3 gap-6 text-right">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Market Cap</p>
                    <p className="text-sm font-semibold">{formatCurrency(entry.totalMarketCap)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Volume</p>
                    <p className="text-sm font-semibold">{formatCurrency(entry.totalVolume)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Holders</p>
                    <p className="text-sm font-semibold">{formatNumber(entry.totalHolders)}</p>
                  </div>
                </div>

                {/* Pump.fun Specific */}
                {platform === "pumpfun" && entry.successRate && (
                  <div className="hidden lg:block text-right">
                    <p className="text-xs text-muted-foreground mb-1">Success Rate</p>
                    <p className="text-sm font-semibold text-green-500">{entry.successRate}%</p>
                  </div>
                )}

                {/* Arrow */}
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </div>

              {/* Mobile Stats */}
              <div className="md:hidden grid grid-cols-3 gap-4 mt-3 pt-3 border-t">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Market Cap</p>
                  <p className="text-sm font-semibold">{formatCurrency(entry.totalMarketCap)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Volume</p>
                  <p className="text-sm font-semibold">{formatCurrency(entry.totalVolume)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Holders</p>
                  <p className="text-sm font-semibold">{formatNumber(entry.totalHolders)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
    );
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
            <Link href="/discover">
              <Button variant="ghost">Discover</Button>
            </Link>
            <Link href="/sign-up">
              <Button className="glow-primary">Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="h-8 w-8 text-yellow-500" />
              <Badge variant="outline" className="text-sm">
                Top Creator Rankings
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">
              Web3 Creator Leaderboard
            </h1>
            <p className="text-xl text-muted-foreground">
              Discover the top performing creators on Zora and Pump.fun
            </p>
          </div>
        </div>
      </section>

      {/* Leaderboard */}
      <section className="container mx-auto px-4 py-12">
        <Tabs defaultValue="zora" className="space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="zora">
                <TrendingUp className="h-4 w-4 mr-2" />
                Zora Leaderboard
              </TabsTrigger>
              <TabsTrigger value="pumpfun">
                <Users className="h-4 w-4 mr-2" />
                Pump.fun Leaderboard
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Updated Daily
              </Badge>
              <Badge variant="outline" className="text-xs bg-green-500/10 text-green-500 border-green-500/20">
                Live Data
              </Badge>
            </div>
          </div>

          {/* Zora Leaderboard */}
          <TabsContent value="zora" className="space-y-6">
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Top Zora Creators
                </CardTitle>
                <CardDescription>
                  Ranked by total market cap across Creator Coins and Content Coins
                </CardDescription>
              </CardHeader>
            </Card>

            <LeaderboardTable entries={zoraLeaderboard} platform="zora" />

            {/* Coming Soon */}
            <Card className="border-dashed">
              <CardContent className="py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  More rankings coming soon. Want to see your stats?{" "}
                  <Link href="/sign-up" className="text-primary hover:underline">
                    Sign up now
                  </Link>
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pump.fun Leaderboard */}
          <TabsContent value="pumpfun" className="space-y-6">
            <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Top Pump.fun Creators
                </CardTitle>
                <CardDescription>
                  Ranked by total market cap across all created tokens
                </CardDescription>
              </CardHeader>
            </Card>

            <LeaderboardTable entries={pumpfunLeaderboard} platform="pumpfun" />

            {/* Coming Soon */}
            <Card className="border-dashed">
              <CardContent className="py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  More rankings coming soon. Want to see your stats?{" "}
                  <Link href="/sign-up" className="text-primary hover:underline">
                    Sign up now
                  </Link>
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      {/* Stats Banner */}
      {!loading && (zoraLeaderboard.length > 0 || pumpfunLeaderboard.length > 0) && (
        <section className="container mx-auto px-4 py-12">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="text-center border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader>
                <CardTitle className="text-3xl font-bold gradient-text">
                  {zoraLeaderboard.reduce((sum, e) => sum + e.totalHolders, 0).toLocaleString()}
                </CardTitle>
                <CardDescription>Total Holders (Zora)</CardDescription>
              </CardHeader>
            </Card>
            <Card className="text-center border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
              <CardHeader>
                <CardTitle className="text-3xl font-bold gradient-text">
                  {formatCurrency(pumpfunLeaderboard.reduce((sum, e) => sum + e.totalMarketCap, 0))}
                </CardTitle>
                <CardDescription>Combined Market Cap (Pump.fun)</CardDescription>
              </CardHeader>
            </Card>
            <Card className="text-center border-green-500/20 bg-gradient-to-br from-green-500/5 to-transparent">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-green-500">
                  100% Free
                </CardTitle>
                <CardDescription>Public Leaderboard Access</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-12">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              Want to Join the Leaderboard?
            </CardTitle>
            <CardDescription>
              Track your creator stats and compete for the top spot
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center pb-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/sign-up">
                <Button size="lg" className="glow-primary">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Start Tracking Free
                </Button>
              </Link>
              <Link href="/discover">
                <Button size="lg" variant="outline">
                  Search Any Creator
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Free tier available • Advanced analytics for premium users
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
