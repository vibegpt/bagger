"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useState } from "react";

interface PortfolioChartProps {
  data: {
    date: string;
    value: number;
    earnings: number;
  }[];
  title?: string;
  description?: string;
}

export function PortfolioChart({ data, title = "Portfolio Value", description }: PortfolioChartProps) {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "all">("30d");

  // Filter data based on time range
  const filterDataByRange = () => {
    const now = new Date();
    const daysMap = {
      "7d": 7,
      "30d": 30,
      "90d": 90,
      "all": 999999,
    };

    const days = daysMap[timeRange];
    const cutoffDate = new Date(now);
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return data.filter((item) => new Date(item.date) >= cutoffDate);
  };

  const filteredData = filterDataByRange();

  // Calculate change percentage
  const calculateChange = () => {
    if (filteredData.length < 2) return { value: 0, isPositive: true };

    const firstValue = filteredData[0].value;
    const lastValue = filteredData[filteredData.length - 1].value;
    const change = ((lastValue - firstValue) / firstValue) * 100;

    return {
      value: Math.abs(change),
      isPositive: change >= 0,
    };
  };

  const change = calculateChange();

  const formatCurrency = (value: number) => {
    if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(2)}M`;
    }
    if (value >= 1_000) {
      return `$${(value / 1_000).toFixed(1)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-3 shadow-lg">
          <p className="text-xs text-muted-foreground mb-1">
            {formatDate(payload[0].payload.date)}
          </p>
          <p className="text-sm font-semibold">
            Value: {formatCurrency(payload[0].value)}
          </p>
          <p className="text-xs text-muted-foreground">
            Earnings: {formatCurrency(payload[0].payload.earnings)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription className="mt-1">{description}</CardDescription>}
          </div>
          <div className="flex items-center gap-2">
            {/* Time range selector */}
            <div className="flex rounded-lg border bg-background p-1">
              {(["7d", "30d", "90d", "all"] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                    timeRange === range
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {range === "all" ? "All" : range.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
        {/* Change indicator */}
        <div className="flex items-center gap-2 mt-2">
          {change.isPositive ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
          <span className={`text-sm font-semibold ${change.isPositive ? "text-green-500" : "text-red-500"}`}>
            {change.isPositive ? "+" : "-"}
            {change.value.toFixed(2)}%
          </span>
          <span className="text-xs text-muted-foreground">
            {timeRange === "all" ? "all time" : `past ${timeRange}`}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {filteredData.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No data available for this time range
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={filteredData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis
                tickFormatter={formatCurrency}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
