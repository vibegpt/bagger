import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  loading?: boolean;
}

export function MetricCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  loading = false,
}: MetricCardProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            {title}
          </CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <div className="h-8 w-24 animate-pulse rounded bg-gray-200" />
          <div className="mt-2 h-4 w-32 animate-pulse rounded bg-gray-200" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <div className="mt-1 flex items-center text-xs">
            {isPositive && (
              <ArrowUpIcon className="mr-1 h-3 w-3 text-green-600" />
            )}
            {isNegative && (
              <ArrowDownIcon className="mr-1 h-3 w-3 text-red-600" />
            )}
            <span
              className={cn(
                "font-medium",
                isPositive && "text-green-600",
                isNegative && "text-red-600",
                change === 0 && "text-gray-600"
              )}
            >
              {isPositive ? "+" : ""}
              {change.toFixed(1)}%
            </span>
            {changeLabel && (
              <span className="ml-1 text-gray-600">{changeLabel}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
