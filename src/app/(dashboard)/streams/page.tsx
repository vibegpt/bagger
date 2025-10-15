"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StreamLoggerForm } from "@/components/streams/stream-logger-form";
import { StreamHistory } from "@/components/streams/stream-history";
import { StreamCorrelation } from "@/components/streams/stream-correlation";

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

      <Tabs defaultValue="log" className="space-y-6">
        <TabsList className="grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="log">Log Stream</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="correlation">Impact Analysis</TabsTrigger>
        </TabsList>

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
