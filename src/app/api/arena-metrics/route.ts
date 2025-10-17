import { NextRequest, NextResponse } from 'next/server';
import { fetchArenaMetrics, calculateArenaInsights } from '@/lib/arena-api';

export const runtime = 'nodejs';

/**
 * Arena Metrics API
 *
 * STEALTH MODE: This endpoint exists but is only accessible to admins.
 * Collects Arena data in background for future public launch.
 */

export async function GET(request: NextRequest) {
  try {
    // Fetch Arena metrics
    const metrics = await fetchArenaMetrics();

    // Calculate insights
    const insights = calculateArenaInsights(metrics);

    return NextResponse.json({
      success: true,
      ...metrics,
      insights,
      stealth: true, // Indicator that this is in stealth mode
      publicLaunch: false,
    });
  } catch (error) {
    console.error('Arena metrics error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch Arena metrics',
      },
      { status: 500 }
    );
  }
}
