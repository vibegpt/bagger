/**
 * Social Metrics Service
 * Handles CoinGecko data syncing and growth calculations
 */

import { db as prisma } from '@/lib/db';
import { coinGeckoClient } from '@/lib/integrations/coingecko/client';

export interface SocialMetricsWithGrowth {
  mintAddress: string;
  coinGeckoId: string | null;
  twitterFollowers: number | null;
  redditSubscribers: number | null;
  telegramUsers: number | null;
  facebookLikes: number | null;
  communityScore: number | null;
  sentimentUpPercentage: number | null;
  sentimentDownPercentage: number | null;
  twitterGrowth7d: number | null;
  redditGrowth7d: number | null;
  communityGrowthRate: number | null;
  lastSyncedAt: Date;
}

export class SocialMetricsService {
  /**
   * Sync social metrics for a specific token
   */
  async syncTokenSocialMetrics(
    mintAddress: string,
    tokenSymbol: string
  ): Promise<SocialMetricsWithGrowth | null> {
    try {
      console.log(`[SocialMetrics] Syncing social metrics for ${tokenSymbol} (${mintAddress})`);

      // 1. Search CoinGecko for the token
      const searchResults = await coinGeckoClient.searchCoin(tokenSymbol);

      if (searchResults.length === 0) {
        console.log(`[SocialMetrics] Token ${tokenSymbol} not found on CoinGecko`);
        return null;
      }

      // Use first result (most relevant)
      const coinGeckoId = searchResults[0].id;
      console.log(`[SocialMetrics] Found CoinGecko ID: ${coinGeckoId}`);

      // 2. Fetch social metrics from CoinGecko
      const socialData = await coinGeckoClient.getSocialMetrics(coinGeckoId);

      if (!socialData) {
        console.log(`[SocialMetrics] No social data available for ${coinGeckoId}`);
        return null;
      }

      // 3. Calculate growth from snapshots (7-day)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const oldSnapshot = await prisma.socialMetricsSnapshot.findFirst({
        where: {
          mintAddress,
          timestamp: {
            gte: sevenDaysAgo,
          },
        },
        orderBy: {
          timestamp: 'asc',
        },
      });

      let twitterGrowth7d: number | null = null;
      let redditGrowth7d: number | null = null;
      let communityGrowthRate: number | null = null;

      if (oldSnapshot && socialData.twitterFollowers && oldSnapshot.twitterFollowers) {
        twitterGrowth7d = socialData.twitterFollowers - oldSnapshot.twitterFollowers;
      }

      if (oldSnapshot && socialData.redditSubscribers && oldSnapshot.redditSubscribers) {
        redditGrowth7d = socialData.redditSubscribers - Number(oldSnapshot.redditSubscribers);
      }

      if (oldSnapshot && socialData.communityScore && oldSnapshot.communityScore) {
        const oldScore = Number(oldSnapshot.communityScore);
        const newScore = socialData.communityScore;
        communityGrowthRate = ((newScore - oldScore) / oldScore) * 100;
      }

      // 4. Upsert current social metrics
      const updatedMetrics = await prisma.socialMetrics.upsert({
        where: { mintAddress },
        create: {
          mintAddress,
          coinGeckoId,
          twitterFollowers: socialData.twitterFollowers,
          redditSubscribers: socialData.redditSubscribers,
          telegramUsers: socialData.telegramUsers,
          facebookLikes: socialData.facebookLikes,
          communityScore: socialData.communityScore,
          sentimentUpPercentage: socialData.sentimentUpPercentage,
          sentimentDownPercentage: socialData.sentimentDownPercentage,
          twitterGrowth7d,
          redditGrowth7d,
          communityGrowthRate,
          lastSyncedAt: new Date(),
        },
        update: {
          coinGeckoId,
          twitterFollowers: socialData.twitterFollowers,
          redditSubscribers: socialData.redditSubscribers,
          telegramUsers: socialData.telegramUsers,
          facebookLikes: socialData.facebookLikes,
          communityScore: socialData.communityScore,
          sentimentUpPercentage: socialData.sentimentUpPercentage,
          sentimentDownPercentage: socialData.sentimentDownPercentage,
          twitterGrowth7d,
          redditGrowth7d,
          communityGrowthRate,
          lastSyncedAt: new Date(),
        },
      });

      // 5. Create snapshot for future growth calculations
      await prisma.socialMetricsSnapshot.create({
        data: {
          mintAddress,
          timestamp: new Date(),
          twitterFollowers: socialData.twitterFollowers,
          redditSubscribers: socialData.redditSubscribers,
          telegramUsers: socialData.telegramUsers,
          facebookLikes: socialData.facebookLikes,
          communityScore: socialData.communityScore,
          sentimentUpPercentage: socialData.sentimentUpPercentage,
        },
      });

      console.log(`[SocialMetrics] Successfully synced ${tokenSymbol}`);

      return {
        mintAddress: updatedMetrics.mintAddress,
        coinGeckoId: updatedMetrics.coinGeckoId,
        twitterFollowers: updatedMetrics.twitterFollowers,
        redditSubscribers: updatedMetrics.redditSubscribers,
        telegramUsers: updatedMetrics.telegramUsers,
        facebookLikes: updatedMetrics.facebookLikes,
        communityScore: updatedMetrics.communityScore ? Number(updatedMetrics.communityScore) : null,
        sentimentUpPercentage: updatedMetrics.sentimentUpPercentage ? Number(updatedMetrics.sentimentUpPercentage) : null,
        sentimentDownPercentage: updatedMetrics.sentimentDownPercentage ? Number(updatedMetrics.sentimentDownPercentage) : null,
        twitterGrowth7d: updatedMetrics.twitterGrowth7d,
        redditGrowth7d: updatedMetrics.redditGrowth7d,
        communityGrowthRate: updatedMetrics.communityGrowthRate ? Number(updatedMetrics.communityGrowthRate) : null,
        lastSyncedAt: updatedMetrics.lastSyncedAt,
      };
    } catch (error) {
      console.error(`[SocialMetrics] Error syncing ${mintAddress}:`, error);
      return null;
    }
  }

  /**
   * Sync social metrics for all tokens in database
   */
  async syncAllTokens(): Promise<number> {
    try {
      console.log('[SocialMetrics] Starting bulk sync...');

      // Get all tokens from TokenMetrics
      const tokens = await prisma.tokenMetrics.findMany({
        select: {
          mintAddress: true,
          symbol: true,
        },
      });

      console.log(`[SocialMetrics] Found ${tokens.length} tokens to sync`);

      let successCount = 0;
      let failCount = 0;

      for (const token of tokens) {
        if (!token.symbol) {
          console.log(`[SocialMetrics] Skipping ${token.mintAddress} - no symbol`);
          failCount++;
          continue;
        }

        const result = await this.syncTokenSocialMetrics(token.mintAddress, token.symbol);

        if (result) {
          successCount++;
        } else {
          failCount++;
        }

        // Rate limiting: 30 requests/minute = 1 request per 2 seconds
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      console.log(`[SocialMetrics] Sync complete: ${successCount} success, ${failCount} failed`);
      return successCount;
    } catch (error) {
      console.error('[SocialMetrics] Error in bulk sync:', error);
      throw error;
    }
  }

  /**
   * Get social metrics for a token
   */
  async getSocialMetrics(mintAddress: string): Promise<SocialMetricsWithGrowth | null> {
    const metrics = await prisma.socialMetrics.findUnique({
      where: { mintAddress },
    });

    if (!metrics) {
      return null;
    }

    return {
      mintAddress: metrics.mintAddress,
      coinGeckoId: metrics.coinGeckoId,
      twitterFollowers: metrics.twitterFollowers,
      redditSubscribers: metrics.redditSubscribers,
      telegramUsers: metrics.telegramUsers,
      facebookLikes: metrics.facebookLikes,
      communityScore: metrics.communityScore ? Number(metrics.communityScore) : null,
      sentimentUpPercentage: metrics.sentimentUpPercentage ? Number(metrics.sentimentUpPercentage) : null,
      sentimentDownPercentage: metrics.sentimentDownPercentage ? Number(metrics.sentimentDownPercentage) : null,
      twitterGrowth7d: metrics.twitterGrowth7d,
      redditGrowth7d: metrics.redditGrowth7d,
      communityGrowthRate: metrics.communityGrowthRate ? Number(metrics.communityGrowthRate) : null,
      lastSyncedAt: metrics.lastSyncedAt,
    };
  }

  /**
   * Get growth trend for a token (30-day history)
   */
  async getGrowthTrend(mintAddress: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const snapshots = await prisma.socialMetricsSnapshot.findMany({
      where: {
        mintAddress,
        timestamp: {
          gte: startDate,
        },
      },
      orderBy: {
        timestamp: 'asc',
      },
    });

    return snapshots.map(snapshot => ({
      date: snapshot.timestamp,
      twitterFollowers: snapshot.twitterFollowers,
      redditSubscribers: snapshot.redditSubscribers,
      telegramUsers: snapshot.telegramUsers,
      communityScore: snapshot.communityScore ? Number(snapshot.communityScore) : null,
      sentimentUpPercentage: snapshot.sentimentUpPercentage ? Number(snapshot.sentimentUpPercentage) : null,
    }));
  }

  /**
   * Clean up old snapshots (keep last 90 days)
   */
  async cleanupOldSnapshots(): Promise<number> {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const result = await prisma.socialMetricsSnapshot.deleteMany({
      where: {
        timestamp: {
          lt: ninetyDaysAgo,
        },
      },
    });

    console.log(`[SocialMetrics] Cleaned up ${result.count} old snapshots`);
    return result.count;
  }
}

export const socialMetricsService = new SocialMetricsService();
