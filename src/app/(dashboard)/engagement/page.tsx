"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostLoggerForm } from "@/components/engagement/post-logger-form";
import { EngagementAnalytics } from "@/components/engagement/engagement-analytics";

export default function EngagementPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePostLogged = () => {
    // Refresh the analytics component
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Engagement Tracking</h1>
        <p className="mt-2 text-muted-foreground">
          Track your social media posts and discover the best times to maximize engagement
        </p>
      </div>

      <Tabs defaultValue="log" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="log">Log Post</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="log" className="space-y-6">
          <PostLoggerForm onPostLogged={handlePostLogged} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <EngagementAnalytics key={refreshKey} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
