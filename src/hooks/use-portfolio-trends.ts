import { useMemo } from "react";

/**
 * Hook to generate portfolio trend data
 * TODO: Replace with actual historical data from database
 */
export function usePortfolioTrends(currentValue: number, currentEarnings: number) {
  const trendData = useMemo(() => {
    // Generate 90 days of sample data based on current values
    const days = 90;
    const data = [];
    const today = new Date();

    for (let i = days; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      // Simulate growth over time (start at 50% of current value, grow to current)
      const growthFactor = 0.5 + (0.5 * (days - i)) / days;

      // Add some randomness for realistic variation
      const randomVariation = 0.9 + Math.random() * 0.2; // ±10% variation

      const value = currentValue * growthFactor * randomVariation;
      const earnings = currentEarnings * growthFactor * randomVariation;
      const tradingFees = earnings * 0.6; // 60% from trading fees
      const creatorCut = earnings * 0.4; // 40% from creator cut

      data.push({
        date: date.toISOString().split("T")[0], // YYYY-MM-DD format
        value: Math.max(0, value),
        earnings: Math.max(0, earnings),
        tradingFees: Math.max(0, tradingFees),
        creatorCut: Math.max(0, creatorCut),
      });
    }

    return data;
  }, [currentValue, currentEarnings]);

  return trendData;
}
