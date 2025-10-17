"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Users, UserMinus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface HolderGrowthData {
  date: string;
  totalHolders: number;
  newHolders: number;
  lostHolders: number;
  netGrowth: number;
  growthRate: number;
}

interface HolderGrowthChartProps {
  data: HolderGrowthData[];
  tokenName: string;
  platform: "zora" | "pumpfun";
}

export function HolderGrowthChart({ data, tokenName, platform }: HolderGrowthChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Holder Growth & Retention</CardTitle>
          <CardDescription>Track your community growth over time</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No holder data available yet</p>
        </CardContent>
      </Card>
    );
  }

  const latestData = data[data.length - 1];
  const previousData = data[data.length - 2];

  const totalHolders = latestData.totalHolders;
  const netGrowth = latestData.netGrowth;
  const growthRate = latestData.growthRate;

  // Calculate churn rate (lost holders as % of total)
  const churnRate = latestData.totalHolders > 0
    ? (latestData.lostHolders / latestData.totalHolders) * 100
    : 0;

  // Calculate 7-day totals
  const last7Days = data.slice(-7);
  const totalNewLast7Days = last7Days.reduce((sum, d) => sum + d.newHolders, 0);
  const totalLostLast7Days = last7Days.reduce((sum, d) => sum + d.lostHolders, 0);
  const netGrowthLast7Days = totalNewLast7Days - totalLostLast7Days;

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  const formatPercent = (num: number) => {
    return num.toFixed(2) + "%";
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="cyber-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Holders</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totalHolders)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {netGrowth >= 0 ? "+" : ""}{formatNumber(netGrowth)} this period
            </p>
          </CardContent>
        </Card>

        <Card className="cyber-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            {growthRate >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${growthRate >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {growthRate >= 0 ? "+" : ""}{formatPercent(growthRate)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Period over period</p>
          </CardContent>
        </Card>

        <Card className="cyber-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
            <UserMinus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercent(churnRate)}</div>
            <p className="text-xs text-muted-foreground mt-1">Holders lost this period</p>
          </CardContent>
        </Card>

        <Card className="cyber-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">7-Day Net Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netGrowthLast7Days >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {netGrowthLast7Days >= 0 ? "+" : ""}{formatNumber(netGrowthLast7Days)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatNumber(totalNewLast7Days)} new, {formatNumber(totalLostLast7Days)} lost
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Growth Timeline */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Holder Growth Timeline</CardTitle>
              <CardDescription>{tokenName} on {platform === 'zora' ? 'Base' : 'Solana'}</CardDescription>
            </div>
            <Badge variant={growthRate >= 0 ? "default" : "destructive"}>
              {growthRate >= 0 ? "Growing" : "Declining"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.slice(-14).reverse().map((point, index) => {
              const isGrowing = point.netGrowth >= 0;
              return (
                <div
                  key={point.date}
                  className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${isGrowing ? 'bg-green-500' : 'bg-red-500'}`} />
                    <div>
                      <p className="text-sm font-medium">{point.date}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatNumber(point.totalHolders)} total holders
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${isGrowing ? 'text-green-500' : 'text-red-500'}`}>
                      {isGrowing ? "+" : ""}{formatNumber(point.netGrowth)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      +{point.newHolders} / -{point.lostHolders}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card className="bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle>Retention Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className={`h-8 w-8 rounded-full ${churnRate < 5 ? 'bg-green-500/20' : churnRate < 10 ? 'bg-yellow-500/20' : 'bg-red-500/20'} flex items-center justify-center flex-shrink-0`}>
              {churnRate < 5 ? '✓' : churnRate < 10 ? '!' : '⚠️'}
            </div>
            <div>
              <p className="text-sm font-medium">
                {churnRate < 5 && "Excellent retention! Your community is highly engaged."}
                {churnRate >= 5 && churnRate < 10 && "Good retention. Monitor for trends."}
                {churnRate >= 10 && "High churn rate. Consider engagement strategies."}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Industry average churn for creator tokens is 8-12%
              </p>
            </div>
          </div>

          {growthRate > 10 && (
            <div className="pt-3 border-t">
              <p className="text-sm text-green-500 font-medium">
                🚀 Strong growth momentum! Your holder base is expanding rapidly.
              </p>
            </div>
          )}

          {netGrowthLast7Days < 0 && (
            <div className="pt-3 border-t">
              <p className="text-sm text-yellow-500 font-medium">
                📉 Negative growth this week. Consider posting more content or engaging your community.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
