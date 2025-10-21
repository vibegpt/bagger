"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Zap, Search, TrendingUp, Users, ArrowRight, Info } from "lucide-react";

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [platform, setPlatform] = useState<"zora" | "pumpfun">("zora");
  const [searchType, setSearchType] = useState<"creator" | "token">("token");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const query = searchQuery.trim();

      // Auto-detect platform based on address format
      // Ethereum/Base addresses start with 0x and are 42 chars
      // Solana addresses are base58 and typically 32-44 chars without 0x
      let detectedPlatform = platform;
      if (query.startsWith("0x") && query.length === 42) {
        detectedPlatform = "zora";
      } else if (!query.startsWith("0x") && query.length >= 32 && query.length <= 44) {
        detectedPlatform = "pumpfun";
      }

      if (searchType === "token") {
        window.location.href = `/token/${query}?platform=${detectedPlatform}`;
      } else {
        window.location.href = `/creator/${query}?platform=${detectedPlatform}`;
      }
    }
  };

  // Example creators for demonstration
  const exampleCreators = {
    zora: [
      {
        address: "0x1234567890123456789012345678901234567890",
        name: "Example Zora Creator",
        description: "Try searching with any Base (Zora) wallet address",
      },
    ],
    pumpfun: [
      {
        address: "DpQFyPoV44bXpw7qmACqX7ghC8hxxmFD5HDA1CthBZX8",
        name: "Example Pump.fun Creator",
        description: "Try searching with any Solana wallet address",
      },
    ],
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
              <Button variant="ghost">Home</Button>
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

      {/* Streamlined Header */}
      <section className="border-b bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Search Creator or Token
            </h1>
            <p className="text-sm text-muted-foreground">
              Free public analytics for any wallet or token on Zora and Pump.fun
            </p>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search Creator Address
              </CardTitle>
              <CardDescription>
                Enter a wallet address to view their creator analytics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search Type Selector */}
              <div className="flex gap-2">
                <Button
                  variant={searchType === "token" ? "default" : "outline"}
                  onClick={() => setSearchType("token")}
                  className="flex-1"
                >
                  🪙 Token Address
                </Button>
                <Button
                  variant={searchType === "creator" ? "default" : "outline"}
                  onClick={() => setSearchType("creator")}
                  className="flex-1"
                >
                  👤 Creator Wallet
                </Button>
              </div>

              {/* Platform Selector */}
              <div className="flex gap-2">
                <Button
                  variant={platform === "zora" ? "default" : "outline"}
                  onClick={() => setPlatform("zora")}
                  className="flex-1"
                >
                  Zora (Base)
                </Button>
                <Button
                  variant={platform === "pumpfun" ? "default" : "outline"}
                  onClick={() => setPlatform("pumpfun")}
                  className="flex-1"
                >
                  Pump.fun (Solana)
                </Button>
              </div>

              {/* Search Form */}
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                  type="text"
                  placeholder={
                    searchType === "token"
                      ? platform === "zora"
                        ? "0x... (Creator Coin or Content Coin address)"
                        : "Token mint address"
                      : platform === "zora"
                      ? "0x... (Creator wallet address)"
                      : "Creator wallet address"
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" className="glow-primary">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </form>

              {/* Info */}
              <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <Info className="h-4 w-4 text-primary mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  {searchType === "token"
                    ? "Search by token address to see basic stats. Unlock full creator analytics with premium."
                    : "Search by creator wallet to see all their tokens and advanced analytics."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Example Creators */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Try Example Creators</h2>
            <p className="text-muted-foreground">
              Click to view example creator profiles
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Zora Examples */}
            <Card className="border-primary/20 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Zora Creators
                </CardTitle>
                <CardDescription>Base network creator coins</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {exampleCreators.zora.map((creator) => (
                  <Link
                    key={creator.address}
                    href={`/creator/${creator.address}?platform=zora`}
                    className="block"
                  >
                    <div className="p-3 rounded-lg border hover:border-primary/50 transition-colors">
                      <p className="font-medium text-sm mb-1">{creator.name}</p>
                      <p className="text-xs text-muted-foreground mb-2">
                        {creator.description}
                      </p>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {creator.address.slice(0, 10)}...{creator.address.slice(-8)}
                      </code>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>

            {/* Pump.fun Examples */}
            <Card className="border-accent/20 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-accent" />
                  Pump.fun Creators
                </CardTitle>
                <CardDescription>Solana creator tokens</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {exampleCreators.pumpfun.map((creator) => (
                  <Link
                    key={creator.address}
                    href={`/creator/${creator.address}?platform=pumpfun`}
                    className="block"
                  >
                    <div className="p-3 rounded-lg border hover:border-accent/50 transition-colors">
                      <p className="font-medium text-sm mb-1">{creator.name}</p>
                      <p className="text-xs text-muted-foreground mb-2">
                        {creator.description}
                      </p>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {creator.address.slice(0, 10)}...{creator.address.slice(-8)}
                      </code>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-12">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              Track YOUR Creator Tokens
            </CardTitle>
            <CardDescription>
              Get LTV predictions, churn alerts, revenue tracking, and advanced insights across Pump.fun and Zora
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center pb-6">
            <Link href="/sign-up">
              <Button size="lg" className="glow-primary">
                Start Tracking Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <p className="mt-3 text-xs text-muted-foreground">
              No credit card required • Free beta access • Advanced features available
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
