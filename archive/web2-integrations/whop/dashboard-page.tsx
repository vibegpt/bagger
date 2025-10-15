import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Zap, DollarSign, Users, TrendingUp, BarChart3 } from "lucide-react";
import { MetricCard } from "@/components/dashboard/metric-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { formatCurrency, formatNumber } from "@/lib/format";
import { calculateMRR } from "@/lib/calculations";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  // Check if user exists in database
  const user = await db.user.findUnique({
    where: { clerkId: userId },
    include: {
      platformConnections: true,
      products: true,
      dailyMetrics: {
        orderBy: { date: 'desc' },
        take: 90,
      },
    },
  });

  // Check if user has connected Whop
  const hasWhopConnection = user?.platformConnections?.some(
    (conn) => conn.platform === "whop" && conn.syncStatus === "active"
  );

  if (!hasWhopConnection) {
    return (
      <div className="flex min-h-[600px] items-center justify-center">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Welcome to Creator Analytics!</CardTitle>
            <CardDescription>
              Connect your Whop account to start tracking your revenue, subscribers, and growth metrics.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild size="lg">
              <Link href="/connect/whop">Connect Whop Account</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate metrics
  const latestMetric = user.dailyMetrics[0];
  const previousMetric = user.dailyMetrics[30]; // Compare to 30 days ago

  const totalRevenue = user.dailyMetrics.reduce(
    (sum, metric) => sum + Number(metric.totalRevenue),
    0
  );

  const revenueChange = previousMetric
    ? ((Number(latestMetric?.totalRevenue || 0) - Number(previousMetric.totalRevenue)) /
        Number(previousMetric.totalRevenue)) *
      100
    : 0;

  const subscriberChange = previousMetric
    ? ((Number(latestMetric?.totalSubscribers || 0) - Number(previousMetric.totalSubscribers)) /
        Number(previousMetric.totalSubscribers)) *
      100
    : 0;

  const mrr = calculateMRR(user.products.map(p => ({
    price: Number(p.price),
    billingPeriod: p.billingPeriod || 'monthly',
    subscriberCount: 0, // Will be populated from actual data
  })));

  const mrrChange = previousMetric
    ? ((Number(latestMetric?.mrr || 0) - Number(previousMetric.mrr)) /
        Number(previousMetric.mrr)) *
      100
    : 0;

  // Prepare chart data
  const chartData = user.dailyMetrics
    .slice()
    .reverse()
    .map((metric) => ({
      date: metric.date,
      revenue: Number(metric.totalRevenue),
    }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Overview of your creator business performance.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          change={revenueChange}
          changeLabel="vs last month"
          icon={<DollarSign className="h-4 w-4 text-gray-600" />}
        />
        <MetricCard
          title="MRR"
          value={formatCurrency(Number(latestMetric?.mrr || 0))}
          change={mrrChange}
          changeLabel="vs last month"
          icon={<TrendingUp className="h-4 w-4 text-gray-600" />}
        />
        <MetricCard
          title="Subscribers"
          value={formatNumber(latestMetric?.totalSubscribers || 0)}
          change={subscriberChange}
          changeLabel="vs last month"
          icon={<Users className="h-4 w-4 text-gray-600" />}
        />
        <MetricCard
          title="Products"
          value={formatNumber(user.products.length)}
          icon={<BarChart3 className="h-4 w-4 text-gray-600" />}
        />
      </div>

      {/* Revenue Chart */}
      <RevenueChart data={chartData} />

      {/* Recent Activity or Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest platform updates</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Last synced: {user.platformConnections[0]?.lastSyncedAt
              ? new Date(user.platformConnections[0].lastSyncedAt).toLocaleString()
              : 'Never'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
