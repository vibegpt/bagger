/**
 * Token Ingestion Service
 * Fetches token data from DexScreener and stores in database
 */

import { db as prisma } from '@/lib/db';
import { dexScreenerClient } from '@/lib/integrations/dexscreener/client';
import type { TokenMetrics } from '@prisma/client';

interface TokenIngestionResult {
  success: boolean;
  mintAddress: string;
  message: string;
  tokenAgeHours?: number;
  marketCap?: number;
}

export class TokenIngestionService {
  /**
   * Ingest a single token's current metrics from DexScreener
   */
  async ingestToken(mintAddress: string): Promise<TokenIngestionResult> {
    try {
      console.log(`[Ingestion] Processing ${mintAddress}...`);

      // Fetch from DexScreener
      const tokenData = await dexScreenerClient.getTokenData(mintAddress);

      if (!tokenData) {
        return {
          success: false,
          mintAddress,
          message: 'Failed to fetch token data from DexScreener',
        };
      }

      // Check if token already exists
      const existing = await prisma.tokenMetrics.findUnique({
        where: { mintAddress },
        include: {
          metricSnapshots: {
            orderBy: { timestamp: 'desc' },
            take: 10, // Get last 10 snapshots for rug detection
          },
        },
      });

      // Detect rug signals using historical snapshots
      let priceCrashDetected = false;
      let liquidityDrainDetected = false;

      if (existing && existing.metricSnapshots.length > 0) {
        // Check for price crash
        const priceSnapshots = existing.metricSnapshots.map(s => ({
          timestamp: s.timestamp,
          price: Number(s.priceUsd),
        }));
        priceCrashDetected = await dexScreenerClient.detectPriceCrash(
          mintAddress,
          priceSnapshots
        );

        // Check for liquidity drain
        const liquiditySnapshots = existing.metricSnapshots.map(s => ({
          timestamp: s.timestamp,
          liquidity: Number(s.liquidityUsd),
        }));
        liquidityDrainDetected = await dexScreenerClient.detectLiquidityDrain(
          liquiditySnapshots
        );
      }

      // Calculate price and liquidity changes
      let priceChange24h = tokenData.priceChange24h;
      let liquidityChange24h = null;

      if (existing) {
        // Find snapshot from ~24h ago
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const oldSnapshot = existing.metricSnapshots.find(
          s => s.timestamp <= oneDayAgo
        );

        if (oldSnapshot) {
          const oldLiq = Number(oldSnapshot.liquidityUsd);
          if (oldLiq > 0) {
            liquidityChange24h = ((tokenData.liquidity - oldLiq) / oldLiq) * 100;
          }
        }
      }

      // Upsert token metrics to database
      const upsertedToken = await prisma.tokenMetrics.upsert({
        where: { mintAddress },
        create: {
          mintAddress,
          name: tokenData.name,
          symbol: tokenData.symbol,
          imageUrl: tokenData.imageUrl,
          creatorWallet: null, // Will be populated by creator linkage service later
          createdAt: tokenData.createdAt,
          marketCapUsd: tokenData.marketCap,
          liquidityUsd: tokenData.liquidity,
          volume24hUsd: tokenData.volume24h,
          volume7dUsd: null, // DexScreener doesn't provide 7d volume
          holderCount: tokenData.holderCount,
          uniqueTraders24h: tokenData.uniqueTraders24h,
          tokenAgeHours: tokenData.tokenAgeHours,
          distinctTradingHours24h: null, // Will calculate from snapshots
          priceChange24h,
          liquidityChange24h,
          priceCrashDetected,
          liquidityDrainDetected,
          washTradingSuspected: false, // TODO: Implement wash trading detection
          creatorVerified: false, // Default, will be updated by verification service
          graduatedToRaydium: tokenData.dexId === 'raydium',
        },
        update: {
          name: tokenData.name,
          symbol: tokenData.symbol,
          imageUrl: tokenData.imageUrl,
          marketCapUsd: tokenData.marketCap,
          liquidityUsd: tokenData.liquidity,
          volume24hUsd: tokenData.volume24h,
          holderCount: tokenData.holderCount,
          uniqueTraders24h: tokenData.uniqueTraders24h,
          tokenAgeHours: tokenData.tokenAgeHours,
          priceChange24h,
          liquidityChange24h,
          priceCrashDetected,
          liquidityDrainDetected,
          graduatedToRaydium: tokenData.dexId === 'raydium',
          lastUpdatedAt: new Date(),
        },
      });

      // Store snapshot for time-series analysis
      await prisma.tokenMetricSnapshot.create({
        data: {
          mintAddress,
          timestamp: new Date(),
          marketCapUsd: tokenData.marketCap,
          liquidityUsd: tokenData.liquidity,
          priceUsd: tokenData.price,
          holderCount: tokenData.holderCount,
        },
      });

      console.log(
        `[Ingestion] ✓ ${tokenData.symbol}: $${tokenData.marketCap.toLocaleString()} mcap, ${tokenData.tokenAgeHours}h old`
      );

      return {
        success: true,
        mintAddress,
        message: 'Token ingested successfully',
        tokenAgeHours: tokenData.tokenAgeHours,
        marketCap: tokenData.marketCap,
      };
    } catch (error) {
      console.error(`[Ingestion] ✗ Error processing ${mintAddress}:`, error);
      return {
        success: false,
        mintAddress,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Batch ingest multiple tokens (respects rate limits)
   */
  async ingestTokenBatch(mintAddresses: string[]): Promise<TokenIngestionResult[]> {
    console.log(`[Ingestion] Starting batch of ${mintAddresses.length} tokens...`);

    const results: TokenIngestionResult[] = [];

    for (const mintAddress of mintAddresses) {
      const result = await this.ingestToken(mintAddress);
      results.push(result);

      // Small delay between tokens to be nice to DexScreener
      if (results.length < mintAddresses.length) {
        await new Promise(resolve => setTimeout(resolve, 250)); // 4 tokens/sec
      }
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(
      `[Ingestion] Batch complete: ${successful} successful, ${failed} failed`
    );

    return results;
  }

  /**
   * Seed the database with initial tokens from our curated list
   */
  async seedInitialTokens(): Promise<void> {
    console.log('[Ingestion] Seeding database with initial tokens...');

    const INITIAL_TOKENS = [
      'CPLTbYbtDMKZtHBaPqdDmHjxNwESCEB14gm6VuoDpump', // DTV
      '2GXmB95pGD3pHV4mzNq7YsmyiEmVYWQLptbwYqgdpump', // WNTV
      '7ctK21VZcJX1t1jiWLyWkSJk2Wm7xHYdsnWegzR6pump', // Wolf
      'BWExg398H58wceWfmMDZQdeVhFGe4wQFrbV72VoZpump', // Birdie
      'Df6yfrKC8kZE3KNkrHERKzAetSxbrWeniQfyJY4Jpump', // CHILLGUY
    ];

    const results = await this.ingestTokenBatch(INITIAL_TOKENS);

    const successful = results.filter(r => r.success);
    console.log(`[Ingestion] ✓ Seeded ${successful.length} tokens to database`);

    // Display summary
    successful.forEach(r => {
      if (r.tokenAgeHours && r.marketCap) {
        const ageInDays = Math.floor(r.tokenAgeHours / 24);
        console.log(
          `  - ${r.mintAddress.slice(0, 8)}: $${(r.marketCap / 1000000).toFixed(2)}M, ${ageInDays}d old`
        );
      }
    });
  }

  /**
   * Update all tokens in database (for cron job)
   */
  async updateAllTokens(limit: number = 50): Promise<{
    updated: number;
    failed: number;
    total: number;
  }> {
    console.log(`[Ingestion] Updating up to ${limit} tokens...`);

    // Get tokens that need updating (sorted by oldest lastUpdatedAt)
    const tokensToUpdate = await prisma.tokenMetrics.findMany({
      where: {
        // Only update tokens less than 30 days old
        tokenAgeHours: { lte: 720 }, // 30 days
      },
      orderBy: {
        lastUpdatedAt: 'asc', // Update oldest first
      },
      take: limit,
      select: {
        mintAddress: true,
      },
    });

    if (tokensToUpdate.length === 0) {
      console.log('[Ingestion] No tokens to update');
      return { updated: 0, failed: 0, total: 0 };
    }

    const mintAddresses = tokensToUpdate.map(t => t.mintAddress);
    const results = await this.ingestTokenBatch(mintAddresses);

    const updated = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return {
      updated,
      failed,
      total: tokensToUpdate.length,
    };
  }

  /**
   * Clean up old snapshots (keep only last 7 days)
   */
  async cleanupOldSnapshots(): Promise<number> {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const result = await prisma.tokenMetricSnapshot.deleteMany({
      where: {
        timestamp: {
          lt: sevenDaysAgo,
        },
      },
    });

    console.log(`[Ingestion] Cleaned up ${result.count} old snapshots`);
    return result.count;
  }

  /**
   * Get ingestion statistics
   */
  async getStats(): Promise<{
    totalTokens: number;
    tokensLast24h: number;
    totalSnapshots: number;
    avgSnapshotsPerToken: number;
    oldestUpdate: Date | null;
    newestUpdate: Date | null;
  }> {
    const [totalTokens, tokensLast24h, totalSnapshots, oldestToken, newestToken] =
      await Promise.all([
        prisma.tokenMetrics.count(),
        prisma.tokenMetrics.count({
          where: {
            lastUpdatedAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
            },
          },
        }),
        prisma.tokenMetricSnapshot.count(),
        prisma.tokenMetrics.findFirst({
          orderBy: { lastUpdatedAt: 'asc' },
          select: { lastUpdatedAt: true },
        }),
        prisma.tokenMetrics.findFirst({
          orderBy: { lastUpdatedAt: 'desc' },
          select: { lastUpdatedAt: true },
        }),
      ]);

    return {
      totalTokens,
      tokensLast24h,
      totalSnapshots,
      avgSnapshotsPerToken: totalTokens > 0 ? totalSnapshots / totalTokens : 0,
      oldestUpdate: oldestToken?.lastUpdatedAt || null,
      newestUpdate: newestToken?.lastUpdatedAt || null,
    };
  }
}

export const tokenIngestionService = new TokenIngestionService();
