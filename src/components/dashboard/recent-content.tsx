"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Youtube, Play, Eye, ThumbsUp, MessageCircle, ExternalLink } from "lucide-react";
import Image from "next/image";

interface ContentItem {
  id: string;
  platform: string;
  contentId: string;
  contentType: string;
  title: string | null;
  description: string | null;
  thumbnailUrl: string | null;
  contentUrl: string | null;
  views: number | null;
  likes: number | null;
  comments: number | null;
  publishedAt: Date;
}

interface RecentContentProps {
  content: ContentItem[];
}

export function RecentContent({ content }: RecentContentProps) {
  if (content.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-primary" />
            Recent Content
          </CardTitle>
          <CardDescription>
            Your synced videos and posts from connected platforms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Youtube className="h-16 w-16 text-muted-foreground/20 mb-4" />
            <h3 className="text-lg font-medium mb-2">No content synced yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Click "Sync Videos" on your connected platforms to fetch your recent content.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "youtube":
        return <Youtube className="h-4 w-4" />;
      default:
        return <Play className="h-4 w-4" />;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "youtube":
        return "text-red-500";
      default:
        return "text-primary";
    }
  };

  const formatNumber = (num: number | null) => {
    if (num === null || num === undefined) return "0";
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5 text-primary" />
          Recent Content
        </CardTitle>
        <CardDescription>
          Your latest {content.length} videos and posts from connected platforms
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {content.map((item) => (
            <a
              key={item.id}
              href={item.contentUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <div className="rounded-lg border bg-card hover:bg-accent/5 transition-all overflow-hidden">
                {/* Thumbnail */}
                <div className="relative aspect-video bg-muted">
                  {item.thumbnailUrl ? (
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title || "Content thumbnail"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {getPlatformIcon(item.platform)}
                    </div>
                  )}
                  {/* Platform badge */}
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary" className="capitalize">
                      <span className={`mr-1 ${getPlatformColor(item.platform)}`}>
                        {getPlatformIcon(item.platform)}
                      </span>
                      {item.platform}
                    </Badge>
                  </div>
                  {/* External link icon */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-background/80 backdrop-blur rounded-full p-1.5">
                      <ExternalLink className="h-3 w-3" />
                    </div>
                  </div>
                </div>

                {/* Content info */}
                <div className="p-4 space-y-3">
                  {/* Title */}
                  <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                    {item.title || "Untitled"}
                  </h4>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {item.views !== null && (
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{formatNumber(item.views)}</span>
                      </div>
                    )}
                    {item.likes !== null && (
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3" />
                        <span>{formatNumber(item.likes)}</span>
                      </div>
                    )}
                    {item.comments !== null && (
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        <span>{formatNumber(item.comments)}</span>
                      </div>
                    )}
                  </div>

                  {/* Published date */}
                  <div className="text-xs text-muted-foreground">
                    {formatDate(item.publishedAt)}
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
