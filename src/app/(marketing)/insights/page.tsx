"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Zap, TrendingUp, Sparkles, ArrowRight, ExternalLink, Trophy, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

export default function InsightsPage() {
  const [zoraTopPerformers, setZoraTopPerformers] = useState<LeaderboardEntry[]>([]);
  const [pumpfunTopPerformers, setPumpfunTopPerformers] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTopPerformers() {
      try {
        const [zoraRes, pumpfunRes] = await Promise.all([
          fetch("/api/leaderboard?platform=zora&limit=3"),
          fetch("/api/leaderboard?platform=pumpfun&limit=3"),
        ]);

        if (zoraRes.ok) {
          const zoraData = await zoraRes.json();
          if (zoraData.success) {
            setZoraTopPerformers(zoraData.data);
          }
        }

        if (pumpfunRes.ok) {
          const pumpfunData = await pumpfunRes.json();
          if (pumpfunData.success) {
            setPumpfunTopPerformers(pumpfunData.data);
          }
        }
      } catch (error) {
        console.error("Failed to fetch top performers:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTopPerformers();
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
            <Link href="/leaderboard">
              <Button variant="ghost">Leaderboard</Button>
            </Link>
            <Link href="/sign-up">
              <Button className="glow-primary">Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Page Header */}
      <section className="border-b bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <h1 className="text-2xl md:text-3xl font-bold">
                Creator Insights
              </h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Data-driven insights into the Web3 creator economy
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-12">

          {/* Top Performers This Week */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-yellow-500" />
                  Top Performers This Week
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Creators leading the pack across Zora and Pump.fun
                </p>
              </div>
              <Link href="/leaderboard">
                <Button variant="outline" size="sm">
                  View Full Leaderboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <Tabs defaultValue="zora" className="space-y-6">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="zora">Zora</TabsTrigger>
                <TabsTrigger value="pumpfun">Pump.fun</TabsTrigger>
              </TabsList>

              <TabsContent value="zora" className="space-y-4">
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Card key={i} className="animate-pulse">
                        <CardContent className="p-4">
                          <div className="h-16 bg-muted rounded" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : zoraTopPerformers.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-3">
                    {zoraTopPerformers.map((creator) => (
                      <Link
                        key={creator.address}
                        href={`/creator/${creator.address}?platform=zora`}
                      >
                        <Card className="hover:border-primary/50 transition-all h-full">
                          <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 text-white font-bold">
                                #{creator.rank}
                              </div>
                              <Avatar className="size-12 border-2 border-muted">
                                <AvatarImage src={creator.imageUrl || ""} alt={creator.name || `Creator #${creator.rank}`} />
                                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-bold">
                                  {creator.name?.slice(0, 2).toUpperCase() || creator.rank}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                            <p className="font-semibold mb-2">{creator.name || `Creator #${creator.rank}`}</p>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Market Cap</span>
                                <span className="font-semibold">{formatCurrency(creator.totalMarketCap)}</span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Holders</span>
                                <span className="font-semibold">{formatNumber(creator.totalHolders)}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <p className="text-muted-foreground">No data available</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="pumpfun" className="space-y-4">
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Card key={i} className="animate-pulse">
                        <CardContent className="p-4">
                          <div className="h-16 bg-muted rounded" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : pumpfunTopPerformers.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-3">
                    {pumpfunTopPerformers.map((creator) => (
                      <Link
                        key={creator.address}
                        href={`/token/${creator.address}?platform=pumpfun`}
                      >
                        <Card className="hover:border-accent/50 transition-all h-full">
                          <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 text-white font-bold">
                                #{creator.rank}
                              </div>
                              <Avatar className="size-12 border-2 border-muted">
                                <AvatarImage src={creator.imageUrl || ""} alt={creator.name || `Token #${creator.rank}`} />
                                <AvatarFallback className="bg-gradient-to-br from-accent to-primary text-white font-bold">
                                  {creator.name?.slice(0, 2).toUpperCase() || creator.rank}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                            <p className="font-semibold mb-2">{creator.name || `Token #${creator.rank}`}</p>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Market Cap</span>
                                <span className="font-semibold">{formatCurrency(creator.totalMarketCap)}</span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Holders</span>
                                <span className="font-semibold">{formatNumber(creator.totalHolders)}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <p className="text-muted-foreground">No data available</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Featured Creator Spotlight - Coming Soon */}
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              Featured Creator Spotlight
            </h2>
            <Card className="border-dashed border-2">
              <CardContent className="py-16 text-center">
                <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Coming Soon</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                  In-depth creator profiles, strategy breakdowns, and success stories from top Web3 creators
                </p>
                <Link href="/sign-up">
                  <Button variant="outline">
                    Get Notified
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Platform Updates */}
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              Latest Updates
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20">New</Badge>
                    <span className="text-xs text-muted-foreground">Oct 21, 2025</span>
                  </div>
                  <CardTitle className="text-lg">Rising Creators Leaderboard</CardTitle>
                  <CardDescription>
                    Track the hottest creator tokens with our new rising creators leaderboard
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/leaderboard">
                    <Button variant="outline" size="sm" className="w-full">
                      View Leaderboard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-primary/10 text-primary border-primary/20">Feature</Badge>
                    <span className="text-xs text-muted-foreground">Oct 21, 2025</span>
                  </div>
                  <CardTitle className="text-lg">Free Token Search</CardTitle>
                  <CardDescription>
                    Search any creator or token on Zora and Pump.fun for free
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/discover">
                    <Button variant="outline" size="sm" className="w-full">
                      Start Searching
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* CTA */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-3">
                Want to be featured in Creator Insights?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Track your creator analytics with Bagger and join the ranks of top performing Web3 creators
              </p>
              <Link href="/sign-up">
                <Button size="lg" className="glow-primary">
                  Start Tracking Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <p className="mt-3 text-xs text-muted-foreground">
                No credit card required • Free beta access
              </p>
            </CardContent>
          </Card>
        </div>
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
