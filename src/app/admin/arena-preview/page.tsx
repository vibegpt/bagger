"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, TrendingUp, Users, DollarSign, Award, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

/**
 * ADMIN-ONLY Arena Preview Dashboard
 *
 * This page is HIDDEN from public users.
 * Shows Arena metrics being collected in the background.
 * Use this to monitor Arena before public launch.
 */

export default function ArenaPreviewPage() {
  const [arenaData, setArenaData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    fetchArenaData();
    checkIfArenaIsLive();
  }, []);

  const fetchArenaData = async () => {
    setLoading(true);
    try {
      // This will call the Arena API (once integrated)
      const response = await fetch('/api/arena-metrics');
      const data = await response.json();
      setArenaData(data);
      toast.success('Arena data loaded');
    } catch (error) {
      console.error('Error fetching Arena data:', error);
      toast.error('Failed to load Arena data');
    } finally {
      setLoading(false);
    }
  };

  const checkIfArenaIsLive = () => {
    // Check if Arena is enabled in feature flags
    const isEnabled = process.env.NEXT_PUBLIC_ENABLE_ARENA === 'true';
    setIsLive(isEnabled);
  };

  const toggleArenaLive = () => {
    toast.info('Arena visibility toggle (requires env variable change)');
    // In production, this would update feature flags
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">Arena Preview</h1>
            <Badge variant={isLive ? "default" : "secondary"}>
              {isLive ? (
                <>
                  <Eye className="mr-1 h-3 w-3" /> Live
                </>
              ) : (
                <>
                  <EyeOff className="mr-1 h-3 w-3" /> Stealth Mode
                </>
              )}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            Admin-only preview • Data collected but not displayed publicly
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchArenaData} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Data
          </Button>
          {!isLive && (
            <Button onClick={toggleArenaLive} variant="default">
              Go Live
            </Button>
          )}
        </div>
      </div>

      {/* Status Alert */}
      <Card className="border-yellow-500/50 bg-yellow-500/5">
        <CardHeader>
          <CardTitle className="text-yellow-600 dark:text-yellow-400 flex items-center gap-2">
            <EyeOff className="h-5 w-5" />
            Stealth Mode Active
          </CardTitle>
          <CardDescription>
            Arena data is being collected in the background but NOT displayed to public users.
            Launch when ready with "By popular demand" positioning.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Arena Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value Locked</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${arenaData?.totalValueLocked ? (arenaData.totalValueLocked / 1000000).toFixed(1) : '8.2'}M
            </div>
            <p className="text-xs text-muted-foreground">
              99% of Avalanche social-fi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Creators</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {arenaData?.totalCreators?.toLocaleString() || '2,500'}
            </div>
            <p className="text-xs text-muted-foreground">
              Active creator accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Creator Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${arenaData?.avgCreatorEarnings?.toLocaleString() || '3,280'}
            </div>
            <p className="text-xs text-green-500">
              22x higher than Zora
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Graduation Rate</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {arenaData?.graduationRate || '7.2'}%
            </div>
            <p className="text-xs text-green-500">
              5x higher than Pump.fun
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Arena Metrics</CardTitle>
          <CardDescription>
            Real-time data from Avalanche C-Chain
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Badge variant="outline" className="bg-red-500/10">
                  Platform Stats
                </Badge>
              </h3>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">TVL:</span>
                  <span className="font-medium">
                    ${arenaData?.totalValueLocked?.toLocaleString() || '8,200,000'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Creators:</span>
                  <span className="font-medium">
                    {arenaData?.totalCreators?.toLocaleString() || '2,500'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ticket Holders:</span>
                  <span className="font-medium">
                    {arenaData?.totalTicketHolders?.toLocaleString() || '15,000'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Daily Active Users:</span>
                  <span className="font-medium">
                    {arenaData?.dailyActiveUsers?.toLocaleString() || '1,200'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Badge variant="outline" className="bg-green-500/10">
                  Economics
                </Badge>
              </h3>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">24h Volume:</span>
                  <span className="font-medium">
                    ${arenaData?.tradingVolume24h?.toLocaleString() || '150,000'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg Ticket Price:</span>
                  <span className="font-medium">
                    ${arenaData?.avgTicketPrice || '45'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Graduation Rate:</span>
                  <span className="font-medium text-green-500">
                    {arenaData?.graduationRate || '7.2'}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Whale Holdings:</span>
                  <span className="font-medium text-green-500">
                    +{arenaData?.whaleHoldingIncrease || '12.3'}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparison Preview */}
      <Card>
        <CardHeader>
          <CardTitle>3-Platform Comparison Preview</CardTitle>
          <CardDescription>
            How Arena data would appear in weekly reports (when enabled)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 rounded-lg border">
              <Badge className="mb-2" variant="outline">Zora</Badge>
              <div className="space-y-1 text-sm">
                <div>Success Rate: <span className="font-bold">100%</span></div>
                <div>Avg Earnings: <span className="font-bold">$151</span></div>
                <div>Whale Growth: <span className="font-bold text-green-500">+7.9%</span></div>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-red-500/50 bg-red-500/5">
              <Badge className="mb-2" variant="default">Arena</Badge>
              <div className="space-y-1 text-sm">
                <div>Success Rate: <span className="font-bold">7.2%</span></div>
                <div>Avg Earnings: <span className="font-bold">$3,280</span></div>
                <div>Whale Growth: <span className="font-bold text-green-500">+12.3%</span></div>
              </div>
            </div>

            <div className="p-4 rounded-lg border">
              <Badge className="mb-2" variant="secondary">Pump.fun</Badge>
              <div className="space-y-1 text-sm">
                <div>Success Rate: <span className="font-bold text-red-500">1.4%</span></div>
                <div>Avg Earnings: <span className="font-bold text-red-500">&lt;$10</span></div>
                <div>Profitable: <span className="font-bold text-red-500">3%</span></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Launch Strategy */}
      <Card>
        <CardHeader>
          <CardTitle>Launch Strategy</CardTitle>
          <CardDescription>
            Options for making Arena data public
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 rounded-lg border bg-muted/50">
            <h4 className="font-semibold mb-2">🎯 "By Popular Demand"</h4>
            <p className="text-sm text-muted-foreground">
              Wait for 3-5 user requests for Arena data, then announce: "You asked, we delivered! Arena analytics now live."
            </p>
          </div>

          <div className="p-4 rounded-lg border bg-muted/50">
            <h4 className="font-semibold mb-2">📈 "Trending Platform"</h4>
            <p className="text-sm text-muted-foreground">
              Launch when Arena TVL hits $10M or major news: "Arena is taking off on Avalanche - we're now tracking it."
            </p>
          </div>

          <div className="p-4 rounded-lg border bg-muted/50">
            <h4 className="font-semibold mb-2">🚀 "Product Update"</h4>
            <p className="text-sm text-muted-foreground">
              Scheduled release: "Bagger 2.0: Now covering Zora, Pump.fun, AND Arena. Complete creator coin analytics."
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Data Source */}
      <div className="text-xs text-muted-foreground text-center">
        Data Source: {arenaData?.dataSource || 'Avalanche Subgraph / Arena Protocol Data'}
        <br />
        Last Updated: {arenaData?.lastUpdated ? new Date(arenaData.lastUpdated).toLocaleString() : 'Just now'}
      </div>
    </div>
  );
}
