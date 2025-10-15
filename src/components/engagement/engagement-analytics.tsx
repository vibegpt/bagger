"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Share2, Eye, TrendingUp, Calendar, Clock } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { format } from "date-fns";

interface SocialPost {
  id: string;
  platform: string;
  platformUrl: string | null;
  content: string | null;
  contentType: string | null;
  postedAt: string;
  dayOfWeek: number;
  hourOfDay: number;
  likes: number;
  comments: number;
  shares: number;
  views: number | null;
  clicks: number | null;
  engagementRate: string | null;
  totalEngagement: number;
  relatedTokenMint: string | null;
  relatedTokenAddress: string | null;
}

export function EngagementAnalytics() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts/log');
      const result = await response.json();

      if (result.success) {
        setPosts(result.data);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate metrics
  const totalPosts = posts.length;
  const totalEngagement = posts.reduce((sum, p) => sum + p.totalEngagement, 0);
  const avgEngagement = totalPosts > 0 ? totalEngagement / totalPosts : 0;
  const avgEngagementRate = posts.reduce((sum, p) => sum + (parseFloat(p.engagementRate || '0')), 0) / (posts.length || 1);
  const topPost = posts.length > 0 ? posts.reduce((best, current) =>
    current.totalEngagement > best.totalEngagement ? current : best
  ) : null;

  // Best time to post analysis
  const hourlyData = Array.from({ length: 24 }, (_, hour) => {
    const hourPosts = posts.filter(p => p.hourOfDay === hour);
    const avgEng = hourPosts.length > 0
      ? hourPosts.reduce((sum, p) => sum + p.totalEngagement, 0) / hourPosts.length
      : 0;
    return {
      hour: `${hour}:00`,
      avgEngagement: Math.round(avgEng),
      postCount: hourPosts.length,
    };
  });

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dailyData = Array.from({ length: 7 }, (_, day) => {
    const dayPosts = posts.filter(p => p.dayOfWeek === day);
    const avgEng = dayPosts.length > 0
      ? dayPosts.reduce((sum, p) => sum + p.totalEngagement, 0) / dayPosts.length
      : 0;
    return {
      day: dayNames[day],
      avgEngagement: Math.round(avgEng),
      postCount: dayPosts.length,
    };
  });

  // Find best hour and day
  const bestHour = hourlyData.reduce((best, current) =>
    current.avgEngagement > best.avgEngagement ? current : best
  , hourlyData[0]);

  const bestDay = dailyData.reduce((best, current) =>
    current.avgEngagement > best.avgEngagement ? current : best
  , dailyData[0]);

  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      twitter: "bg-blue-500/20 text-blue-400",
      discord: "bg-indigo-500/20 text-indigo-400",
      telegram: "bg-cyan-500/20 text-cyan-400",
      instagram: "bg-pink-500/20 text-pink-400",
      tiktok: "bg-purple-500/20 text-purple-400",
      youtube: "bg-red-500/20 text-red-400",
    };
    return colors[platform] || "bg-gray-500/20 text-gray-400";
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            Loading engagement analytics...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (posts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Engagement Analytics</CardTitle>
          <CardDescription>No posts logged yet</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Log your first social post to start tracking engagement metrics and find your best posting times.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Posts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPosts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Tracked posts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Engagement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEngagement.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Likes + Comments + Shares
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg Engagement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(avgEngagement)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Per post
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg Engagement Rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(avgEngagementRate * 100).toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Engagement / Views
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Best Time to Post */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <CardTitle>Best Hour to Post</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary mb-2">{bestHour.hour}</div>
            <p className="text-sm text-muted-foreground">
              Avg {bestHour.avgEngagement} engagement from {bestHour.postCount} posts
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <CardTitle>Best Day to Post</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary mb-2">{bestDay.day}</div>
            <p className="text-sm text-muted-foreground">
              Avg {bestDay.avgEngagement} engagement from {bestDay.postCount} posts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Hourly Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Engagement by Hour</CardTitle>
          <CardDescription>
            When do your posts get the most engagement?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="hour" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))' }}
              />
              <Bar dataKey="avgEngagement" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
                {hourlyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.hour === bestHour.hour ? 'hsl(var(--accent))' : 'hsl(var(--primary))'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Daily Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Engagement by Day of Week</CardTitle>
          <CardDescription>
            Which days drive the most engagement?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="day" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))' }}
              />
              <Bar dataKey="avgEngagement" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
                {dailyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.day === bestDay.day ? 'hsl(var(--accent))' : 'hsl(var(--primary))'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Post */}
      {topPost && (
        <Card className="border-green-500/20 bg-green-500/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <CardTitle className="text-green-500">Top Performing Post</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Badge className={getPlatformColor(topPost.platform)}>
                {topPost.platform}
              </Badge>
              <p className="text-sm mt-2">{format(new Date(topPost.postedAt), "PPP 'at' p")}</p>
              {topPost.content && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                  {topPost.content}
                </p>
              )}
            </div>
            <div className="grid grid-cols-4 gap-2 text-sm">
              <div className="bg-muted/50 rounded p-2">
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                  <Heart className="h-3 w-3" />
                  Likes
                </div>
                <div className="font-bold">{topPost.likes.toLocaleString()}</div>
              </div>
              <div className="bg-muted/50 rounded p-2">
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                  <MessageCircle className="h-3 w-3" />
                  Comments
                </div>
                <div className="font-bold">{topPost.comments.toLocaleString()}</div>
              </div>
              <div className="bg-muted/50 rounded p-2">
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                  <Share2 className="h-3 w-3" />
                  Shares
                </div>
                <div className="font-bold">{topPost.shares.toLocaleString()}</div>
              </div>
              <div className="bg-muted/50 rounded p-2">
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                  <Eye className="h-3 w-3" />
                  Views
                </div>
                <div className="font-bold">{topPost.views?.toLocaleString() || 'N/A'}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Posts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Posts</CardTitle>
          <CardDescription>
            Your latest social media activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {posts.slice(0, 10).map((post) => (
              <div
                key={post.id}
                className="border rounded-lg p-4 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getPlatformColor(post.platform)}>
                        {post.platform}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(post.postedAt), "MMM d, h:mm a")}
                      </span>
                    </div>
                    {post.content && (
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {post.content}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{post.totalEngagement}</div>
                    <p className="text-xs text-muted-foreground">engagement</p>
                  </div>
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Heart className="h-3 w-3" /> {post.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" /> {post.comments}
                  </span>
                  <span className="flex items-center gap-1">
                    <Share2 className="h-3 w-3" /> {post.shares}
                  </span>
                  {post.views && (
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" /> {post.views.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
