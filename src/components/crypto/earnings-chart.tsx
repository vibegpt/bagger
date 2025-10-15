"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { DollarSign } from "lucide-react";

interface EarningsChartProps {
  data: {
    date: string;
    earnings: number;
    tradingFees: number;
    creatorCut: number;
  }[];
  title?: string;
}

export function EarningsChart({ data, title = "Earnings Over Time" }: EarningsChartProps) {
  const formatCurrency = (value: number) => {
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
          <p className="text-xs text-muted-foreground mb-2">
            {formatDate(payload[0].payload.date)}
          </p>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-primary">
              Total: {formatCurrency(payload[0].payload.earnings)}
            </p>
            <p className="text-xs text-muted-foreground">
              Trading Fees: {formatCurrency(payload[0].payload.tradingFees)}
            </p>
            <p className="text-xs text-muted-foreground">
              Creator Cut: {formatCurrency(payload[0].payload.creatorCut)}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const totalEarnings = data.reduce((sum, item) => sum + item.earnings, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              {title}
            </CardTitle>
            <CardDescription className="mt-1">
              Total: {formatCurrency(totalEarnings)} from {data.length} days
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No earnings data available yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
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
              <Bar
                dataKey="earnings"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
