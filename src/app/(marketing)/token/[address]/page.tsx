"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Zap, ArrowLeft, ExternalLink, TrendingUp, DollarSign, Users, Lock, Sparkles } from "lucide-react";

interface TokenData {
  address: string;
  creatorAddress?: string;
  name: string;
  symbol: string;
  imageUrl?: string;
  description?: string;
  totalSupply: string;
  marketCap: number;
  price: number;
  priceChange24h?: number;
  volume24h: number;
  volumeAllTime: number;
  holderCount: number;
  complete?: boolean;
  createdAt: Date;
  twitter?: string;
  telegram?: string;
  website?: string;
}

export default function TokenPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const address = params.address as string;
  const platform = searchParams.get("platform") || "auto";

  const [token, setToken] = useState<TokenData | null>(null);
  const [detectedPlatform, setDetectedPlatform] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchToken() {
      try {
        const res = await fetch(`/api/token?address=${address}&platform=${platform}`);
        const data = await res.json();

        if (data.success) {
          setToken(data.data);
          setDetectedPlatform(data.platform);
        } else {
          setError(data.error || "Token not found");
        }
      } catch (err) {
        setError("Failed to fetch token data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchToken();
  }, [address, platform]);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toFixed(2)}`;
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("en-US").format(value);
  };

  const formatAddress = (addr: string) => {
    if (addr.length < 12) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
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
          </div>
        </header>
        <div className="container mx-auto px-4 py-24 text-center">
          <div className="animate-pulse">
            <div className="h-32 bg-muted rounded-lg mb-4" />
            <div className="h-64 bg-muted rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !token) {
    return (
      <div className="min-h-screen bg-background">
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
          </div>
        </header>
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-2xl font-bold mb-4">Token Not Found</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Link href="/discover">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Discover
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const platformName = detectedPlatform === "zora" ? "Zora (Base)" : "Pump.fun (Solana)";

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
              <Button variant="ghost">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Discover
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button className="glow-primary">Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Token Header */}
      <section className="border-b bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="size-24 border-4 border-primary/20">
              <AvatarImage src={token.imageUrl || ""} alt={token.name} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-2xl font-bold">
                {token.symbol?.slice(0, 2) || "??"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-bold">{token.name}</h1>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  ${token.symbol}
                </Badge>
                <Badge variant="outline">{platformName}</Badge>
                {token.complete && (
                  <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                    ✓ Bonded
                  </Badge>
                )}
              </div>
              <code className="text-sm bg-muted px-3 py-1 rounded-lg font-mono block w-fit">
                {formatAddress(token.address)}
              </code>
              {token.description && (
                <p className="text-sm text-muted-foreground max-w-2xl">{token.description}</p>
              )}
              <div className="flex gap-2">
                {token.website && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={token.website} target="_blank" rel="noopener noreferrer">
                      Website <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                )}
                {token.twitter && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={`https://twitter.com/${token.twitter}`} target="_blank" rel="noopener noreferrer">
                      Twitter <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                )}
                {token.telegram && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={`https://t.me/${token.telegram}`} target="_blank" rel="noopener noreferrer">
                      Telegram <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Token Stats */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Market Cap</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatCurrency(token.marketCap)}</p>
              {token.priceChange24h !== undefined && (
                <p className={`text-sm ${token.priceChange24h >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {token.priceChange24h >= 0 ? "+" : ""}{token.priceChange24h.toFixed(2)}% (24h)
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Price</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatCurrency(token.price)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Volume (24h)</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatCurrency(token.volume24h)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Holders</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatNumber(token.holderCount)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Upgrade CTA */}
        {token.creatorAddress && (
          <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <Badge className="bg-primary/10 text-primary border-primary/20" variant="outline">
                      Premium Analytics
                    </Badge>
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Unlock Full Creator Analytics</h3>
                  <p className="text-muted-foreground mb-6">
                    See all tokens created by this creator, total earnings, portfolio performance, and advanced insights.
                  </p>
                  <Link href={`/creator/${token.creatorAddress}?platform=${detectedPlatform}`}>
                    <Button size="lg" className="glow-primary w-full md:w-auto">
                      <Lock className="mr-2 h-5 w-5" />
                      View Full Creator Dashboard
                    </Button>
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 rounded-lg bg-background/50 border border-primary/10">
                    <DollarSign className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-xs font-medium">Total Earnings</p>
                    <p className="text-xs text-muted-foreground">Across all tokens</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-background/50 border border-primary/10">
                    <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-xs font-medium">Portfolio Performance</p>
                    <p className="text-xs text-muted-foreground">Success rates & trends</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-background/50 border border-primary/10">
                    <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-xs font-medium">All Created Tokens</p>
                    <p className="text-xs text-muted-foreground">Complete portfolio</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-background/50 border border-primary/10">
                    <Sparkles className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-xs font-medium">Advanced Insights</p>
                    <p className="text-xs text-muted-foreground">LTV & predictions</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
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
