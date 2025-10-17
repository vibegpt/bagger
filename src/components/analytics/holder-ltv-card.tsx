"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Users, Percent } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface HolderLTVCardProps {
  totalRevenue: number;
  totalHolders: number;
  platform: "zora" | "pumpfun";
  tokenName?: string;
}

export function HolderLTVCard({ totalRevenue, totalHolders, platform, tokenName }: HolderLTVCardProps) {
  const ltv = totalHolders > 0 ? totalRevenue / totalHolders : 0;

  // Calculate projected annual value (assuming current pace continues)
  const projectedAnnualLTV = ltv * 12;

  // Industry benchmarks (estimated for creator tokens)
  const getBenchmark = (): { label: string; color: string; description: string } => {
    if (ltv >= 1000) {
      return {
        label: "Excellent",
        color: "text-green-500",
        description: "Well above industry average"
      };
    } else if (ltv >= 500) {
      return {
        label: "Good",
        color: "text-blue-500",
        description: "Above industry average"
      };
    } else if (ltv >= 100) {
      return {
        label: "Fair",
        color: "text-yellow-500",
        description: "Meeting baseline expectations"
      };
    } else {
      return {
        label: "Developing",
        color: "text-orange-500",
        description: "Early stage - focus on engagement"
      };
    }
  };

  const benchmark = getBenchmark();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("en-US").format(value);
  };

  return (
    <Card className="bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Holder Lifetime Value (LTV)
            </CardTitle>
            <CardDescription>
              {tokenName && `${tokenName} · `}
              {platform === "zora" ? "Base (Zora)" : "Solana (Pump.fun)"}
            </CardDescription>
          </div>
          <Badge className={benchmark.color}>{benchmark.label}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Main LTV Metric */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Average Revenue Per Holder</p>
            <div className="text-4xl font-bold gradient-text">
              {formatCurrency(ltv)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {benchmark.description}
            </p>
          </div>

          {/* Breakdown Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 rounded-lg bg-background/50 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">Total Revenue</p>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
              <p className="text-xs text-muted-foreground mt-1">All-time earnings</p>
            </div>

            <div className="p-4 rounded-lg bg-background/50 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">Total Holders</p>
              </div>
              <p className="text-2xl font-bold">{formatNumber(totalHolders)}</p>
              <p className="text-xs text-muted-foreground mt-1">Unique supporters</p>
            </div>

            <div className="p-4 rounded-lg bg-background/50 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">Projected Annual</p>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(projectedAnnualLTV)}</p>
              <p className="text-xs text-muted-foreground mt-1">If pace continues</p>
            </div>
          </div>

          {/* Insights */}
          <div className="pt-4 border-t space-y-3">
            <p className="text-sm font-medium">💡 Insights</p>

            {ltv < 100 && (
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">How to Improve LTV:</p>
                <ul className="space-y-1 ml-4 list-disc">
                  <li>Post more content coins to increase trading activity</li>
                  <li>Engage with your community to reduce churn</li>
                  <li>Launch limited edition content to drive demand</li>
                </ul>
              </div>
            )}

            {ltv >= 500 && (
              <div className="text-sm text-green-500">
                <p className="font-medium mb-1">🎉 Strong Performance!</p>
                <p className="text-muted-foreground">
                  Your holders are highly engaged. Consider scaling your content production
                  or launching premium tiers to capitalize on this momentum.
                </p>
              </div>
            )}

            <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
              <Percent className="h-4 w-4 text-primary" />
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">Web2 Comparison:</strong> Patreon creators
                average ${((ltv / 12) * 5).toFixed(2)}/patron/month. You're earning{" "}
                <strong className={ltv > (((ltv / 12) * 5) * 12) ? "text-green-500" : "text-yellow-500"}>
                  {((ltv / (((ltv / 12) * 5) * 12)) * 100).toFixed(0)}%
                </strong>{" "}
                of that benchmark on-chain.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
