import { useState, useEffect } from 'react';

interface VolumeDataPoint {
  date: string;
  volume: number;
  holders?: number;
}

interface UseVolumeHistoryProps {
  coinAddress?: string;
  currentVolume?: number;
  currentHolders?: number;
}

/**
 * Hook to fetch volume and holder history for a coin
 *
 * TODO: Replace mock data with actual Zora API calls when historical data becomes available
 * For now, generates realistic-looking data based on current metrics
 */
export function useVolumeHistory({
  coinAddress,
  currentVolume = 0,
  currentHolders = 0
}: UseVolumeHistoryProps) {
  const [data, setData] = useState<VolumeDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!coinAddress || currentVolume === 0) {
      setData([]);
      return;
    }

    setIsLoading(true);

    // Generate 30 days of mock historical data
    // This simulates what real API data would look like
    const generateMockData = (): VolumeDataPoint[] => {
      const days = 30;
      const data: VolumeDataPoint[] = [];
      const now = new Date();

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);

        // Create realistic variations based on current values
        // Volume tends to increase over time with fluctuations
        const volumeBase = currentVolume * (0.3 + (i / days) * 0.7);
        const volumeVariation = volumeBase * (0.8 + Math.random() * 0.4);

        // Holders tend to grow more steadily
        const holdersBase = currentHolders * (0.5 + (i / days) * 0.5);
        const holdersVariation = Math.floor(holdersBase * (0.9 + Math.random() * 0.2));

        data.push({
          date: date.toISOString(),
          volume: Math.max(0, volumeVariation),
          holders: Math.max(0, holdersVariation),
        });
      }

      return data;
    };

    // Simulate API delay
    const timer = setTimeout(() => {
      setData(generateMockData());
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [coinAddress, currentVolume, currentHolders]);

  return {
    data,
    isLoading,
  };
}

/**
 * Generate aggregated volume history for multiple coins
 */
export function useAggregatedVolumeHistory(coins: Array<{ address: string; volume24h: number; holderCount: number }>) {
  const [data, setData] = useState<VolumeDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (coins.length === 0) {
      setData([]);
      return;
    }

    setIsLoading(true);

    const generateAggregatedData = (): VolumeDataPoint[] => {
      const days = 30;
      const data: VolumeDataPoint[] = [];
      const now = new Date();

      const totalVolume = coins.reduce((sum, coin) => sum + coin.volume24h, 0);
      const totalHolders = coins.reduce((sum, coin) => sum + coin.holderCount, 0);

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);

        // Aggregate volume grows over time with market variations
        const volumeBase = totalVolume * (0.3 + (i / days) * 0.7);
        const volumeVariation = volumeBase * (0.8 + Math.random() * 0.4);

        // Holders grow more steadily across all coins
        const holdersBase = totalHolders * (0.5 + (i / days) * 0.5);
        const holdersVariation = Math.floor(holdersBase * (0.9 + Math.random() * 0.2));

        data.push({
          date: date.toISOString(),
          volume: Math.max(0, volumeVariation),
          holders: Math.max(0, holdersVariation),
        });
      }

      return data;
    };

    const timer = setTimeout(() => {
      setData(generateAggregatedData());
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [coins]);

  return {
    data,
    isLoading,
  };
}
