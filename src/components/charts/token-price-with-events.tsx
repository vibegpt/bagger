"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Label
} from "recharts";
import { TrendingUp, TrendingDown, Youtube, Play } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface PriceDataPoint {
  timestamp: Date;
  price: number;
  marketCap: number;
  volume: number;
}

interface VideoEvent {
  id: string;
  title: string;
  publishedAt: Date;
  thumbnailUrl?: string;
  views?: number;
  priceImpact?: number; // Percentage change after video
}

interface TokenPriceWithEventsProps {
  tokenMint?: string;
  tokenAddress?: string;
  tokenSymbol: string;
  priceHistory: PriceDataPoint[];
  videoEvents: VideoEvent[];
  title?: string;
  description?: string;
}

export function TokenPriceWithEvents({
  tokenSymbol,
  priceHistory,
  videoEvents,
  title = "Token Price History",
  description,
}: TokenPriceWithEventsProps) {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "all">("30d");
  const [hoveredEvent, setHoveredEvent] = useState<VideoEvent | null>(null);

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

    return priceHistory.filter((item) => new Date(item.timestamp) >= cutoffDate);
  };

  const filteredData = filterDataByRange();

  // Filter video events to match time range
  const filterEventsbyRange = () => {
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

    return videoEvents.filter((event) => new Date(event.publishedAt) >= cutoffDate);
  };

  const filteredEvents = filterEventsbyRange();

  // Calculate price change percentage
  const calculateChange = () => {
    if (filteredData.length < 2) return { value: 0, isPositive: true };

    const firstValue = filteredData[0].price;
    const lastValue = filteredData[filteredData.length - 1].price;
    const change = ((lastValue - firstValue) / firstValue) * 100;

    return {
      value: Math.abs(change),
      isPositive: change >= 0,
    };
  };

  const change = calculateChange();

  const formatCurrency = (value: number) => {
    if (value >= 1) {
      return `$${value.toFixed(2)}`;
    }
    // For small crypto prices, show up to 8 decimals
    if (value > 0) {
      return `$${value.toFixed(8).replace(/\.?0+$/, '')}`;
    }
    return `$0.00`;
  };

  const formatDate = (dateStr: string | Date) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatDateTime = (dateStr: string | Date) => {
    const date = new Date(dateStr);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-3 shadow-lg">
          <p className="text-xs text-muted-foreground mb-1">
            {formatDateTime(payload[0].payload.timestamp)}
          </p>
          <p className="text-sm font-semibold">
            Price: {formatCurrency(payload[0].value)}
          </p>
          <p className="text-xs text-muted-foreground">
            Market Cap: {formatCurrency(payload[0].payload.marketCap)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Prepare chart data with timestamp as string for Recharts
  const chartData = filteredData.map(point => ({
    ...point,
    timestamp: point.timestamp.getTime(), // Convert to number for XAxis
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {title}
              <Badge variant="secondary" className="font-mono">
                ${tokenSymbol}
              </Badge>
            </CardTitle>
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
          {filteredEvents.length > 0 && (
            <>
              <span className="text-muted-foreground">•</span>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Youtube className="h-3 w-3 text-red-500" />
                <span>{filteredEvents.length} video{filteredEvents.length !== 1 ? 's' : ''}</span>
              </div>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[400px] text-muted-foreground">
            No price data available for this time range
          </div>
        ) : (
          <div className="space-y-4">
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(timestamp) => formatDate(new Date(timestamp))}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  type="number"
                  domain={['dataMin', 'dataMax']}
                />
                <YAxis
                  tickFormatter={formatCurrency}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorPrice)"
                />

                {/* Video event markers */}
                {filteredEvents.map((event) => (
                  <ReferenceLine
                    key={event.id}
                    x={new Date(event.publishedAt).getTime()}
                    stroke="#ef4444"
                    strokeDasharray="3 3"
                    strokeWidth={2}
                  >
                    <Label
                      value="📺"
                      position="top"
                      style={{ fontSize: 16, cursor: 'pointer' }}
                      onClick={() => setHoveredEvent(event)}
                    />
                  </ReferenceLine>
                ))}
              </AreaChart>
            </ResponsiveContainer>

            {/* Video events timeline */}
            {filteredEvents.length > 0 && (
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Play className="h-4 w-4 text-primary" />
                  Content Events
                </h4>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {filteredEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start gap-3 p-2 rounded-lg border hover:bg-accent/5 transition-colors cursor-pointer"
                      onClick={() => setHoveredEvent(event)}
                    >
                      {event.thumbnailUrl ? (
                        <img
                          src={event.thumbnailUrl}
                          alt={event.title}
                          className="w-20 h-12 rounded object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-20 h-12 rounded bg-muted flex items-center justify-center flex-shrink-0">
                          <Youtube className="h-6 w-6 text-red-500" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{event.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-muted-foreground">
                            {formatDateTime(event.publishedAt)}
                          </p>
                          {event.priceImpact !== undefined && event.priceImpact !== 0 && (
                            <>
                              <span className="text-muted-foreground">•</span>
                              <span className={`text-xs font-medium ${
                                event.priceImpact > 0 ? 'text-green-500' : 'text-red-500'
                              }`}>
                                {event.priceImpact > 0 ? '+' : ''}{event.priceImpact.toFixed(1)}% (24h)
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
