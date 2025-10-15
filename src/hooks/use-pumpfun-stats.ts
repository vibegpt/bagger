"use client";

import { useState, useEffect } from "react";
import type { PumpFunCreatorStats } from "@/lib/integrations/pumpfun/types";

export function usePumpFunStats(creatorAddress: string | null) {
  const [stats, setStats] = useState<PumpFunCreatorStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!creatorAddress) {
      setStats(null);
      return;
    }

    const fetchStats = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/pumpfun/creator-stats?creator=${creatorAddress}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch Pump.fun stats");
        }

        const data = await response.json();
        setStats(data.data);
      } catch (err) {
        console.error("Error fetching Pump.fun stats:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [creatorAddress]);

  return { stats, isLoading, error };
}
