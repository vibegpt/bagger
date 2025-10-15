import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

interface CorrelationMetrics {
  streamId: string;
  streamTitle: string;
  streamPlatform: string;
  startedAt: string;
  endedAt: string | null;
  durationMinutes: number | null;
  peakViewers: number | null;
  averageViewers: number | null;
  totalViews: number | null;
  relatedTokenMint: string | null;
  relatedTokenAddress: string | null;

  // Token performance metrics
  tokenSnapshots: {
    beforeStream?: {
      price: number;
      marketCap: number;
      volume24h: number;
      holderCount: number;
    };
    duringStream?: {
      price: number;
      marketCap: number;
      volume24h: number;
      holderCount: number;
    };
    afterStream?: {
      price: number;
      marketCap: number;
      volume24h: number;
      holderCount: number;
    };
  };

  // Performance changes
  impact: {
    priceChangePercent: number | null;
    volumeChangePercent: number | null;
    holderChangePercent: number | null;
    marketCapChangePercent: number | null;
  };
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all streams with token snapshots
    const streams = await db.streamSession.findMany({
      where: {
        userId,
        OR: [
          { relatedTokenMint: { not: null } },
          { relatedTokenAddress: { not: null } }
        ]
      },
      include: {
        tokenSnapshots: {
          orderBy: {
            snapshotTime: 'asc'
          }
        }
      },
      orderBy: {
        startedAt: 'desc'
      }
    });

    // Calculate correlation metrics for each stream
    const correlations: CorrelationMetrics[] = streams.map(stream => {
      const snapshots = stream.tokenSnapshots;

      // Find snapshots before, during, and after stream
      const beforeSnapshot = snapshots.find(s => s.snapshotType === 'before_stream');
      const duringSnapshot = snapshots.find(s => s.snapshotType === 'during_stream');
      const afterSnapshot = snapshots.find(s => s.snapshotType === 'after_stream');

      // Calculate performance changes
      let priceChangePercent = null;
      let volumeChangePercent = null;
      let holderChangePercent = null;
      let marketCapChangePercent = null;

      if (beforeSnapshot && afterSnapshot) {
        const beforePrice = parseFloat(beforeSnapshot.price);
        const afterPrice = parseFloat(afterSnapshot.price);
        priceChangePercent = ((afterPrice - beforePrice) / beforePrice) * 100;

        const beforeVolume = parseFloat(beforeSnapshot.volume24h);
        const afterVolume = parseFloat(afterSnapshot.volume24h);
        if (beforeVolume > 0) {
          volumeChangePercent = ((afterVolume - beforeVolume) / beforeVolume) * 100;
        }

        const beforeHolders = beforeSnapshot.holderCount || 0;
        const afterHolders = afterSnapshot.holderCount || 0;
        if (beforeHolders > 0) {
          holderChangePercent = ((afterHolders - beforeHolders) / beforeHolders) * 100;
        }

        const beforeMC = parseFloat(beforeSnapshot.marketCap);
        const afterMC = parseFloat(afterSnapshot.marketCap);
        if (beforeMC > 0) {
          marketCapChangePercent = ((afterMC - beforeMC) / beforeMC) * 100;
        }
      }

      return {
        streamId: stream.id,
        streamTitle: stream.title || 'Untitled Stream',
        streamPlatform: stream.platform,
        startedAt: stream.startedAt.toISOString(),
        endedAt: stream.endedAt?.toISOString() || null,
        durationMinutes: stream.durationMinutes,
        peakViewers: stream.peakViewers,
        averageViewers: stream.averageViewers,
        totalViews: stream.totalViews,
        relatedTokenMint: stream.relatedTokenMint,
        relatedTokenAddress: stream.relatedTokenAddress,
        tokenSnapshots: {
          beforeStream: beforeSnapshot ? {
            price: parseFloat(beforeSnapshot.price),
            marketCap: parseFloat(beforeSnapshot.marketCap),
            volume24h: parseFloat(beforeSnapshot.volume24h),
            holderCount: beforeSnapshot.holderCount || 0,
          } : undefined,
          duringStream: duringSnapshot ? {
            price: parseFloat(duringSnapshot.price),
            marketCap: parseFloat(duringSnapshot.marketCap),
            volume24h: parseFloat(duringSnapshot.volume24h),
            holderCount: duringSnapshot.holderCount || 0,
          } : undefined,
          afterStream: afterSnapshot ? {
            price: parseFloat(afterSnapshot.price),
            marketCap: parseFloat(afterSnapshot.marketCap),
            volume24h: parseFloat(afterSnapshot.volume24h),
            holderCount: afterSnapshot.holderCount || 0,
          } : undefined,
        },
        impact: {
          priceChangePercent,
          volumeChangePercent,
          holderChangePercent,
          marketCapChangePercent,
        }
      };
    });

    // Calculate aggregate statistics
    const validCorrelations = correlations.filter(c =>
      c.impact.priceChangePercent !== null
    );

    const aggregateStats = {
      totalStreams: correlations.length,
      streamsWithData: validCorrelations.length,
      averagePriceChange: validCorrelations.length > 0
        ? validCorrelations.reduce((sum, c) => sum + (c.impact.priceChangePercent || 0), 0) / validCorrelations.length
        : 0,
      averageVolumeChange: validCorrelations.length > 0
        ? validCorrelations.reduce((sum, c) => sum + (c.impact.volumeChangePercent || 0), 0) / validCorrelations.length
        : 0,
      averageHolderChange: validCorrelations.length > 0
        ? validCorrelations.reduce((sum, c) => sum + (c.impact.holderChangePercent || 0), 0) / validCorrelations.length
        : 0,
      positiveStreams: validCorrelations.filter(c => (c.impact.priceChangePercent || 0) > 0).length,
      negativeStreams: validCorrelations.filter(c => (c.impact.priceChangePercent || 0) < 0).length,
      bestPerformingStream: validCorrelations.length > 0
        ? validCorrelations.reduce((best, current) =>
            (current.impact.priceChangePercent || 0) > (best.impact.priceChangePercent || 0) ? current : best
          )
        : null,
      worstPerformingStream: validCorrelations.length > 0
        ? validCorrelations.reduce((worst, current) =>
            (current.impact.priceChangePercent || 0) < (worst.impact.priceChangePercent || 0) ? current : worst
          )
        : null,
    };

    return NextResponse.json({
      success: true,
      data: {
        correlations,
        aggregateStats
      }
    });

  } catch (error) {
    console.error('Error fetching stream correlations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch correlations' },
      { status: 500 }
    );
  }
}
