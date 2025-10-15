"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface SyncButtonProps {
  platform: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

export function SyncButton({ platform, variant = "outline", size = "sm" }: SyncButtonProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const router = useRouter();

  const handleSync = async () => {
    setIsSyncing(true);
    toast.loading("Syncing data from " + platform + "...", { id: "sync" });

    try {
      const response = await fetch(`/api/sync/${platform}`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Sync failed");
      }

      toast.success(data.message || "Sync completed successfully", { id: "sync" });

      // Refresh the page to show updated data
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to sync data",
        { id: "sync" }
      );
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleSync}
      disabled={isSyncing}
    >
      <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? "animate-spin" : ""}`} />
      {isSyncing ? "Syncing..." : "Sync Now"}
    </Button>
  );
}
