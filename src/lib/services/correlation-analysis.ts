import { db } from '@/lib/db';
import { calculateContentPriceImpact } from './content-token-snapshot';

interface CorrelationResult {
  category: string;
  title: string;
  description: string;
  metricValue: number;
  metricUnit: string;
  confidenceScore: number;
  sampleSize: number;
}

/**
 * Calculate average price impact across all content
 */
export async function calculateAverageContentImpact(
  userId: string,
  tokenMint?: string,
  tokenAddress?: string
): Promise<CorrelationResult | null> {
  try {
    // Get all content with token associations
    const content = await db.contentPerformance.findMany({
      where: {
        userId,
        ...(tokenMint
          ? { relatedTokenMint: tokenMint }
          : tokenAddress
          ? { relatedTokenAddress: tokenAddress }
          : {
              OR: [
                { relatedTokenMint: { not: null } },
                { relatedTokenAddress: { not: null } },
              ],
            }),
      },
      select: {
        id: true,
        title: true,
        publishedAt: true,
      },
    });

    if (content.length === 0) {
      return null;
    }

    // Calculate impact for each piece of content
    const impacts: number[] = [];

    for (const item of content) {
      const impact = await calculateContentPriceImpact(item.id);
      if (impact && impact.impact24h !== undefined) {
        impacts.push(impact.impact24h);
      }
    }

    if (impacts.length === 0) {
      return null;
    }

    // Calculate average
    const averageImpact = impacts.reduce((sum, val) => sum + val, 0) / impacts.length;

    // Calculate confidence score based on sample size and consistency
    const standardDeviation = calculateStandardDeviation(impacts);
    const coefficientOfVariation = standardDeviation / Math.abs(averageImpact);
    const consistencyScore = Math.max(0, 100 - coefficientOfVariation * 50);
    const sampleScore = Math.min(100, (impacts.length / 10) * 100);
    const confidenceScore = (consistencyScore + sampleScore) / 2;

    return {
      category: 'content',
      title: `Content drives ${averageImpact > 0 ? '+' : ''}${averageImpact.toFixed(1)}% token price change`,
      description: `Your videos have an average ${averageImpact > 0 ? 'positive' : 'negative'} impact of ${Math.abs(averageImpact).toFixed(1)}% on token price within 24 hours of publication. ${impacts.length} video${impacts.length !== 1 ? 's' : ''} analyzed.`,
      metricValue: averageImpact,
      metricUnit: 'percent',
      confidenceScore: Math.round(confidenceScore),
      sampleSize: impacts.length,
    };
  } catch (error) {
    console.error('Error calculating average content impact:', error);
    return null;
  }
}

/**
 * Analyze best posting times (day of week and hour)
 */
export async function analyzeBestPostingTimes(
  userId: string,
  tokenMint?: string,
  tokenAddress?: string
): Promise<CorrelationResult | null> {
  try {
    // Get all content with token associations and impact data
    const content = await db.contentPerformance.findMany({
      where: {
        userId,
        ...(tokenMint
          ? { relatedTokenMint: tokenMint }
          : tokenAddress
          ? { relatedTokenAddress: tokenAddress }
          : {
              OR: [
                { relatedTokenMint: { not: null } },
                { relatedTokenAddress: { not: null } },
              ],
            }),
      },
      select: {
        id: true,
        publishedAt: true,
      },
    });

    if (content.length < 3) {
      return null; // Need at least 3 data points
    }

    // Group by day of week and calculate average impact
    const dayImpacts: { [key: number]: number[] } = {};

    for (const item of content) {
      const impact = await calculateContentPriceImpact(item.id);
      if (impact && impact.impact24h !== undefined) {
        const dayOfWeek = item.publishedAt.getDay();
        if (!dayImpacts[dayOfWeek]) {
          dayImpacts[dayOfWeek] = [];
        }
        dayImpacts[dayOfWeek].push(impact.impact24h);
      }
    }

    // Find best day
    let bestDay = 0;
    let bestDayImpact = -Infinity;

    for (const [day, impacts] of Object.entries(dayImpacts)) {
      if (impacts.length > 0) {
        const avgImpact = impacts.reduce((sum, val) => sum + val, 0) / impacts.length;
        if (avgImpact > bestDayImpact) {
          bestDayImpact = avgImpact;
          bestDay = parseInt(day);
        }
      }
    }

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return {
      category: 'timing',
      title: `${dayNames[bestDay]} posts drive +${bestDayImpact.toFixed(1)}% token price`,
      description: `Content published on ${dayNames[bestDay]} shows the strongest positive impact on token price (+${bestDayImpact.toFixed(1)}% average). Consider scheduling important announcements for this day.`,
      metricValue: bestDayImpact,
      metricUnit: 'percent',
      confidenceScore: Math.min(100, (dayImpacts[bestDay]?.length || 0) * 20),
      sampleSize: dayImpacts[bestDay]?.length || 0,
    };
  } catch (error) {
    console.error('Error analyzing best posting times:', error);
    return null;
  }
}

/**
 * Identify content type that performs best (based on title keywords)
 */
export async function analyzeBestContentType(
  userId: string,
  tokenMint?: string,
  tokenAddress?: string
): Promise<CorrelationResult | null> {
  try {
    // Get all content with token associations
    const content = await db.contentPerformance.findMany({
      where: {
        userId,
        ...(tokenMint
          ? { relatedTokenMint: tokenMint }
          : tokenAddress
          ? { relatedTokenAddress: tokenAddress }
          : {
              OR: [
                { relatedTokenMint: { not: null } },
                { relatedTokenAddress: { not: null } },
              ],
            }),
      },
      select: {
        id: true,
        title: true,
      },
    });

    if (content.length < 3) {
      return null;
    }

    // Define content type keywords
    const contentTypes = {
      'Tutorial': ['tutorial', 'how to', 'guide', 'learn', 'explained'],
      'Live Stream': ['live', 'stream', 'streaming'],
      'Announcement': ['announcement', 'announcing', 'launched', 'launch'],
      'Review': ['review', 'analysis', 'breakdown'],
      'Update': ['update', 'news', 'what happened'],
    };

    // Classify content and calculate impact by type
    const typeImpacts: { [key: string]: number[] } = {};

    for (const item of content) {
      const impact = await calculateContentPriceImpact(item.id);
      if (impact && impact.impact24h !== undefined && item.title) {
        // Classify content type based on title
        const titleLower = item.title.toLowerCase();
        let classified = false;

        for (const [type, keywords] of Object.entries(contentTypes)) {
          if (keywords.some((keyword) => titleLower.includes(keyword))) {
            if (!typeImpacts[type]) {
              typeImpacts[type] = [];
            }
            typeImpacts[type].push(impact.impact24h);
            classified = true;
            break;
          }
        }

        // Default to "Other" if not classified
        if (!classified) {
          if (!typeImpacts['Other']) {
            typeImpacts['Other'] = [];
          }
          typeImpacts['Other'].push(impact.impact24h);
        }
      }
    }

    // Find best content type
    let bestType = 'Content';
    let bestTypeImpact = -Infinity;
    let bestTypeSampleSize = 0;

    for (const [type, impacts] of Object.entries(typeImpacts)) {
      if (impacts.length > 0) {
        const avgImpact = impacts.reduce((sum, val) => sum + val, 0) / impacts.length;
        if (avgImpact > bestTypeImpact && impacts.length >= 2) {
          bestTypeImpact = avgImpact;
          bestType = type;
          bestTypeSampleSize = impacts.length;
        }
      }
    }

    if (bestTypeImpact === -Infinity) {
      return null;
    }

    return {
      category: 'content',
      title: `${bestType} content drives +${bestTypeImpact.toFixed(1)}% token price`,
      description: `${bestType} videos show the strongest impact on token price (+${bestTypeImpact.toFixed(1)}% average). Focus on this content type for maximum token price impact.`,
      metricValue: bestTypeImpact,
      metricUnit: 'percent',
      confidenceScore: Math.min(100, bestTypeSampleSize * 25),
      sampleSize: bestTypeSampleSize,
    };
  } catch (error) {
    console.error('Error analyzing best content type:', error);
    return null;
  }
}

/**
 * Analyze view count correlation with price impact
 */
export async function analyzeViewsImpactCorrelation(
  userId: string,
  tokenMint?: string,
  tokenAddress?: string
): Promise<CorrelationResult | null> {
  try {
    // Get all content with views and token associations
    const content = await db.contentPerformance.findMany({
      where: {
        userId,
        views: { not: null },
        ...(tokenMint
          ? { relatedTokenMint: tokenMint }
          : tokenAddress
          ? { relatedTokenAddress: tokenAddress }
          : {
              OR: [
                { relatedTokenMint: { not: null } },
                { relatedTokenAddress: { not: null } },
              ],
            }),
      },
      select: {
        id: true,
        views: true,
      },
    });

    if (content.length < 5) {
      return null; // Need at least 5 data points for meaningful correlation
    }

    // Calculate correlation between views and price impact
    const dataPoints: Array<{ views: number; impact: number }> = [];

    for (const item of content) {
      const impact = await calculateContentPriceImpact(item.id);
      if (impact && impact.impact24h !== undefined && item.views) {
        dataPoints.push({
          views: item.views,
          impact: impact.impact24h,
        });
      }
    }

    if (dataPoints.length < 5) {
      return null;
    }

    // Calculate Pearson correlation coefficient
    const correlation = calculatePearsonCorrelation(
      dataPoints.map((d) => d.views),
      dataPoints.map((d) => d.impact)
    );

    if (Math.abs(correlation) < 0.3) {
      return null; // Weak correlation, not meaningful
    }

    return {
      category: 'performance',
      title: `${correlation > 0 ? 'Higher' : 'Lower'} views correlate with ${correlation > 0 ? 'better' : 'worse'} token performance`,
      description: `There's a ${Math.abs(correlation) > 0.7 ? 'strong' : 'moderate'} correlation (${(correlation * 100).toFixed(0)}%) between video views and token price impact. ${correlation > 0 ? 'More views typically lead to higher token prices.' : 'This suggests views alone may not drive token performance.'}`,
      metricValue: correlation * 100,
      metricUnit: 'correlation',
      confidenceScore: Math.min(100, dataPoints.length * 10),
      sampleSize: dataPoints.length,
    };
  } catch (error) {
    console.error('Error analyzing views-impact correlation:', error);
    return null;
  }
}

/**
 * Calculate all correlations for a user
 */
export async function calculateAllCorrelations(
  userId: string,
  tokenMint?: string,
  tokenAddress?: string
): Promise<CorrelationResult[]> {
  const results: CorrelationResult[] = [];

  try {
    const [avgImpact, bestTime, bestType, viewsCorrelation] = await Promise.all([
      calculateAverageContentImpact(userId, tokenMint, tokenAddress),
      analyzeBestPostingTimes(userId, tokenMint, tokenAddress),
      analyzeBestContentType(userId, tokenMint, tokenAddress),
      analyzeViewsImpactCorrelation(userId, tokenMint, tokenAddress),
    ]);

    if (avgImpact) results.push(avgImpact);
    if (bestTime) results.push(bestTime);
    if (bestType) results.push(bestType);
    if (viewsCorrelation) results.push(viewsCorrelation);

    return results;
  } catch (error) {
    console.error('Error calculating all correlations:', error);
    return [];
  }
}

// Helper functions

function calculateStandardDeviation(values: number[]): number {
  const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map((val) => Math.pow(val - avg, 2));
  const avgSquaredDiff = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  return Math.sqrt(avgSquaredDiff);
}

function calculatePearsonCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  const sumX = x.reduce((sum, val) => sum + val, 0);
  const sumY = y.reduce((sum, val) => sum + val, 0);
  const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
  const sumX2 = x.reduce((sum, val) => sum + val * val, 0);
  const sumY2 = y.reduce((sum, val) => sum + val * val, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  if (denominator === 0) return 0;

  return numerator / denominator;
}
