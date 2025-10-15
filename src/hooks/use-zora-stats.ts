"use client";

import { useState, useEffect } from "react";
import type { ZoraCreatorStats } from "@/lib/integrations/zora/types";

export function useZoraStats(walletAddress: string | null) {
  const [stats, setStats] = useState<ZoraCreatorStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!walletAddress) {
      setStats(null);
      return;
    }

    const fetchStats = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/zora/stats?address=${walletAddress}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch Zora stats");
        }

        const data = await response.json();
        setStats(data.data);
      } catch (err) {
        console.error("Error fetching Zora stats:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [walletAddress]);

  return { stats, isLoading, error };
}
