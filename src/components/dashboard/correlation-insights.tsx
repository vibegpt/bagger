"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Lightbulb,
  TrendingUp,
  TrendingDown,
  Calendar,
  Play,
  BarChart3,
  X,
  RefreshCw,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface Insight {
  id: string;
  insightType: string;
  category: string;
  title: string;
  description: string;
  metricValue: number;
  metricUnit: string;
  confidenceScore: number;
  sampleSize: number;
  timeRange: string;
  priority: number;
  createdAt: Date;
}

interface CorrelationInsightsProps {
  tokenMint?: string;
  tokenAddress?: string;
  limit?: number;
}

export function CorrelationInsights({
  tokenMint,
  tokenAddress,
  limit = 5,
}: CorrelationInsightsProps) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (tokenMint) params.append('tokenMint', tokenMint);
      if (tokenAddress) params.append('tokenAddress', tokenAddress);
      params.append('limit', limit.toString());

      const response = await fetch(`/api/insights?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setInsights(data.insights);
      }
    } catch (error) {
      console.error('Error fetching insights:', error);
      toast.error('Failed to load insights');
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = async () => {
    try {
      setGenerating(true);
      toast.loading('Generating insights...', { id: 'generate-insights' });

      const response = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenMint, tokenAddress }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Generated ${data.insightsCount} insights`, {
          id: 'generate-insights',
        });
        await fetchInsights();
      } else {
        toast.error('Failed to generate insights', { id: 'generate-insights' });
      }
    } catch (error) {
      console.error('Error generating insights:', error);
      toast.error('Failed to generate insights', { id: 'generate-insights' });
    } finally {
      setGenerating(false);
    }
  };

  const dismissInsight = async (insightId: string) => {
    try {
      const response = await fetch('/api/insights', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ insightId }),
      });

      if (response.ok) {
        setInsights((prev) => prev.filter((i) => i.id !== insightId));
        toast.success('Insight dismissed');
      } else {
        toast.error('Failed to dismiss insight');
      }
    } catch (error) {
      console.error('Error dismissing insight:', error);
      toast.error('Failed to dismiss insight');
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [tokenMint, tokenAddress]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'content':
        return <Play className="h-4 w-4" />;
      case 'timing':
        return <Calendar className="h-4 w-4" />;
      case 'performance':
        return <BarChart3 className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'content':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'timing':
        return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'performance':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      default:
        return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  const formatMetricValue = (value: number, unit: string) => {
    switch (unit) {
      case 'percent':
        return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
      case 'correlation':
        return `${value.toFixed(0)}%`;
      default:
        return value.toFixed(1);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Web2+Web3 Insights
          </CardTitle>
          <CardDescription>
            Loading correlation insights...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              Web2+Web3 Insights
            </CardTitle>
            <CardDescription>
              How your YouTube content impacts your token performance
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={generateInsights}
            disabled={generating}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${generating ? 'animate-spin' : ''}`} />
            {generating ? 'Generating...' : 'Refresh'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {insights.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Lightbulb className="h-16 w-16 text-muted-foreground/20 mb-4" />
            <h3 className="text-lg font-medium mb-2">No insights yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-4">
              Link your videos to a token and publish content to generate correlation insights.
            </p>
            <Button variant="outline" onClick={generateInsights} disabled={generating}>
              <RefreshCw className={`h-4 w-4 mr-2 ${generating ? 'animate-spin' : ''}`} />
              {generating ? 'Generating...' : 'Generate Insights'}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className="relative p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
              >
                {/* Dismiss button */}
                <button
                  onClick={() => dismissInsight(insight.id)}
                  className="absolute top-2 right-2 p-1 rounded hover:bg-accent transition-colors"
                  title="Dismiss insight"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>

                <div className="flex items-start gap-3 pr-6">
                  {/* Category icon */}
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg border ${getCategoryColor(insight.category)}`}>
                    {getCategoryIcon(insight.category)}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Title with metric */}
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 className="font-medium text-sm">{insight.title}</h4>
                      {insight.metricValue !== 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {formatMetricValue(insight.metricValue, insight.metricUnit)}
                        </Badge>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground mb-2">
                      {insight.description}
                    </p>

                    {/* Metadata */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                      <div className="flex items-center gap-1">
                        <BarChart3 className="h-3 w-3" />
                        <span>{insight.confidenceScore}% confidence</span>
                      </div>
                      <span>•</span>
                      <span>{insight.sampleSize} data point{insight.sampleSize !== 1 ? 's' : ''}</span>
                      {insight.timeRange && (
                        <>
                          <span>•</span>
                          <span className="capitalize">{insight.timeRange.replace('_', ' ')}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* More insights prompt */}
            <div className="text-center pt-2">
              <Button variant="ghost" size="sm" onClick={generateInsights} disabled={generating}>
                <RefreshCw className={`h-4 w-4 mr-2 ${generating ? 'animate-spin' : ''}`} />
                Refresh Insights
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
