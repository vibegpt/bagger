import { db } from '@/lib/db';

interface StreamImpactMetrics {
  streamId: string;
  title?: string;
  startedAt: Date;
  endedAt?: Date;
  durationMinutes?: number;

  // Token performance during stream
  priceChange: number; // % change from pre_stream to last during_stream
  priceChangeAbsolute: number; // Absolute price change
  volumeChange: number; // % change in 24h volume
  holderChange: number; // Change in holder count
  transactionIncrease: number; // Estimated transaction count increase

  // Market cap impact
  marketCapChange: number; // % change
  marketCapChangeAbsolute: number; // Dollar change

  // Peak metrics
  peakPrice?: number;
  peakMarketCap?: number;

  // Comparison to previous streams
  comparisonToPrevious?: {
    priceImprovementPercent: number; // % better or worse than last stream
    volumeImprovementPercent: number;
    description: string;
  };

  // Post-stream performance
  postStream1h?: {
    priceChange: number;
    volumeChange: number;
  };

  postStream24h?: {
    priceChange: number;
    volumeChange: number;
  };

  // Confidence score (based on number of snapshots and data quality)
  confidenceScore: number;
}

/**
 * Analyze a stream session's impact on token performance
 */
export async function analyzeStreamImpact(
  streamSessionId: string
): Promise<StreamImpactMetrics | null> {
  try {
    // Get stream session with all snapshots
    const session = await db.streamSession.findUnique({
      where: { id: streamSessionId },
      include: {
        tokenSnapshots: {
          orderBy: {
            snapshotTime: 'asc',
          },
        },
      },
    });

    if (!session) {
      return null;
    }

    const snapshots = session.tokenSnapshots;

    if (snapshots.length < 2) {
      // Need at least pre_stream and one during_stream snapshot
      return null;
    }

    // Find key snapshots
    const preStream = snapshots.find((s) => s.snapshotType === 'pre_stream');
    const duringStreamSnapshots = snapshots.filter((s) => s.snapshotType === 'during_stream');
    const postStream1h = snapshots.find((s) => s.snapshotType === 'post_stream_1h');
    const postStream24h = snapshots.find((s) => s.snapshotType === 'post_stream_24h');

    if (!preStream || duringStreamSnapshots.length === 0) {
      return null;
    }

    // Use last during_stream snapshot as end of stream
    const endOfStream = duringStreamSnapshots[duringStreamSnapshots.length - 1];

    // Calculate price change during stream
    const priceStart = parseFloat(preStream.price.toString());
    const priceEnd = parseFloat(endOfStream.price.toString());
    const priceChange = ((priceEnd - priceStart) / priceStart) * 100;
    const priceChangeAbsolute = priceEnd - priceStart;

    // Calculate market cap change
    const marketCapStart = parseFloat(preStream.marketCap.toString());
    const marketCapEnd = parseFloat(endOfStream.marketCap.toString());
    const marketCapChange = ((marketCapEnd - marketCapStart) / marketCapStart) * 100;
    const marketCapChangeAbsolute = marketCapEnd - marketCapStart;

    // Calculate volume change
    const volumeStart = parseFloat(preStream.volume24h.toString());
    const volumeEnd = parseFloat(endOfStream.volume24h.toString());
    const volumeChange = volumeStart > 0 ? ((volumeEnd - volumeStart) / volumeStart) * 100 : 0;

    // Calculate holder change
    const holderChange = (endOfStream.holderCount || 0) - (preStream.holderCount || 0);

    // Estimate transaction increase (if we captured it)
    const transactionIncrease = 0; // We'll leave this at 0 for now, can be enhanced

    // Find peak metrics
    let peakPrice = priceEnd;
    let peakMarketCap = marketCapEnd;
    for (const snapshot of duringStreamSnapshots) {
      const price = parseFloat(snapshot.price.toString());
      const marketCap = parseFloat(snapshot.marketCap.toString());
      if (price > peakPrice) peakPrice = price;
      if (marketCap > peakMarketCap) peakMarketCap = marketCap;
    }

    // Calculate post-stream metrics
    let postStream1hMetrics;
    if (postStream1h) {
      const price1h = parseFloat(postStream1h.price.toString());
      const volume1h = parseFloat(postStream1h.volume24h.toString());
      postStream1hMetrics = {
        priceChange: ((price1h - priceEnd) / priceEnd) * 100,
        volumeChange: volumeEnd > 0 ? ((volume1h - volumeEnd) / volumeEnd) * 100 : 0,
      };
    }

    let postStream24hMetrics;
    if (postStream24h) {
      const price24h = parseFloat(postStream24h.price.toString());
      const volume24h = parseFloat(postStream24h.volume24h.toString());
      postStream24hMetrics = {
        priceChange: ((price24h - priceEnd) / priceEnd) * 100,
        volumeChange: volumeEnd > 0 ? ((volume24h - volumeEnd) / volumeEnd) * 100 : 0,
      };
    }

    // Calculate confidence score based on snapshot count and data quality
    const snapshotScore = Math.min(100, (snapshots.length / 5) * 100);
    const dataQualityScore = preStream.holderCount ? 100 : 50; // Lower if missing holder data
    const confidenceScore = (snapshotScore + dataQualityScore) / 2;

    // Compare to previous stream
    const comparisonToPrevious = await compareToPreviousStream(session.userId, streamSessionId);

    return {
      streamId: streamSessionId,
      title: session.title || undefined,
      startedAt: session.startedAt,
      endedAt: session.endedAt || undefined,
      durationMinutes: session.durationMinutes || undefined,
      priceChange,
      priceChangeAbsolute,
      volumeChange,
      holderChange,
      transactionIncrease,
      marketCapChange,
      marketCapChangeAbsolute,
      peakPrice,
      peakMarketCap,
      comparisonToPrevious,
      postStream1h: postStream1hMetrics,
      postStream24h: postStream24hMetrics,
      confidenceScore: Math.round(confidenceScore),
    };
  } catch (error) {
    console.error('Error analyzing stream impact:', error);
    return null;
  }
}

/**
 * Compare stream performance to previous stream
 */
async function compareToPreviousStream(
  userId: string,
  currentStreamId: string
): Promise<
  | {
      priceImprovementPercent: number;
      volumeImprovementPercent: number;
      description: string;
    }
  | undefined
> {
  try {
    // Get current stream
    const currentStream = await db.streamSession.findUnique({
      where: { id: currentStreamId },
    });

    if (!currentStream) {
      return undefined;
    }

    // Find previous completed stream for same user and token
    const previousStream = await db.streamSession.findFirst({
      where: {
        userId,
        endedAt: { not: null },
        id: { not: currentStreamId },
        startedAt: { lt: currentStream.startedAt },
        ...(currentStream.relatedTokenMint
          ? { relatedTokenMint: currentStream.relatedTokenMint }
          : { relatedTokenAddress: currentStream.relatedTokenAddress }),
      },
      orderBy: {
        startedAt: 'desc',
      },
      include: {
        tokenSnapshots: true,
      },
    });

    if (!previousStream) {
      return undefined;
    }

    // Analyze previous stream
    const previousImpact = await analyzeStreamImpact(previousStream.id);
    const currentImpact = await analyzeStreamImpact(currentStreamId);

    if (!previousImpact || !currentImpact) {
      return undefined;
    }

    // Calculate improvements
    const priceImprovementPercent = currentImpact.priceChange - previousImpact.priceChange;
    const volumeImprovementPercent = currentImpact.volumeChange - previousImpact.volumeChange;

    // Generate description
    let description = '';
    if (priceImprovementPercent > 0) {
      description = `${priceImprovementPercent.toFixed(1)}% better price impact than your previous stream`;
    } else if (priceImprovementPercent < 0) {
      description = `${Math.abs(priceImprovementPercent).toFixed(1)}% lower price impact than your previous stream`;
    } else {
      description = 'Similar price impact to your previous stream';
    }

    return {
      priceImprovementPercent,
      volumeImprovementPercent,
      description,
    };
  } catch (error) {
    console.error('Error comparing to previous stream:', error);
    return undefined;
  }
}

/**
 * Get recent streams with their impact metrics
 */
export async function getRecentStreamsWithImpact(
  userId: string,
  limit: number = 10
): Promise<StreamImpactMetrics[]> {
  try {
    // Get recent completed streams
    const streams = await db.streamSession.findMany({
      where: {
        userId,
        endedAt: { not: null },
      },
      orderBy: {
        startedAt: 'desc',
      },
      take: limit,
    });

    // Analyze each stream
    const impactMetrics: StreamImpactMetrics[] = [];
    for (const stream of streams) {
      const impact = await analyzeStreamImpact(stream.id);
      if (impact) {
        impactMetrics.push(impact);
      }
    }

    return impactMetrics;
  } catch (error) {
    console.error('Error getting recent streams with impact:', error);
    return [];
  }
}

/**
 * Calculate average stream impact for a user
 */
export async function calculateAverageStreamImpact(
  userId: string
): Promise<{
  avgPriceChange: number;
  avgVolumeChange: number;
  avgHolderChange: number;
  totalStreams: number;
} | null> {
  try {
    const streams = await getRecentStreamsWithImpact(userId, 20);

    if (streams.length === 0) {
      return null;
    }

    const totalPriceChange = streams.reduce((sum, s) => sum + s.priceChange, 0);
    const totalVolumeChange = streams.reduce((sum, s) => sum + s.volumeChange, 0);
    const totalHolderChange = streams.reduce((sum, s) => sum + s.holderChange, 0);

    return {
      avgPriceChange: totalPriceChange / streams.length,
      avgVolumeChange: totalVolumeChange / streams.length,
      avgHolderChange: totalHolderChange / streams.length,
      totalStreams: streams.length,
    };
  } catch (error) {
    console.error('Error calculating average stream impact:', error);
    return null;
  }
}

/**
 * Find best performing stream
 */
export async function getBestPerformingStream(
  userId: string
): Promise<StreamImpactMetrics | null> {
  try {
    const streams = await getRecentStreamsWithImpact(userId, 20);

    if (streams.length === 0) {
      return null;
    }

    // Sort by price change (highest first)
    streams.sort((a, b) => b.priceChange - a.priceChange);

    return streams[0];
  } catch (error) {
    console.error('Error getting best performing stream:', error);
    return null;
  }
}
