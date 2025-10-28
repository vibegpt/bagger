import { NextRequest, NextResponse } from 'next/server';
import { socialMetricsService } from '@/lib/services/social-metrics';

export const runtime = 'nodejs';

/**
 * GET /api/social-metrics/[mintAddress]
 * Returns social metrics for a specific token
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ mintAddress: string }> }
) {
  try {
    const { mintAddress } = await params;

    console.log(`[API] Fetching social metrics for ${mintAddress}`);

    // Get current metrics
    const metrics = await socialMetricsService.getSocialMetrics(mintAddress);

    if (!metrics) {
      return NextResponse.json(
        {
          success: false,
          error: 'Social metrics not found',
          message: 'This token has not been synced yet or is not available on CoinGecko',
        },
        { status: 404 }
      );
    }

    // Get 30-day growth trend
    const trend = await socialMetricsService.getGrowthTrend(mintAddress, 30);

    return NextResponse.json({
      success: true,
      data: {
        current: metrics,
        trend,
      },
    });
  } catch (error) {
    console.error('[API] Social metrics error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch social metrics',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
