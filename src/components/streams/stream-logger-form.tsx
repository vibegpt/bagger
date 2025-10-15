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
import { CalendarIcon, Clock, Video, Save } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface StreamLoggerFormProps {
  onStreamLogged?: () => void;
}

export function StreamLoggerForm({ onStreamLogged }: StreamLoggerFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const [formData, setFormData] = useState({
    platform: "pumpfun",
    title: "",
    description: "",
    category: "",
    platformUrl: "",
    startTime: "",
    endTime: "",
    peakViewers: "",
    averageViewers: "",
    totalViews: "",
    relatedTokenMint: "",
    relatedTokenAddress: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!startDate || !formData.startTime) {
      alert("Please select a start date and time");
      return;
    }

    setIsLoading(true);

    try {
      // Combine date and time
      const [startHour, startMinute] = formData.startTime.split(':');
      const startDateTime = new Date(startDate);
      startDateTime.setHours(parseInt(startHour), parseInt(startMinute));

      let endDateTime: Date | undefined;
      if (endDate && formData.endTime) {
        const [endHour, endMinute] = formData.endTime.split(':');
        endDateTime = new Date(endDate);
        endDateTime.setHours(parseInt(endHour), parseInt(endMinute));
      }

      const payload = {
        platform: formData.platform,
        title: formData.title || undefined,
        description: formData.description || undefined,
        category: formData.category || undefined,
        platformUrl: formData.platformUrl || undefined,
        startedAt: startDateTime.toISOString(),
        endedAt: endDateTime?.toISOString(),
        peakViewers: formData.peakViewers ? parseInt(formData.peakViewers) : undefined,
        averageViewers: formData.averageViewers ? parseInt(formData.averageViewers) : undefined,
        totalViews: formData.totalViews ? parseInt(formData.totalViews) : undefined,
        relatedTokenMint: formData.relatedTokenMint || undefined,
        relatedTokenAddress: formData.relatedTokenAddress || undefined,
      };

      const response = await fetch('/api/streams/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to log stream');
      }

      // Reset form
      setFormData({
        platform: "pumpfun",
        title: "",
        description: "",
        category: "",
        platformUrl: "",
        startTime: "",
        endTime: "",
        peakViewers: "",
        averageViewers: "",
        totalViews: "",
        relatedTokenMint: "",
        relatedTokenAddress: "",
      });
      setStartDate(undefined);
      setEndDate(undefined);

      onStreamLogged?.();
      alert('Stream logged successfully!');
    } catch (error) {
      console.error('Error logging stream:', error);
      alert('Failed to log stream. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Video className="h-5 w-5 text-primary" />
          <CardTitle>Log a Stream</CardTitle>
        </div>
        <CardDescription>
          Manually track your streaming sessions and correlate them with token performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Platform */}
            <div className="space-y-2">
              <Label htmlFor="platform">Platform</Label>
              <Select
                value={formData.platform}
                onValueChange={(value) => setFormData({ ...formData, platform: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pumpfun">Pump.fun</SelectItem>
                  <SelectItem value="zora">Zora</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="twitch">Twitch</SelectItem>
                  <SelectItem value="kick">Kick</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category (Optional)</Label>
              <Input
                id="category"
                placeholder="e.g., Just Chatting, Gaming"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Stream Title</Label>
            <Input
              id="title"
              placeholder="What's the stream about?"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Add notes about the stream..."
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Stream URL */}
          <div className="space-y-2">
            <Label htmlFor="platformUrl">Stream URL (Optional)</Label>
            <Input
              id="platformUrl"
              type="url"
              placeholder="https://..."
              value={formData.platformUrl}
              onChange={(e) => setFormData({ ...formData, platformUrl: e.target.value })}
            />
          </div>

          {/* Start Date & Time */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Start Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time *</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="startTime"
                  type="time"
                  className="pl-9"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          {/* End Date & Time */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>End Date (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">End Time (Optional)</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="endTime"
                  type="time"
                  className="pl-9"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Viewer Metrics */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="peakViewers">Peak Viewers</Label>
              <Input
                id="peakViewers"
                type="number"
                placeholder="0"
                value={formData.peakViewers}
                onChange={(e) => setFormData({ ...formData, peakViewers: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="averageViewers">Avg Viewers</Label>
              <Input
                id="averageViewers"
                type="number"
                placeholder="0"
                value={formData.averageViewers}
                onChange={(e) => setFormData({ ...formData, averageViewers: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalViews">Total Views</Label>
              <Input
                id="totalViews"
                type="number"
                placeholder="0"
                value={formData.totalViews}
                onChange={(e) => setFormData({ ...formData, totalViews: e.target.value })}
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
            {isLoading ? "Logging Stream..." : "Log Stream"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
