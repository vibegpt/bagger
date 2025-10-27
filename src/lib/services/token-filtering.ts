/**
 * Token Filtering Service
 * Applies filter criteria to database queries for leaderboards
 */

import { db as prisma } from '@/lib/db';
import type { TokenMetrics } from '@prisma/client';

interface FilterCriteria {
  minMarketCap: number;
  minLiquidity: number;
  minVolume24h: number;
  minHolderCount: number;
  minTokenAgeHours: number;
  maxTokenAgeHours?: number;
  requireCreatorLinked?: boolean;
}

/**
 * Established Creators Board Filters
 * Conservative thresholds for proven, stable tokens
 */
export const ESTABLISHED_FILTERS: FilterCriteria = {
  minMarketCap: 100000, // $100k
  minLiquidity: 25000, // $25k
  minVolume24h: 25000, // $25k
  minHolderCount: 200,
  minTokenAgeHours: 72, // 3 days
  requireCreatorLinked: false, // For MVP, don't require creator linkage yet
};

/**
 * Trending Launches Board Filters
 * Lighter thresholds for discovery, focusing on new tokens
 */
export const TRENDING_FILTERS: FilterCriteria = {
  minMarketCap: 10000, // $10k
  minLiquidity: 5000, // $5k
  minVolume24h: 5000, // $5k
  minHolderCount: 50,
  minTokenAgeHours: 1, // 1 hour
  maxTokenAgeHours: 24, // 24 hours
  requireCreatorLinked: false,
};

export class TokenFilteringService {
  /**
   * Get tokens that pass Established Creators filters
   */
  async getEstablishedTokens(limit: number = 10): Promise<TokenMetrics[]> {
    console.log('[Filtering] Fetching established tokens...');

    const tokens = await prisma.tokenMetrics.findMany({
      where: {
        marketCapUsd: { gte: ESTABLISHED_FILTERS.minMarketCap },
        liquidityUsd: { gte: ESTABLISHED_FILTERS.minLiquidity },
        volume24hUsd: { gte: ESTABLISHED_FILTERS.minVolume24h },
        holderCount: { gte: ESTABLISHED_FILTERS.minHolderCount },
        tokenAgeHours: { gte: ESTABLISHED_FILTERS.minTokenAgeHours },
        // Anti-rug filters
        priceCrashDetected: false,
        liquidityDrainDetected: false,
        washTradingSuspected: false,
      },
      orderBy: [
        { creatorVerified: 'desc' }, // Verified creators first
        { marketCapUsd: 'desc' }, // Then by market cap
      ],
      take: limit,
    });

    console.log(`[Filtering] Found ${tokens.length} established tokens`);
    return tokens;
  }

  /**
   * Get tokens that pass Trending Launches filters
   * Ranked by velocity (growth rate)
   */
  async getTrendingTokens(limit: number = 20): Promise<TokenMetrics[]> {
    console.log('[Filtering] Fetching trending tokens...');

    const tokens = await prisma.tokenMetrics.findMany({
      where: {
        marketCapUsd: { gte: TRENDING_FILTERS.minMarketCap },
        liquidityUsd: { gte: TRENDING_FILTERS.minLiquidity },
        volume24hUsd: { gte: TRENDING_FILTERS.minVolume24h },
        holderCount: { gte: TRENDING_FILTERS.minHolderCount },
        tokenAgeHours: {
          gte: TRENDING_FILTERS.minTokenAgeHours,
          lte: TRENDING_FILTERS.maxTokenAgeHours || 24,
        },
        // Anti-rug filters
        priceCrashDetected: false,
        liquidityDrainDetected: false,
      },
      take: limit * 2, // Fetch extra for velocity ranking
    });

    // Calculate velocity scores and re-rank
    const rankedTokens = this.rankByVelocity(tokens);

    console.log(`[Filtering] Found ${rankedTokens.length} trending tokens (showing top ${Math.min(limit, rankedTokens.length)})`);
    return rankedTokens.slice(0, limit);
  }

  /**
   * Rank tokens by velocity (growth rate)
   * For MVP: Simple heuristic based on market cap and holders per hour of age
   * Future: Use snapshots for actual growth rate calculation
   */
  private rankByVelocity(tokens: TokenMetrics[]): TokenMetrics[] {
    const scored = tokens.map(token => {
      // Velocity = (market cap / age) * (holders / age)
      // Higher velocity = faster growth
      const ageInHours = Math.max(token.tokenAgeHours, 1);
      const mcapVelocity = Number(token.marketCapUsd) / ageInHours;
      const holderVelocity = token.holderCount / ageInHours;
      const velocityScore = mcapVelocity * holderVelocity;

      return {
        token,
        velocityScore,
      };
    });

    // Sort by velocity score descending
    scored.sort((a, b) => b.velocityScore - a.velocityScore);

    return scored.map(s => s.token);
  }

  /**
   * Check if a token passes Established filters (for validation)
   */
  isEstablished(token: TokenMetrics): boolean {
    return (
      Number(token.marketCapUsd) >= ESTABLISHED_FILTERS.minMarketCap &&
      Number(token.liquidityUsd) >= ESTABLISHED_FILTERS.minLiquidity &&
      Number(token.volume24hUsd) >= ESTABLISHED_FILTERS.minVolume24h &&
      token.holderCount >= ESTABLISHED_FILTERS.minHolderCount &&
      token.tokenAgeHours >= ESTABLISHED_FILTERS.minTokenAgeHours &&
      !token.priceCrashDetected &&
      !token.liquidityDrainDetected &&
      !token.washTradingSuspected
    );
  }

  /**
   * Check if a token passes Trending filters (for validation)
   */
  isTrending(token: TokenMetrics): boolean {
    return (
      Number(token.marketCapUsd) >= TRENDING_FILTERS.minMarketCap &&
      Number(token.liquidityUsd) >= TRENDING_FILTERS.minLiquidity &&
      Number(token.volume24hUsd) >= TRENDING_FILTERS.minVolume24h &&
      token.holderCount >= TRENDING_FILTERS.minHolderCount &&
      token.tokenAgeHours >= TRENDING_FILTERS.minTokenAgeHours &&
      token.tokenAgeHours <= (TRENDING_FILTERS.maxTokenAgeHours || 24) &&
      !token.priceCrashDetected &&
      !token.liquidityDrainDetected
    );
  }

  /**
   * Get filter statistics (how many tokens pass each filter)
   */
  async getFilterStats(): Promise<{
    totalTokens: number;
    establishedCount: number;
    trendingCount: number;
    filteredOut: {
      priceCrash: number;
      liquidityDrain: number;
      washTrading: number;
      belowThresholds: number;
    };
  }> {
    const [
      totalTokens,
      priceCrashCount,
      liquidityDrainCount,
      washTradingCount,
      establishedCount,
      trendingCount,
    ] = await Promise.all([
      prisma.tokenMetrics.count(),
      prisma.tokenMetrics.count({ where: { priceCrashDetected: true } }),
      prisma.tokenMetrics.count({ where: { liquidityDrainDetected: true } }),
      prisma.tokenMetrics.count({ where: { washTradingSuspected: true } }),
      prisma.tokenMetrics.count({
        where: {
          marketCapUsd: { gte: ESTABLISHED_FILTERS.minMarketCap },
          liquidityUsd: { gte: ESTABLISHED_FILTERS.minLiquidity },
          volume24hUsd: { gte: ESTABLISHED_FILTERS.minVolume24h },
          holderCount: { gte: ESTABLISHED_FILTERS.minHolderCount },
          tokenAgeHours: { gte: ESTABLISHED_FILTERS.minTokenAgeHours },
          priceCrashDetected: false,
          liquidityDrainDetected: false,
          washTradingSuspected: false,
        },
      }),
      prisma.tokenMetrics.count({
        where: {
          marketCapUsd: { gte: TRENDING_FILTERS.minMarketCap },
          liquidityUsd: { gte: TRENDING_FILTERS.minLiquidity },
          volume24hUsd: { gte: TRENDING_FILTERS.minVolume24h },
          holderCount: { gte: TRENDING_FILTERS.minHolderCount },
          tokenAgeHours: {
            gte: TRENDING_FILTERS.minTokenAgeHours,
            lte: TRENDING_FILTERS.maxTokenAgeHours || 24,
          },
          priceCrashDetected: false,
          liquidityDrainDetected: false,
        },
      }),
    ]);

    const ruggedTokens = priceCrashCount + liquidityDrainCount + washTradingCount;
    const belowThresholds = totalTokens - ruggedTokens - establishedCount;

    return {
      totalTokens,
      establishedCount,
      trendingCount,
      filteredOut: {
        priceCrash: priceCrashCount,
        liquidityDrain: liquidityDrainCount,
        washTrading: washTradingCount,
        belowThresholds: Math.max(0, belowThresholds),
      },
    };
  }

  /**
   * Get detailed breakdown of why tokens were filtered out
   */
  async getFilterBreakdown(): Promise<{
    passing: TokenMetrics[];
    failedMarketCap: TokenMetrics[];
    failedLiquidity: TokenMetrics[];
    failedVolume: TokenMetrics[];
    failedHolders: TokenMetrics[];
    failedAge: TokenMetrics[];
    rugSignals: TokenMetrics[];
  }> {
    const allTokens = await prisma.tokenMetrics.findMany();

    const passing: TokenMetrics[] = [];
    const failedMarketCap: TokenMetrics[] = [];
    const failedLiquidity: TokenMetrics[] = [];
    const failedVolume: TokenMetrics[] = [];
    const failedHolders: TokenMetrics[] = [];
    const failedAge: TokenMetrics[] = [];
    const rugSignals: TokenMetrics[] = [];

    for (const token of allTokens) {
      // Check for rug signals first
      if (
        token.priceCrashDetected ||
        token.liquidityDrainDetected ||
        token.washTradingSuspected
      ) {
        rugSignals.push(token);
        continue;
      }

      // Check each filter criterion
      if (Number(token.marketCapUsd) < ESTABLISHED_FILTERS.minMarketCap) {
        failedMarketCap.push(token);
      } else if (Number(token.liquidityUsd) < ESTABLISHED_FILTERS.minLiquidity) {
        failedLiquidity.push(token);
      } else if (Number(token.volume24hUsd) < ESTABLISHED_FILTERS.minVolume24h) {
        failedVolume.push(token);
      } else if (token.holderCount < ESTABLISHED_FILTERS.minHolderCount) {
        failedHolders.push(token);
      } else if (token.tokenAgeHours < ESTABLISHED_FILTERS.minTokenAgeHours) {
        failedAge.push(token);
      } else {
        passing.push(token);
      }
    }

    return {
      passing,
      failedMarketCap,
      failedLiquidity,
      failedVolume,
      failedHolders,
      failedAge,
      rugSignals,
    };
  }
}

export const tokenFilteringService = new TokenFilteringService();
