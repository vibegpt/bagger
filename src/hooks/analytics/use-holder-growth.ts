import { useState, useEffect } from "react";

interface HolderGrowthData {
  date: string;
  totalHolders: number;
  newHolders: number;
  lostHolders: number;
  netGrowth: number;
  growthRate: number;
}

/**
 * Hook to calculate holder growth and churn metrics from on-chain data
 * Simulates time-series data based on current holder count
 * In production, this would query historical blockchain data
 */
export function useHolderGrowth(
  currentHolderCount: number,
  platform: "zora" | "pumpfun"
) {
  const [data, setData] = useState<HolderGrowthData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentHolderCount || currentHolderCount === 0) {
      setIsLoading(false);
      return;
    }

    // Simulate historical growth data
    // In production, this would query actual on-chain events
    const generateHistoricalData = (): HolderGrowthData[] => {
      const days = 30;
      const data: HolderGrowthData[] = [];

      // Start from 30 days ago with estimated initial holders
      let currentTotal = Math.max(1, Math.floor(currentHolderCount * 0.5));

      for (let i = days; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        // Simulate growth pattern
        // Real implementation would count actual wallet acquisitions/disposals
        const baseGrowthRate = 0.02; // 2% daily growth
        const volatility = 0.03; // ±3% random variance
        const randomFactor = (Math.random() - 0.5) * volatility;

        const growthFactor = baseGrowthRate + randomFactor;
        const newHolders = Math.max(0, Math.floor(currentTotal * Math.abs(growthFactor)));
        const lostHolders = Math.max(0, Math.floor(currentTotal * Math.abs(Math.min(0, growthFactor))));

        const netGrowth = newHolders - lostHolders;
        const previousTotal = currentTotal;
        currentTotal = Math.max(1, currentTotal + netGrowth);

        const growthRate = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0;

        data.push({
          date: dateStr,
          totalHolders: currentTotal,
          newHolders,
          lostHolders,
          netGrowth,
          growthRate,
        });
      }

      // Adjust last day to match actual current holder count
      if (data.length > 0) {
        const lastDay = data[data.length - 1];
        const adjustment = currentHolderCount - lastDay.totalHolders;
        lastDay.totalHolders = currentHolderCount;
        lastDay.netGrowth += adjustment;
        if (adjustment > 0) {
          lastDay.newHolders += adjustment;
        } else {
          lastDay.lostHolders += Math.abs(adjustment);
        }
        lastDay.growthRate = data.length > 1
          ? ((lastDay.totalHolders - data[data.length - 2].totalHolders) / data[data.length - 2].totalHolders) * 100
          : 0;
      }

      return data;
    };

    const historicalData = generateHistoricalData();
    setData(historicalData);
    setIsLoading(false);
  }, [currentHolderCount, platform]);

  return { data, isLoading };
}

/**
 * Calculate holder lifetime value (LTV)
 * LTV = Total Revenue ÷ Total Unique Holders
 */
export function useHolderLTV(
  totalRevenue: number,
  totalHolders: number
): number {
  if (totalHolders === 0) return 0;
  return totalRevenue / totalHolders;
}

/**
 * Calculate churn rate
 * Churn Rate = (Lost Holders ÷ Total Holders) × 100
 */
export function calculateChurnRate(
  lostHolders: number,
  totalHolders: number
): number {
  if (totalHolders === 0) return 0;
  return (lostHolders / totalHolders) * 100;
}

/**
 * Calculate retention rate
 * Retention Rate = 100 - Churn Rate
 */
export function calculateRetentionRate(churnRate: number): number {
  return 100 - churnRate;
}
