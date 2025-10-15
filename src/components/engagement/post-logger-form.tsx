"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Clock, MessageSquare, Save } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface PostLoggerFormProps {
  onPostLogged?: () => void;
}

export function PostLoggerForm({ onPostLogged }: PostLoggerFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [postDate, setPostDate] = useState<Date>();

  const [formData, setFormData] = useState({
    platform: "twitter",
    platformUrl: "",
    content: "",
    contentType: "text",
    postTime: "",
    likes: "",
    comments: "",
    shares: "",
    views: "",
    clicks: "",
    relatedTokenMint: "",
    relatedTokenAddress: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!postDate || !formData.postTime) {
      alert("Please select a post date and time");
      return;
    }

    setIsLoading(true);

    try {
      // Combine date and time
      const [hour, minute] = formData.postTime.split(':');
      const postDateTime = new Date(postDate);
      postDateTime.setHours(parseInt(hour), parseInt(minute));

      const payload = {
        platform: formData.platform,
        platformUrl: formData.platformUrl || undefined,
        content: formData.content || undefined,
        contentType: formData.contentType || undefined,
        postedAt: postDateTime.toISOString(),
        likes: formData.likes ? parseInt(formData.likes) : undefined,
        comments: formData.comments ? parseInt(formData.comments) : undefined,
        shares: formData.shares ? parseInt(formData.shares) : undefined,
        views: formData.views ? parseInt(formData.views) : undefined,
        clicks: formData.clicks ? parseInt(formData.clicks) : undefined,
        relatedTokenMint: formData.relatedTokenMint || undefined,
        relatedTokenAddress: formData.relatedTokenAddress || undefined,
      };

      const response = await fetch('/api/posts/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to log post');
      }

      // Reset form
      setFormData({
        platform: "twitter",
        platformUrl: "",
        content: "",
        contentType: "text",
        postTime: "",
        likes: "",
        comments: "",
        shares: "",
        views: "",
        clicks: "",
        relatedTokenMint: "",
        relatedTokenAddress: "",
      });
      setPostDate(undefined);

      onPostLogged?.();
      alert('Post logged successfully!');
    } catch (error) {
      console.error('Error logging post:', error);
      alert('Failed to log post. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <CardTitle>Log Social Post</CardTitle>
        </div>
        <CardDescription>
          Track your social media posts and see how they impact token performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Platform */}
            <div className="space-y-2">
              <Label htmlFor="platform">Platform *</Label>
              <Select
                value={formData.platform}
                onValueChange={(value) => setFormData({ ...formData, platform: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="twitter">Twitter/X</SelectItem>
                  <SelectItem value="discord">Discord</SelectItem>
                  <SelectItem value="telegram">Telegram</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Content Type */}
            <div className="space-y-2">
              <Label htmlFor="contentType">Content Type</Label>
              <Select
                value={formData.contentType}
                onValueChange={(value) => setFormData({ ...formData, contentType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="poll">Poll</SelectItem>
                  <SelectItem value="thread">Thread</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Post URL */}
          <div className="space-y-2">
            <Label htmlFor="platformUrl">Post URL (Optional)</Label>
            <Input
              id="platformUrl"
              type="url"
              placeholder="https://twitter.com/..."
              value={formData.platformUrl}
              onChange={(e) => setFormData({ ...formData, platformUrl: e.target.value })}
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Post Content (Optional)</Label>
            <Textarea
              id="content"
              placeholder="What did you post about?"
              rows={3}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            />
          </div>

          {/* Post Date & Time */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Post Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !postDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {postDate ? format(postDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={postDate}
                    onSelect={setPostDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="postTime">Post Time *</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="postTime"
                  type="time"
                  className="pl-9"
                  value={formData.postTime}
                  onChange={(e) => setFormData({ ...formData, postTime: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          {/* Engagement Metrics */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="likes">Likes</Label>
              <Input
                id="likes"
                type="number"
                placeholder="0"
                value={formData.likes}
                onChange={(e) => setFormData({ ...formData, likes: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="comments">Comments</Label>
              <Input
                id="comments"
                type="number"
                placeholder="0"
                value={formData.comments}
                onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shares">Shares/Retweets</Label>
              <Input
                id="shares"
                type="number"
                placeholder="0"
                value={formData.shares}
                onChange={(e) => setFormData({ ...formData, shares: e.target.value })}
              />
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="views">Views/Impressions</Label>
              <Input
                id="views"
                type="number"
                placeholder="0"
                value={formData.views}
                onChange={(e) => setFormData({ ...formData, views: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clicks">Clicks</Label>
              <Input
                id="clicks"
                type="number"
                placeholder="0"
                value={formData.clicks}
                onChange={(e) => setFormData({ ...formData, clicks: e.target.value })}
              />
            </div>
          </div>

          {/* Associated Tokens */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="relatedTokenMint">Pump.fun Token (Solana Mint)</Label>
              <Input
                id="relatedTokenMint"
                placeholder="Token mint address"
                value={formData.relatedTokenMint}
                onChange={(e) => setFormData({ ...formData, relatedTokenMint: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="relatedTokenAddress">Zora Token (ERC20 Address)</Label>
              <Input
                id="relatedTokenAddress"
                placeholder="0x..."
                value={formData.relatedTokenAddress}
                onChange={(e) => setFormData({ ...formData, relatedTokenAddress: e.target.value })}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? "Logging Post..." : "Log Post"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
