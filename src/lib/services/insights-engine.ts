import { db } from '@/lib/db';
import { calculateAllCorrelations } from './correlation-analysis';

/**
 * Generate and store correlation insights for a user
 * This function calculates all available correlations and saves them to the database
 */
export async function generateCorrelationInsights(
  userId: string,
  tokenMint?: string,
  tokenAddress?: string
): Promise<number> {
  try {
    // Calculate all correlations
    const correlations = await calculateAllCorrelations(userId, tokenMint, tokenAddress);

    if (correlations.length === 0) {
      console.log(`No correlations found for user ${userId}`);
      return 0;
    }

    // Delete existing insights for this user/token combination
    // (We'll regenerate them fresh each time)
    await db.correlationInsight.deleteMany({
      where: {
        userId,
        ...(tokenMint
          ? { relatedTokenMint: tokenMint }
          : tokenAddress
          ? { relatedTokenAddress: tokenAddress }
          : {}),
      },
    });

    // Create new insights in database
    const insightPromises = correlations.map((correlation, index) =>
      db.correlationInsight.create({
        data: {
          userId,
          insightType: getInsightType(correlation.category),
          category: correlation.category,
          title: correlation.title,
          description: correlation.description,
          metricValue: correlation.metricValue,
          metricUnit: correlation.metricUnit,
          confidenceScore: correlation.confidenceScore,
          sampleSize: correlation.sampleSize,
          timeRange: 'last_30_days',
          relatedPlatform: 'youtube',
          relatedTokenMint: tokenMint || null,
          relatedTokenAddress: tokenAddress || null,
          priority: calculatePriority(correlation),
          dismissed: false,
        },
      })
    );

    await Promise.all(insightPromises);

    console.log(`Generated ${correlations.length} insights for user ${userId}`);
    return correlations.length;
  } catch (error) {
    console.error('Error generating correlation insights:', error);
    throw error;
  }
}

/**
 * Generate insights for all users who have content with token associations
 */
export async function generateInsightsForAllUsers(): Promise<{
  totalUsers: number;
  successful: number;
  failed: number;
  totalInsights: number;
}> {
  try {
    // Find all users who have content with token associations
    const usersWithContent = await db.contentPerformance.findMany({
      where: {
        OR: [
          { relatedTokenMint: { not: null } },
          { relatedTokenAddress: { not: null } },
        ],
      },
      select: {
        userId: true,
        relatedTokenMint: true,
        relatedTokenAddress: true,
      },
      distinct: ['userId'],
    });

    const results = {
      totalUsers: usersWithContent.length,
      successful: 0,
      failed: 0,
      totalInsights: 0,
    };

    // Generate insights for each user
    for (const content of usersWithContent) {
      try {
        const insightsCount = await generateCorrelationInsights(
          content.userId,
          content.relatedTokenMint || undefined,
          content.relatedTokenAddress || undefined
        );

        results.successful++;
        results.totalInsights += insightsCount;
      } catch (error) {
        console.error(`Error generating insights for user ${content.userId}:`, error);
        results.failed++;
      }
    }

    return results;
  } catch (error) {
    console.error('Error generating insights for all users:', error);
    throw error;
  }
}

/**
 * Get insights for a user
 */
export async function getUserInsights(
  userId: string,
  options?: {
    tokenMint?: string;
    tokenAddress?: string;
    includeDismissed?: boolean;
    limit?: number;
  }
): Promise<any[]> {
  try {
    const insights = await db.correlationInsight.findMany({
      where: {
        userId,
        ...(options?.tokenMint
          ? { relatedTokenMint: options.tokenMint }
          : options?.tokenAddress
          ? { relatedTokenAddress: options.tokenAddress }
          : {}),
        ...(options?.includeDismissed ? {} : { dismissed: false }),
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      take: options?.limit || 10,
    });

    return insights;
  } catch (error) {
    console.error('Error getting user insights:', error);
    return [];
  }
}

/**
 * Dismiss an insight
 */
export async function dismissInsight(insightId: string): Promise<void> {
  try {
    await db.correlationInsight.update({
      where: { id: insightId },
      data: { dismissed: true },
    });
  } catch (error) {
    console.error('Error dismissing insight:', error);
    throw error;
  }
}

// Helper functions

function getInsightType(category: string): string {
  switch (category) {
    case 'content':
      return 'content_impact';
    case 'timing':
      return 'best_time';
    case 'performance':
      return 'performance_correlation';
    default:
      return 'general';
  }
}

function calculatePriority(correlation: any): number {
  // Priority is based on:
  // 1. Magnitude of impact (higher impact = higher priority)
  // 2. Confidence score (higher confidence = higher priority)
  // 3. Sample size (more data = higher priority)

  const impactScore = Math.abs(correlation.metricValue);
  const confidenceScore = correlation.confidenceScore;
  const sampleSizeScore = Math.min(100, (correlation.sampleSize / 10) * 100);

  // Weighted average
  const priority = impactScore * 0.5 + confidenceScore * 0.3 + sampleSizeScore * 0.2;

  return Math.round(priority);
}
