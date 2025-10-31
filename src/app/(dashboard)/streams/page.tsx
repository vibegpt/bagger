"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Video,
  MessageSquare,
  Heart,
  Eye,
  ThumbsUp,
  Calendar,
  PlayCircle,
  Clock,
  TrendingUp,
  Users,
  Activity,
} from "lucide-react";
import { StreamLoggerForm } from "@/components/streams/stream-logger-form";
import { StreamHistory } from "@/components/streams/stream-history";
import { StreamCorrelation } from "@/components/streams/stream-correlation";

// Mock data for premium analytics
const mockData = {
  streams: [
    {
      title: "Building My Token Empire - Live Trading Session",
      platform: "YouTube",
      date: "2 days ago",
      views: 12400,
      likes: 980,
      comments: 156,
      shares: 43,
      duration: "2:34:12",
      engagement: 9.5,
      tokenMentions: 28,
      holderConversions: 15,
    },
    {
      title: "Community AMA: What's Next for DTV?",
      platform: "Twitter Spaces",
      date: "5 days ago",
      views: 8200,
      likes: 640,
      comments: 89,
      shares: 31,
      duration: "1:45:30",
      engagement: 9.3,
      tokenMentions: 42,
      holderConversions: 22,
    },
    {
      title: "Token Launch Strategy Breakdown",
      platform: "YouTube",
      date: "1 week ago",
      views: 18900,
      likes: 1420,
      comments: 234,
      shares: 78,
      duration: "0:48:22",
      engagement: 9.2,
      tokenMentions: 19,
      holderConversions: 31,
    },
    {
      title: "Market Analysis & Portfolio Review",
      platform: "Twitch",
      date: "1 week ago",
      views: 6700,
      likes: 410,
      comments: 67,
      shares: 18,
      duration: "3:12:45",
      engagement: 7.4,
      tokenMentions: 12,
      holderConversions: 8,
    },
  ],
  engagement: {
    totalViews30d: 124500,
    totalLikes30d: 9870,
    totalComments30d: 1245,
    totalShares30d: 456,
    avgEngagementRate: 8.9,
    topPerformingContent: "Building My Token Empire - Live Trading Session",
    viewsGrowth: 34.2,
    engagementGrowth: 12.8,
    audienceRetention: 76,
    avgWatchTime: "18:42",
    peakViewingTime: "Tuesday 2-4 PM EST",
    contentTypes: [
      { type: "Live Streams", count: 8, engagement: 9.2 },
      { type: "Tutorials", count: 12, engagement: 8.6 },
      { type: "Market Analysis", count: 15, engagement: 7.8 },
      { type: "AMAs", count: 4, engagement: 9.5 },
    ],
    topComments: [
      {
        author: "CryptoWhale42",
        text: "This strategy completely changed my approach. Bought 50k DTV after watching!",
        likes: 234,
        platform: "YouTube",
        convertedToHolder: true,
      },
      {
        author: "TokenHunter",
        text: "Best creator in the space. Your analysis is always on point.",
        likes: 189,
        platform: "Twitter",
        convertedToHolder: true,
      },
      {
        author: "DeFiEnthusiast",
        text: "When's the next AMA? Need to ask about the roadmap.",
        likes: 156,
        platform: "YouTube",
        convertedToHolder: false,
      },
    ],
  },
};

export default function StreamsPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleStreamLogged = () => {
    // Refresh the history component
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Stream Analytics</h1>
        <p className="mt-2 text-muted-foreground">
          Track your streaming sessions and see how they impact your token performance
        </p>
      </div>

      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="grid w-full max-w-4xl grid-cols-5">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="log">Log Stream</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="correlation">Impact Analysis</TabsTrigger>
        </TabsList>

        {/* Performance Tab - Stream Analytics */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5 text-purple-500" />
                Content Performance
              </CardTitle>
              <CardDescription>
                Track how your streams and videos drive token holder growth
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockData.streams.map((stream, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-4 p-4 rounded-lg border bg-card"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                      <PlayCircle className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium mb-1">{stream.title}</h4>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {stream.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {stream.duration}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {stream.platform}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant="default"
                            className="bg-green-500/10 text-green-600"
                          >
                            {stream.engagement.toFixed(1)}% engagement
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-4 mt-3">
                        <div className="text-center p-2 rounded bg-background/50">
                          <div className="flex items-center justify-center gap-1 text-sm font-bold">
                            <Eye className="h-3 w-3" />
                            {stream.views.toLocaleString()}
                          </div>
                          <p className="text-xs text-muted-foreground">Views</p>
                        </div>
                        <div className="text-center p-2 rounded bg-background/50">
                          <div className="flex items-center justify-center gap-1 text-sm font-bold">
                            <ThumbsUp className="h-3 w-3" />
                            {stream.likes.toLocaleString()}
                          </div>
                          <p className="text-xs text-muted-foreground">Likes</p>
                        </div>
                        <div className="text-center p-2 rounded bg-background/50">
                          <div className="flex items-center justify-center gap-1 text-sm font-bold">
                            <MessageSquare className="h-3 w-3" />
                            {stream.comments}
                          </div>
                          <p className="text-xs text-muted-foreground">Comments</p>
                        </div>
                        <div className="text-center p-2 rounded bg-background/50">
                          <div className="flex items-center justify-center gap-1 text-sm font-bold text-green-600">
                            <Users className="h-3 w-3" />
                            +{stream.holderConversions}
                          </div>
                          <p className="text-xs text-muted-foreground">New Holders</p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-xs">
                        <Badge variant="secondary" className="text-xs">
                          {stream.tokenMentions} token mentions
                        </Badge>
                        <span className="text-muted-foreground">
                          Conversion rate: {((stream.holderConversions / stream.views) * 100).toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Engagement Tab - Detailed Metrics */}
        <TabsContent value="engagement" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Eye className="h-4 w-4 text-blue-500" />
                  Total Views
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(mockData.engagement.totalViews30d / 1000).toFixed(1)}K
                </div>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +{mockData.engagement.viewsGrowth}% (30d)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  Total Likes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(mockData.engagement.totalLikes30d / 1000).toFixed(1)}K
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {mockData.engagement.avgEngagementRate}% avg rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-purple-500" />
                  Comments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(mockData.engagement.totalComments30d / 1000).toFixed(1)}K
                </div>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +{mockData.engagement.engagementGrowth}% (30d)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  Avg Watch Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mockData.engagement.avgWatchTime}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {mockData.engagement.audienceRetention}% retention
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Content Type Performance</CardTitle>
              <CardDescription>
                Engagement rates by content category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockData.engagement.contentTypes.map((type, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
                        <Activity className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium">{type.type}</h4>
                        <p className="text-sm text-muted-foreground">
                          {type.count} pieces of content
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant="default"
                        className="bg-green-500/10 text-green-600"
                      >
                        {type.engagement.toFixed(1)}% engagement
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-purple-500" />
                Top Converting Comments
              </CardTitle>
              <CardDescription>
                Comments from viewers who became token holders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockData.engagement.topComments.map((comment, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg border bg-card"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{comment.author}</span>
                        {comment.convertedToHolder && (
                          <Badge
                            variant="default"
                            className="bg-green-500/10 text-green-600 text-xs"
                          >
                            Converted to Holder
                          </Badge>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {comment.platform}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      "{comment.text}"
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Heart className="h-3 w-3" />
                      {comment.likes.toLocaleString()} likes
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="log" className="space-y-6">
          <StreamLoggerForm onStreamLogged={handleStreamLogged} />
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <StreamHistory key={refreshKey} />
        </TabsContent>

        <TabsContent value="correlation" className="space-y-6">
          <StreamCorrelation key={refreshKey} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
