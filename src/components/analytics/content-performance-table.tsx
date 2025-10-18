"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, ArrowUpDown, Sparkles, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface ContentCoin {
  id: string;
  postContent?: string;
  price: number;
  marketCap: number;
  volume24h: number;
  priceChange24h: number;
  holderCount?: number;
  createdAt?: string;
}

interface ContentPerformanceTableProps {
  contentCoins: ContentCoin[];
  totalEarnings: number;
}

type SortField = "marketCap" | "volume24h" | "holderCount" | "price";
type SortDirection = "asc" | "desc";

export function ContentPerformanceTable({
  contentCoins,
  totalEarnings,
}: ContentPerformanceTableProps) {
  const [sortField, setSortField] = useState<SortField>("marketCap");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  if (!contentCoins || contentCoins.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Content Post Performance</CardTitle>
          <CardDescription>Track earnings per content post</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No content coins found</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate metrics
  const activePostCount = contentCoins.filter(c => c.volume24h > 0).length;
  const successRate = (activePostCount / contentCoins.length) * 100;
  const avgEarningsPerPost = totalEarnings / contentCoins.length;
  const avgHoldersPerPost = contentCoins.reduce((sum, c) => sum + (c.holderCount || 0), 0) / contentCoins.length;
  const topPost = [...contentCoins].sort((a, b) => b.marketCap - a.marketCap)[0];

  // Sort function
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Sorted content coins
  const sortedCoins = [...contentCoins].sort((a, b) => {
    const aValue = a[sortField] || 0;
    const bValue = b[sortField] || 0;
    return sortDirection === "desc" ? bValue - aValue : aValue - bValue;
  });

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

  const truncateText = (text: string, maxLength: number = 50) => {
    if (!text) return "Untitled Post";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  const getBenchmark = (): { label: string; color: string } => {
    if (successRate >= 80) {
      return { label: "Excellent", color: "bg-green-500" };
    } else if (successRate >= 60) {
      return { label: "Good", color: "bg-blue-500" };
    } else if (successRate >= 40) {
      return { label: "Fair", color: "bg-yellow-500" };
    } else {
      return { label: "Developing", color: "bg-orange-500" };
    }
  };

  const benchmark = getBenchmark();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Content Post Performance
            </CardTitle>
            <CardDescription>
              {contentCoins.length} posts tokenized • {activePostCount} with active trading
            </CardDescription>
          </div>
          <Badge className={benchmark.color}>{benchmark.label}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Summary Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 border border-primary/20">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Avg. Per Post</p>
              </div>
              <p className="text-xl font-bold">{formatCurrency(avgEarningsPerPost)}</p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Success Rate</p>
              </div>
              <p className="text-xl font-bold">{successRate.toFixed(0)}%</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Avg. Holders</p>
              <p className="text-xl font-bold">{Math.floor(avgHoldersPerPost)}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Top Post Value</p>
              <p className="text-xl font-bold">{formatCurrency(topPost.marketCap)}</p>
            </div>
          </div>

          {/* Performance Table */}
          <div className="space-y-3">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs font-medium text-muted-foreground border-b">
              <div className="col-span-5">Post Content</div>
              <div
                className="col-span-2 flex items-center gap-1 cursor-pointer hover:text-foreground"
                onClick={() => handleSort("marketCap")}
              >
                Market Cap <ArrowUpDown className="h-3 w-3" />
              </div>
              <div
                className="col-span-2 flex items-center gap-1 cursor-pointer hover:text-foreground"
                onClick={() => handleSort("volume24h")}
              >
                24h Volume <ArrowUpDown className="h-3 w-3" />
              </div>
              <div
                className="col-span-2 flex items-center gap-1 cursor-pointer hover:text-foreground"
                onClick={() => handleSort("holderCount")}
              >
                Holders <ArrowUpDown className="h-3 w-3" />
              </div>
              <div className="col-span-1 text-right">Status</div>
            </div>

            {/* Table Rows */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {sortedCoins.map((coin, index) => {
                const isTopPerformer = coin.id === topPost.id;
                const isActive = coin.volume24h > 0;

                return (
                  <div
                    key={coin.id}
                    className={`grid grid-cols-12 gap-2 px-3 py-3 rounded-lg border transition-colors ${
                      isTopPerformer
                        ? "border-primary bg-primary/5"
                        : "border-border/50 hover:border-primary/50"
                    }`}
                  >
                    <div className="col-span-5 flex items-center gap-2">
                      {isTopPerformer && (
                        <span className="text-xs">🏆</span>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {truncateText(coin.postContent || "Untitled Post", 40)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(coin.price)} per token
                        </p>
                      </div>
                    </div>

                    <div className="col-span-2 flex items-center">
                      <p className="text-sm font-semibold">
                        {formatCurrency(coin.marketCap)}
                      </p>
                    </div>

                    <div className="col-span-2 flex items-center">
                      <p className="text-sm">
                        {formatCurrency(coin.volume24h)}
                      </p>
                    </div>

                    <div className="col-span-2 flex items-center">
                      <p className="text-sm">
                        {formatNumber(coin.holderCount || 0)}
                      </p>
                    </div>

                    <div className="col-span-1 flex items-center justify-end">
                      {isActive ? (
                        <Badge variant="default" className="text-xs">Active</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">Quiet</Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Insights */}
          <div className="pt-4 border-t space-y-3">
            <p className="text-sm font-medium">💡 Content Insights</p>

            {successRate < 50 && (
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">How to Improve Content Performance:</p>
                <ul className="space-y-1 ml-4 list-disc">
                  <li>Analyze your top performing posts for common themes</li>
                  <li>Share posts across your social channels to drive awareness</li>
                  <li>Engage with holders in comments and community channels</li>
                  <li>Create series or follow-up posts to successful content</li>
                </ul>
              </div>
            )}

            {successRate >= 70 && (
              <div className="text-sm text-green-500">
                <p className="font-medium mb-1">🎉 Strong Content Strategy!</p>
                <p className="text-muted-foreground">
                  {successRate.toFixed(0)}% of your posts are generating trading activity.
                  This indicates strong content-market fit.
                </p>
              </div>
            )}

            {topPost && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <Sparkles className="h-4 w-4 text-primary mt-0.5" />
                <div className="text-xs text-muted-foreground">
                  <strong className="text-foreground">Top Performer:</strong> "
                  {truncateText(topPost.postContent || "Untitled Post", 60)}" generated{" "}
                  {formatCurrency(topPost.marketCap)} in market cap with{" "}
                  {formatNumber(topPost.holderCount || 0)} holders. Consider creating similar content.
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
