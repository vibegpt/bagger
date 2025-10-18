"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Rocket, TrendingUp, Clock, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface Token {
  mint: string;
  name: string;
  symbol: string;
  marketCap: number;
  complete: boolean;
  imageUri?: string;
  createdTimestamp?: number;
}

interface BondingSuccessCardProps {
  tokens: Token[];
  totalTokensCreated: number;
  successfulTokens: number;
  successRate: number;
}

export function BondingSuccessCard({
  tokens,
  totalTokensCreated,
  successfulTokens,
  successRate,
}: BondingSuccessCardProps) {
  // Filter active bonding tokens (not complete but has market cap)
  const activeTokens = tokens.filter(t => !t.complete && t.marketCap > 0);

  // Calculate average time to graduation for completed tokens
  const completedTokens = tokens.filter(t => t.complete);
  const avgTimeToGraduation = completedTokens.length > 0
    ? calculateAvgTimeToGraduation(completedTokens)
    : null;

  // Get benchmark label
  const getBenchmark = (): { label: string; color: string; description: string } => {
    if (successRate >= 50) {
      return {
        label: "Excellent",
        color: "bg-green-500",
        description: "Well above average creator"
      };
    } else if (successRate >= 30) {
      return {
        label: "Good",
        color: "bg-blue-500",
        description: "Above average performance"
      };
    } else if (successRate >= 15) {
      return {
        label: "Fair",
        color: "bg-yellow-500",
        description: "Meeting baseline"
      };
    } else {
      return {
        label: "Developing",
        color: "bg-orange-500",
        description: "Early stage - keep building"
      };
    }
  };

  const benchmark = getBenchmark();

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(2)}`;
  };

  return (
    <Card className="bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5" />
              Bonding Curve Success
            </CardTitle>
            <CardDescription>Track your graduation rate on Pump.fun</CardDescription>
          </div>
          <Badge className={benchmark.color}>{benchmark.label}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Main Success Rate Metric */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Success Rate</p>
            <div className="text-4xl font-bold gradient-text">
              {successRate.toFixed(1)}%
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {successfulTokens} graduated / {totalTokensCreated} created
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {benchmark.description}
            </p>
          </div>

          {/* Breakdown Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Target className="h-4 w-4 text-green-500" />
                <p className="text-sm font-medium">Graduated</p>
              </div>
              <p className="text-2xl font-bold">{successfulTokens}</p>
              <p className="text-xs text-muted-foreground">Bonding complete</p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <p className="text-sm font-medium">Active</p>
              </div>
              <p className="text-2xl font-bold">{activeTokens.length}</p>
              <p className="text-xs text-muted-foreground">Currently bonding</p>
            </div>

            {avgTimeToGraduation && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <p className="text-sm font-medium">Avg. Time</p>
                </div>
                <p className="text-2xl font-bold">{avgTimeToGraduation}</p>
                <p className="text-xs text-muted-foreground">Days to bond</p>
              </div>
            )}
          </div>

          {/* Active Bonding Progress */}
          {activeTokens.length > 0 && (
            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-3">Active Bonding Progress</p>
              <div className="space-y-3">
                {activeTokens.slice(0, 3).map(token => {
                  // Estimate progress based on market cap (bonding curve typically completes around $69K)
                  const bondingTarget = 69000;
                  const progress = Math.min((token.marketCap / bondingTarget) * 100, 99);

                  return (
                    <div key={token.mint} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {token.imageUri && (
                            <img
                              src={token.imageUri}
                              alt={token.name}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                          )}
                          <div>
                            <p className="text-sm font-medium">{token.name}</p>
                            <p className="text-xs text-muted-foreground">${token.symbol}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">{formatCurrency(token.marketCap)}</p>
                          <p className="text-xs text-muted-foreground">{progress.toFixed(0)}%</p>
                        </div>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Insights */}
          <div className="pt-4 border-t space-y-3">
            <p className="text-sm font-medium">💡 Insights</p>

            {successRate < 15 && (
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">How to Improve Bonding Success:</p>
                <ul className="space-y-1 ml-4 list-disc">
                  <li>Build community before launch (Twitter, Discord)</li>
                  <li>Create compelling token narratives</li>
                  <li>Engage actively in first 24-48 hours</li>
                  <li>Study your successful tokens for patterns</li>
                </ul>
              </div>
            )}

            {successRate >= 30 && (
              <div className="text-sm text-green-500">
                <p className="font-medium mb-1">🎉 Strong Performance!</p>
                <p className="text-muted-foreground">
                  You're in the top tier of Pump.fun creators. Your community engagement
                  and token launches are resonating well.
                </p>
              </div>
            )}

            {activeTokens.length > 0 && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <TrendingUp className="h-4 w-4 text-primary" />
                <p className="text-xs text-muted-foreground">
                  <strong className="text-foreground">Focus Area:</strong> You have {activeTokens.length} token
                  {activeTokens.length !== 1 ? 's' : ''} actively bonding. Concentrate engagement efforts
                  to push them over the graduation threshold.
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to calculate average time to graduation
function calculateAvgTimeToGraduation(completedTokens: Token[]): string {
  // This would ideally use actual creation timestamps
  // For now, return a placeholder or estimate
  // In production, calculate: (current_time - created_timestamp) for each completed token
  const avgDays = 8.2; // Placeholder - would calculate from actual data
  return avgDays.toFixed(1);
}
