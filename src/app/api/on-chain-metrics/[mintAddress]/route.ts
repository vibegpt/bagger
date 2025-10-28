import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

/**
 * GET /api/on-chain-metrics/[mintAddress]
 * Returns on-chain community metrics for a token
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ mintAddress: string }> }
) {
  try {
    const { mintAddress } = await params;

    console.log(`[OnChain] Fetching on-chain metrics for ${mintAddress}`);

    // Get token snapshots from last 24 hours to calculate growth
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const snapshots = await prisma.tokenSnapshot.findMany({
      where: {
        mintAddress,
        timestamp: {
          gte: oneDayAgo,
        },
      },
      orderBy: {
        timestamp: 'asc',
      },
    });

    if (snapshots.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No on-chain data available',
          message: 'Token has not been tracked long enough for metrics',
        },
        { status: 404 }
      );
    }

    // Calculate holder growth
    const oldestSnapshot = snapshots[0];
    const newestSnapshot = snapshots[snapshots.length - 1];

    const holderGrowth24h = oldestSnapshot.holderCount && newestSnapshot.holderCount
      ? ((newestSnapshot.holderCount - oldestSnapshot.holderCount) / oldestSnapshot.holderCount) * 100
      : 0;

    // Calculate average trades per hour
    // Count snapshots as proxy for activity (each snapshot = market update)
    const hoursCovered = (newestSnapshot.timestamp.getTime() - oldestSnapshot.timestamp.getTime()) / (1000 * 60 * 60);
    const tradesPerHour = hoursCovered > 0 ? Math.round(snapshots.length / hoursCovered) : 0;

    // Calculate volume trend (comparing first half to second half of 24h)
    const midpoint = Math.floor(snapshots.length / 2);
    const firstHalfVolume = snapshots.slice(0, midpoint).reduce((sum, s) => sum + (s.volume24h || 0), 0) / midpoint;
    const secondHalfVolume = snapshots.slice(midpoint).reduce((sum, s) => sum + (s.volume24h || 0), 0) / (snapshots.length - midpoint);

    const volumeTrend = firstHalfVolume > 0
      ? ((secondHalfVolume - firstHalfVolume) / firstHalfVolume) * 100
      : 0;

    const metrics = {
      // Current state
      currentHolders: newestSnapshot.holderCount || 0,
      currentPrice: newestSnapshot.price || 0,
      currentMarketCap: newestSnapshot.marketCap || 0,

      // Growth metrics
      holderGrowth24h: Number(holderGrowth24h.toFixed(2)),
      holderChange24h: (newestSnapshot.holderCount || 0) - (oldestSnapshot.holderCount || 0),

      // Activity metrics
      estimatedTradesPerHour: tradesPerHour,
      snapshotCount24h: snapshots.length,

      // Volume trend
      volumeTrend24h: Number(volumeTrend.toFixed(2)),

      // Time range
      dataFrom: oldestSnapshot.timestamp,
      dataTo: newestSnapshot.timestamp,
      hoursCovered: Number(hoursCovered.toFixed(1)),
    };

    return NextResponse.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    console.error('[OnChain] Error fetching on-chain metrics:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch on-chain metrics',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
