import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  TrendingDown,
  Users,
  AlertTriangle,
  Sparkles,
  DollarSign,
  Activity,
  Target,
  BarChart3,
  ArrowUpRight,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { PlatformConnectionsServer } from "@/components/dashboard/platform-connections-server";
import { PlatformConnections } from "@/components/dashboard/platform-connections";
import { OAuthCallbackHandler } from "@/components/dashboard/oauth-callback-handler";
import { RecentContentServer } from "@/components/dashboard/recent-content-server";
import { RecentContent } from "@/components/dashboard/recent-content";
import { CorrelationInsights } from "@/components/dashboard/correlation-insights";
import { StreamImpact } from "@/components/dashboard/stream-impact";

// Mock data for demo - this shows what premium customers see
const mockData = {
  creator: {
    name: "DraperTV",
    platform: "Pump.fun",
    tokenSymbol: "DTV",
    walletAddress: "CPLTbYbtDMKZtHBaPqdDmHjxNwESCEB14gm6VuoDpump",
  },
  overview: {
    marketCap: 3818010,
    holders: 3280,
    volume24h: 310507,
    priceChange24h: 5.2,
  },
  communityHealth: {
    score: 82,
    trend: "improving",
    retention7d: 78,
    retention30d: 62,
    retention90d: 45,
  },
  churnRisk: [
    {
      address: "0x1234...5678",
      holdings: 12500,
      valueUsd: 47,
      riskScore: 92,
      reason: "No activity 45d, price down 15%",
      lastActive: "45 days ago",
    },
    {
      address: "0x8765...4321",
      holdings: 8200,
      valueUsd: 31,
      riskScore: 78,
      reason: "Reduced holdings by 60%",
      lastActive: "12 days ago",
    },
    {
      address: "0xabcd...efgh",
      holdings: 15000,
      valueUsd: 57,
      riskScore: 65,
      reason: "Price below entry (-22%)",
      lastActive: "8 days ago",
    },
  ],
  topHolders: [
    {
      address: "0xwhale...0001",
      holdings: 250000,
      valueUsd: 954,
      ltv: 2400,
      segment: "Whale",
      entryDate: "2 months ago",
    },
    {
      address: "0xwhale...0002",
      holdings: 180000,
      valueUsd: 686,
      ltv: 1800,
      segment: "Whale",
      entryDate: "1 month ago",
    },
    {
      address: "0xactive...001",
      holdings: 45000,
      valueUsd: 172,
      ltv: 620,
      segment: "Active Trader",
      entryDate: "3 weeks ago",
    },
  ],
  insights: [
    {
      type: "opportunity",
      title: "Optimal Drop Time Detected",
      description: "Your community is most active on Tuesdays 2-4 PM EST. Consider timing your next drop accordingly.",
      impact: "high",
    },
    {
      type: "alert",
      title: "Volume Spike Alert",
      description: "24h volume increased 340% - investigate for potential catalysts or wash trading.",
      impact: "medium",
    },
    {
      type: "insight",
      title: "Holder Diversification",
      description: "78% of your holders also hold BONK, 45% hold WIF - consider collaborations.",
      impact: "medium",
    },
  ],
  forecasting: {
    expectedRevenue7d: 1200,
    expectedRevenue30d: 4800,
    confidence: 76,
    trend: "stable",
  },
};

export default async function CreatorDashboard() {
  // Get current user from Clerk
  const { currentUser } = await import("@clerk/nextjs/server");
  const clerkUser = await currentUser();

  // Get user's display name (fallback to email or "Creator")
  const userName = clerkUser?.firstName
    ? `${clerkUser.firstName}${clerkUser.lastName ? ' ' + clerkUser.lastName : ''}`
    : clerkUser?.username
    ? clerkUser.username
    : clerkUser?.emailAddresses?.[0]?.emailAddress?.split('@')[0]
    ? clerkUser.emailAddresses[0].emailAddress.split('@')[0]
    : "Creator";

  return (
    <div className="min-h-screen bg-background">
      {/* OAuth callback handler for connection success/error messages */}
      <OAuthCallbackHandler />
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary via-accent to-primary glow-primary">
              <Zap className="h-6 w-6 text-white" fill="white" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">Bagger</h1>
              <p className="text-xs text-muted-foreground">
                {userName} Dashboard
              </p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-primary/10">
              <Sparkles className="h-3 w-3 mr-1" />
              Premium
            </Badge>
            <Button size="sm" variant="outline">Settings</Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Platform Connections - Web2+Web3 Integration */}
        <Suspense fallback={<PlatformConnections />}>
          <PlatformConnectionsServer />
        </Suspense>

        {/* Recent Content - Synced Videos */}
        <Suspense fallback={<RecentContent content={[]} />}>
          <RecentContentServer />
        </Suspense>

        {/* Web2+Web3 Correlation Insights */}
        <CorrelationInsights limit={5} />

        {/* Live Stream Impact Analytics */}
        <StreamImpact limit={5} />

        {/* Community Health Score */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Community Health Score
                  <Badge
                    variant={
                      mockData.communityHealth.trend === "improving"
                        ? "default"
                        : "secondary"
                    }
                    className="bg-green-500/10 text-green-600"
                  >
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Improving
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Composite metric based on retention, activity, and growth
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-5xl font-bold gradient-text">
                  {mockData.communityHealth.score}
                </div>
                <p className="text-xs text-muted-foreground">out of 100</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-lg bg-background/50">
                <p className="text-2xl font-bold">{mockData.communityHealth.retention7d}%</p>
                <p className="text-xs text-muted-foreground">7-Day Retention</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-background/50">
                <p className="text-2xl font-bold">{mockData.communityHealth.retention30d}%</p>
                <p className="text-xs text-muted-foreground">30-Day Retention</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-background/50">
                <p className="text-2xl font-bold">{mockData.communityHealth.retention90d}%</p>
                <p className="text-xs text-muted-foreground">90-Day Retention</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                Market Cap
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${(mockData.overview.marketCap / 1000000).toFixed(2)}M
              </div>
              <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                <ArrowUpRight className="h-3 w-3" />
                +{mockData.overview.priceChange24h}% (24h)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                Holders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockData.overview.holders.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {mockData.churnRisk.length} at high churn risk
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4 text-accent" />
                24h Volume
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${(mockData.overview.volume24h / 1000).toFixed(1)}K
              </div>
              <p className="text-xs text-muted-foreground mt-1">Active trading</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4 text-green-500" />
                30d Forecast
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${(mockData.forecasting.expectedRevenue30d / 1000).toFixed(1)}K
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {mockData.forecasting.confidence}% confidence
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="insights" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="churn">Churn Risk</TabsTrigger>
            <TabsTrigger value="holders">Top Holders</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>AI-Powered Insights</CardTitle>
                <CardDescription>
                  Actionable recommendations based on your community data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockData.insights.map((insight, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-4 rounded-lg border bg-card"
                  >
                    {insight.type === "opportunity" && (
                      <Sparkles className="h-5 w-5 text-green-500 mt-0.5" />
                    )}
                    {insight.type === "alert" && (
                      <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                    )}
                    {insight.type === "insight" && (
                      <BarChart3 className="h-5 w-5 text-blue-500 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{insight.title}</h4>
                        <Badge
                          variant={insight.impact === "high" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {insight.impact} impact
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {insight.description}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Churn Risk Tab */}
          <TabsContent value="churn" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  High Churn Risk Holders
                </CardTitle>
                <CardDescription>
                  Holders predicted to sell soon - engage proactively to retain them
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockData.churnRisk.map((holder, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                            {holder.address}
                          </code>
                          <Badge
                            variant={holder.riskScore > 80 ? "destructive" : "secondary"}
                          >
                            {holder.riskScore}% risk
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{holder.reason}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Last active: {holder.lastActive}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">
                          {holder.holdings.toLocaleString()} {mockData.creator.tokenSymbol}
                        </p>
                        <p className="text-sm text-muted-foreground">${holder.valueUsd}</p>
                        <Button size="sm" variant="outline" className="mt-2">
                          Engage
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Top Holders Tab */}
          <TabsContent value="holders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  Top Holders by LTV
                </CardTitle>
                <CardDescription>
                  Your most valuable community members ranked by predicted lifetime value
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockData.topHolders.map((holder, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-white font-bold">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                              {holder.address}
                            </code>
                            <Badge variant="outline">{holder.segment}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Entry: {holder.entryDate}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">
                          ${holder.ltv.toLocaleString()} LTV
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {holder.holdings.toLocaleString()} tokens (${holder.valueUsd})
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Analytics</CardTitle>
                <CardDescription>
                  Deep dive into your token performance and community metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="h-64 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p>Charts and detailed analytics coming soon</p>
                  <p className="text-xs mt-2">
                    Price history, volume trends, holder distribution, and more
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
