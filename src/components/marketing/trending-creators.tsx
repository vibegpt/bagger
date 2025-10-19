"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, ExternalLink, ArrowRight } from "lucide-react";

interface TrendingCreator {
  rank: number;
  address: string;
  name?: string;
  imageUrl?: string;
  totalMarketCap: number;
  totalVolume?: number;
  totalHolders: number;
  successRate?: number;
  platform: "zora" | "pumpfun";
}

export function TrendingCreators() {
  const [zoraCreator, setZoraCreator] = useState<TrendingCreator | null>(null);
  const [pumpfunCreator, setPumpfunCreator] = useState<TrendingCreator | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrending() {
      try {
        // Fetch top creator from each platform in parallel
        const [zoraRes, pumpfunRes] = await Promise.all([
          fetch("/api/leaderboard?platform=zora&limit=1"),
          fetch("/api/leaderboard?platform=pumpfun&limit=1"),
        ]);

        if (zoraRes.ok) {
          const zoraData = await zoraRes.json();
          if (zoraData.success && zoraData.data.length > 0) {
            setZoraCreator(zoraData.data[0]);
          }
        }

        if (pumpfunRes.ok) {
          const pumpfunData = await pumpfunRes.json();
          if (pumpfunData.success && pumpfunData.data.length > 0) {
            setPumpfunCreator(pumpfunData.data[0]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch trending creators:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTrending();
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

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3 max-w-5xl mx-auto mb-8">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-dashed h-full animate-pulse">
            <CardContent className="p-4">
              <div className="h-32 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Show Coming Soon if no data
  if (!zoraCreator && !pumpfunCreator) {
    return (
      <div className="max-w-5xl mx-auto mb-8">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="py-12 text-center">
            <div className="max-w-md mx-auto space-y-4">
              <div className="flex justify-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-primary" />
                </div>
              </div>
              <h3 className="text-lg font-bold">Top Creators Coming Soon</h3>
              <p className="text-sm text-muted-foreground">
                We're building our creator rankings. Search for any creator or token to see their stats now.
              </p>
              <Link href="/discover">
                <Button className="glow-primary">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Search Creators & Tokens
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3 max-w-5xl mx-auto mb-8">
      {/* Zora Top Creator */}
      {zoraCreator && (
        <Link href={`/creator/${zoraCreator.address}?platform=zora`}>
          <Card className="hover:border-primary/50 transition-all border-primary/30 bg-gradient-to-r from-primary/5 to-transparent h-full">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                  #1 Zora
                </Badge>
              </div>
              <div className="flex items-start gap-3">
                <Avatar className="size-12 border-2 border-primary/20">
                  <AvatarImage src={zoraCreator.imageUrl || ""} alt={zoraCreator.name || "Top Zora Creator"} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-bold">
                    Z{zoraCreator.rank}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <p className="font-semibold text-sm">{zoraCreator.name || "Top Zora Creator"}</p>
                  <code className="text-xs text-muted-foreground block">
                    {zoraCreator.address.slice(0, 6)}...{zoraCreator.address.slice(-4)}
                  </code>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t text-xs">
                    <div>
                      <p className="text-muted-foreground">Market Cap</p>
                      <p className="font-semibold">{formatCurrency(zoraCreator.totalMarketCap)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Holders</p>
                      <p className="font-semibold">{formatNumber(zoraCreator.totalHolders)}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end mt-3 text-xs text-muted-foreground">
                View Profile <ExternalLink className="h-3 w-3 ml-1" />
              </div>
            </CardContent>
          </Card>
        </Link>
      )}

      {/* Pump.fun Top Creator */}
      {pumpfunCreator && (
        <Link href={`/creator/${pumpfunCreator.address}?platform=pumpfun`}>
          <Card className="hover:border-accent/50 transition-all border-accent/30 bg-gradient-to-r from-accent/5 to-transparent h-full">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <Badge variant="outline" className="text-xs bg-accent/10 text-accent border-accent/20">
                  #1 Pump.fun
                </Badge>
              </div>
              <div className="flex items-start gap-3">
                <Avatar className="size-12 border-2 border-accent/20">
                  <AvatarImage src={pumpfunCreator.imageUrl || ""} alt={pumpfunCreator.name || "Top Pump Creator"} />
                  <AvatarFallback className="bg-gradient-to-br from-accent to-primary text-white font-bold">
                    P{pumpfunCreator.rank}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <p className="font-semibold text-sm">{pumpfunCreator.name || "Top Pump Creator"}</p>
                  <code className="text-xs text-muted-foreground block">
                    {pumpfunCreator.address.slice(0, 4)}...{pumpfunCreator.address.slice(-4)}
                  </code>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t text-xs">
                    <div>
                      <p className="text-muted-foreground">Market Cap</p>
                      <p className="font-semibold">{formatCurrency(pumpfunCreator.totalMarketCap)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Success Rate</p>
                      <p className="font-semibold text-green-500">{pumpfunCreator.successRate?.toFixed(0)}%</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end mt-3 text-xs text-muted-foreground">
                View Profile <ExternalLink className="h-3 w-3 ml-1" />
              </div>
            </CardContent>
          </Card>
        </Link>
      )}

      {/* Leaderboard CTA */}
      <Link href="/leaderboard">
        <Card className="hover:border-primary/50 transition-all border-dashed h-full flex items-center justify-center">
          <CardContent className="p-4 text-center">
            <Trophy className="h-8 w-8 text-primary mx-auto mb-3" />
            <p className="font-semibold mb-2">View Full Leaderboard</p>
            <p className="text-xs text-muted-foreground mb-3">
              See rankings for all top creators
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Explore Rankings
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
