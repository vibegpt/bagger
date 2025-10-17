"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Download, Copy, Check, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export default function AdminReportsPage() {
  const [reportData, setReportData] = useState<any>(null);
  const [threadData, setThreadData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copying, setCopying] = useState<number | null>(null);

  useEffect(() => {
    fetchLatestReport();
  }, []);

  const fetchLatestReport = async () => {
    setLoading(true);
    try {
      // Fetch report
      const reportRes = await fetch('/api/weekly-report');
      const report = await reportRes.json();
      setReportData(report);

      // Fetch thread
      const threadRes = await fetch('/api/twitter-thread');
      const thread = await threadRes.json();
      setThreadData(thread);

      toast.success('Report loaded successfully');
    } catch (error) {
      console.error('Error fetching report:', error);
      toast.error('Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const copyTweet = async (text: string, number: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopying(number);
      toast.success(`Tweet ${number} copied!`);
      setTimeout(() => setCopying(null), 2000);
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  const copyFullThread = async () => {
    if (!threadData?.thread) return;

    const fullThread = threadData.thread
      .map((tweet: any) => `Tweet ${tweet.number}:\n${tweet.text}\n`)
      .join('\n---\n\n');

    try {
      await navigator.clipboard.writeText(fullThread);
      toast.success('Full thread copied!');
    } catch (error) {
      toast.error('Failed to copy thread');
    }
  };

  const downloadReport = () => {
    const data = {
      report: reportData,
      thread: threadData,
      generatedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `weekly-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Report downloaded');
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Weekly Report Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Review and manage weekly data reports
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchLatestReport} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={downloadReport} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
      </div>

      {/* Report Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Data Summary</CardTitle>
          <CardDescription>
            Week {reportData?.report?.weekNumber} •{' '}
            {new Date(reportData?.report?.reportDate).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Zora Stats */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Badge variant="outline" className="bg-primary/10">
                  Zora
                </Badge>
              </h3>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Creators:</span>
                  <span className="font-medium">
                    {reportData?.report?.zora?.totalCreators.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Traders:</span>
                  <span className="font-medium">
                    {reportData?.report?.zora?.totalTraders.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Trading Volume:</span>
                  <span className="font-medium">
                    ${(reportData?.report?.zora?.tradingVolume / 1000000).toFixed(0)}M
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Creator Earnings:</span>
                  <span className="font-medium text-green-500">
                    ${(reportData?.report?.zora?.creatorEarnings / 1000000).toFixed(0)}M
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Success Rate:</span>
                  <span className="font-medium">
                    {reportData?.report?.zora?.graduationRate}%
                  </span>
                </div>
              </div>
            </div>

            {/* Pump.fun Stats */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Badge variant="outline" className="bg-accent/10">
                  Pump.fun
                </Badge>
              </h3>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Daily Launches:</span>
                  <span className="font-medium">
                    {reportData?.report?.pumpfun?.dailyTokenLaunches.toLocaleString()}+
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Graduation Rate:</span>
                  <span className="font-medium text-red-500">
                    {reportData?.report?.pumpfun?.graduationRate}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Daily Graduations:</span>
                  <span className="font-medium">
                    ~{reportData?.report?.pumpfun?.dailyGraduations}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Daily Users:</span>
                  <span className="font-medium">
                    {reportData?.report?.pumpfun?.dailyActiveUsers.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Profitable Users:</span>
                  <span className="font-medium text-red-500">
                    {reportData?.report?.pumpfun?.profitableUsers}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Twitter Thread */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Twitter Thread</CardTitle>
              <CardDescription>
                {threadData?.thread?.length} tweets ready to post
              </CardDescription>
            </div>
            <Button onClick={copyFullThread} variant="outline" size="sm">
              <Copy className="mr-2 h-4 w-4" />
              Copy All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {threadData?.thread?.map((tweet: any) => (
              <div
                key={tweet.number}
                className="p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">Tweet {tweet.number}</Badge>
                      {tweet.type && (
                        <Badge variant="outline" className="text-xs">
                          {tweet.type}
                        </Badge>
                      )}
                      {tweet.image && (
                        <Badge variant="outline" className="text-xs">
                          📊 Has visual
                        </Badge>
                      )}
                    </div>
                    <p className="whitespace-pre-line text-sm">{tweet.text}</p>
                    {tweet.image && (
                      <div className="mt-3">
                        <a
                          href={`/api/visualizations?type=${tweet.image}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          View visualization
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={() => copyTweet(tweet.text, tweet.number)}
                    variant="ghost"
                    size="sm"
                  >
                    {copying === tweet.number ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Visualizations */}
      <Card>
        <CardHeader>
          <CardTitle>Visualizations</CardTitle>
          <CardDescription>Charts for social media posts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {['pie-chart-losers', 'comparison-success-rate', 'bar-chart-scale', 'whale-trend'].map(
              (type) => (
                <div key={type} className="space-y-2">
                  <h4 className="text-sm font-medium capitalize">
                    {type.replace(/-/g, ' ')}
                  </h4>
                  <a
                    href={`/api/visualizations?type=${type}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <img
                      src={`/api/visualizations?type=${type}`}
                      alt={type}
                      className="w-full rounded-lg border hover:border-primary transition-colors"
                    />
                  </a>
                  <Button
                    onClick={async () => {
                      const url = `/api/visualizations?type=${type}`;
                      await navigator.clipboard.writeText(url);
                      toast.success('Chart URL copied!');
                    }}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy URL
                  </Button>
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>

      {/* Posting Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Posting Checklist</CardTitle>
          <CardDescription>Complete before posting to Twitter</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="review" className="rounded" />
              <label htmlFor="review">Review all tweets for accuracy</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="visuals" className="rounded" />
              <label htmlFor="visuals">Download all visualizations</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="time" className="rounded" />
              <label htmlFor="time">Schedule for Monday 9-11 AM EST</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="pin" className="rounded" />
              <label htmlFor="pin">Pin thread to profile after posting</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="engage" className="rounded" />
              <label htmlFor="engage">Monitor for first 2 hours and engage</label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
