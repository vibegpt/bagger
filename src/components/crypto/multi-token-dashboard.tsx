"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, DollarSign, Users, Activity, Search, ArrowUpDown, BarChart3 } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";

interface Token {
  mint: string;
  name: string;
  symbol: string;
  imageUri?: string;
  marketCap: number;
  volume24h: number;
  holderCount: number;
  complete: boolean;
  createdAt?: string;
  price?: number;
}

interface MultiTokenDashboardProps {
  tokens: Token[];
}

type SortField = "marketCap" | "volume24h" | "holderCount" | "name";
type SortDirection = "asc" | "desc";

export function MultiTokenDashboard({ tokens }: MultiTokenDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("marketCap");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);

  // Format currency helper
  const formatCurrency = (value: number) => {
    if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(2)}M`;
    }
    if (value >= 1_000) {
      return `$${(value / 1_000).toFixed(1)}K`;
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(2)}M`;
    }
    if (value >= 1_000) {
      return `${(value / 1_000).toFixed(1)}K`;
    }
    return new Intl.NumberFormat("en-US").format(value);
  };

  // Portfolio-level metrics
  const portfolioMetrics = useMemo(() => {
    const total = tokens.length;
    const graduated = tokens.filter(t => t.complete).length;
    const totalMarketCap = tokens.reduce((sum, t) => sum + t.marketCap, 0);
    const totalVolume = tokens.reduce((sum, t) => sum + t.volume24h, 0);
    const totalHolders = tokens.reduce((sum, t) => sum + t.holderCount, 0);
    const avgMarketCap = total > 0 ? totalMarketCap / total : 0;
    const avgVolume = total > 0 ? totalVolume / total : 0;
    const graduationRate = total > 0 ? (graduated / total) * 100 : 0;

    return {
      total,
      graduated,
      totalMarketCap,
      totalVolume,
      totalHolders,
      avgMarketCap,
      avgVolume,
      graduationRate,
    };
  }, [tokens]);

  // Filter and sort tokens
  const filteredAndSortedTokens = useMemo(() => {
    const filtered = tokens.filter(token =>
      token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );

    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      // Handle string sorting for name
      if (sortField === "name") {
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
        return sortDirection === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      // Handle number sorting
      return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
    });

    return filtered;
  }, [tokens, searchQuery, sortField, sortDirection]);

  // Top performers data for charts
  const topPerformers = useMemo(() => {
    return [...tokens]
      .sort((a, b) => b.marketCap - a.marketCap)
      .slice(0, 10)
      .map(token => ({
        name: token.symbol,
        marketCap: token.marketCap,
        volume: token.volume24h,
        holders: token.holderCount,
      }));
  }, [tokens]);

  // Graduation distribution
  const graduationData = [
    { name: "Graduated", value: portfolioMetrics.graduated, color: "#10b981" },
    { name: "Active", value: portfolioMetrics.total - portfolioMetrics.graduated, color: "#6366f1" },
  ];

  // Toggle token selection
  const toggleTokenSelection = (mint: string) => {
    setSelectedTokens(prev =>
      prev.includes(mint)
        ? prev.filter(m => m !== mint)
        : [...prev, mint]
    );
  };

  // Toggle sort
  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  if (tokens.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Multi-Token Portfolio</CardTitle>
          <CardDescription>No tokens found</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Create your first token on Pump.fun to start tracking your portfolio
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="pb-2">
            <CardDescription>Total Tokens</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{portfolioMetrics.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {portfolioMetrics.graduated} graduated ({portfolioMetrics.graduationRate.toFixed(1)}%)
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-transparent">
          <CardHeader className="pb-2">
            <CardDescription>Total Market Cap</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {formatCurrency(portfolioMetrics.totalMarketCap)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Avg: {formatCurrency(portfolioMetrics.avgMarketCap)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent">
          <CardHeader className="pb-2">
            <CardDescription>24h Volume</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {formatCurrency(portfolioMetrics.totalVolume)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Avg: {formatCurrency(portfolioMetrics.avgVolume)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent">
          <CardHeader className="pb-2">
            <CardDescription>Total Holders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500">
              {formatNumber(portfolioMetrics.totalHolders)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all tokens
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Performers by Market Cap */}
        <Card>
          <CardHeader>
            <CardTitle>Top 10 by Market Cap</CardTitle>
            <CardDescription>Your best performing tokens</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topPerformers} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" className="text-xs" tickFormatter={(value) => formatCurrency(value)} />
                <YAxis dataKey="name" type="category" className="text-xs" width={60} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))' }}
                />
                <Bar dataKey="marketCap" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Graduation Status */}
        <Card>
          <CardHeader>
            <CardTitle>Graduation Status</CardTitle>
            <CardDescription>Graduated vs active tokens</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={graduationData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {graduationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Token List with Filters */}
      <Card>
        <CardHeader>
          <CardTitle>All Tokens ({filteredAndSortedTokens.length})</CardTitle>
          <CardDescription>Compare and analyze your entire portfolio</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Sort Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or symbol..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={sortField} onValueChange={(value) => setSortField(value as SortField)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="marketCap">Market Cap</SelectItem>
                  <SelectItem value="volume24h">24h Volume</SelectItem>
                  <SelectItem value="holderCount">Holders</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSortDirection(prev => prev === "asc" ? "desc" : "asc")}
              >
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Token Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredAndSortedTokens.map((token) => {
              const isSelected = selectedTokens.includes(token.mint);
              return (
                <Card
                  key={token.mint}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    isSelected ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => toggleTokenSelection(token.mint)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between mb-3">
                      {token.imageUri ? (
                        <img
                          src={token.imageUri}
                          alt={token.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                          <BarChart3 className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      <Badge
                        variant="secondary"
                        className={token.complete ? "bg-green-500/20 text-green-500" : "bg-blue-500/20 text-blue-500"}
                      >
                        {token.complete ? "Graduated" : "Active"}
                      </Badge>
                    </div>
                    <CardTitle className="text-base line-clamp-1">{token.name}</CardTitle>
                    <CardDescription className="text-xs">${token.symbol}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          Market Cap
                        </span>
                        <span className="font-semibold text-green-500">
                          {formatCurrency(token.marketCap)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Activity className="h-3 w-3" />
                          24h Volume
                        </span>
                        <span className="font-semibold text-blue-500">
                          {formatCurrency(token.volume24h)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          Holders
                        </span>
                        <span className="font-semibold text-purple-500">
                          {formatNumber(token.holderCount)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredAndSortedTokens.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No tokens match your search criteria
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Tokens Comparison */}
      {selectedTokens.length > 0 && (
        <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Token Comparison</CardTitle>
                <CardDescription>
                  Comparing {selectedTokens.length} selected token{selectedTokens.length !== 1 ? "s" : ""}
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedTokens([])}
              >
                Clear Selection
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={tokens.filter(t => selectedTokens.includes(t.mint)).map(t => ({
                  name: t.symbol,
                  marketCap: t.marketCap,
                  volume: t.volume24h,
                  holders: t.holderCount,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))' }}
                />
                <Legend />
                <Bar dataKey="marketCap" fill="#10b981" name="Market Cap" />
                <Bar dataKey="volume" fill="#3b82f6" name="24h Volume" />
                <Bar dataKey="holders" fill="#8b5cf6" name="Holders" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
