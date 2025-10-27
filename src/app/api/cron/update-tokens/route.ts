import { NextRequest, NextResponse } from 'next/server';
import { tokenIngestionService } from '@/lib/services/token-ingestion';
import { socialMetricsService } from '@/lib/services/social-metrics';

/**
 * Cron job endpoint to update token metrics
 *
 * This endpoint should be called by Vercel Cron every 5-15 minutes
 * to keep token data fresh and detect rug signals early.
 *
 * GET /api/cron/update-tokens
 *
 * Vercel Cron configuration (vercel.json):
 * {
 *   "crons": [{
 *     "path": "/api/cron/update-tokens",
 *     "schedule": "every 10 minutes"
 *   }]
 * }
 *
 * Authorization: Vercel Cron sends Authorization header with CRON_SECRET
 */
export async function GET(request: NextRequest) {
  try {
    // Verify this is a legitimate cron request
    const authHeader = request.headers.get('authorization');

    // In production, verify the cron secret
    // For development, allow requests without auth
    if (process.env.NODE_ENV === 'production') {
      if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    console.log('[Cron] Starting token update job...');
    const startTime = Date.now();

    // Update existing tokens (limit to 50 per run to respect rate limits)
    const updateResults = await tokenIngestionService.updateAllTokens(50);

    // Clean up old token snapshots (keep only last 7 days)
    const cleanupCount = await tokenIngestionService.cleanupOldSnapshots();

    // Sync social metrics (runs less frequently - every 10th run = ~100 minutes)
    let socialSyncResults = { synced: 0, cleaned: 0 };
    const runNumber = Math.floor(Date.now() / (10 * 60 * 1000)) % 10;
    if (runNumber === 0) {
      console.log('[Cron] Running social metrics sync...');
      const syncedCount = await socialMetricsService.syncAllTokens();
      const cleanedSocialCount = await socialMetricsService.cleanupOldSnapshots();
      socialSyncResults = { synced: syncedCount, cleaned: cleanedSocialCount };
      console.log(`[Cron] Social metrics: synced ${syncedCount}, cleaned ${cleanedSocialCount} snapshots`);
    }

    // Get stats for logging
    const stats = await tokenIngestionService.getStats();

    const duration = Date.now() - startTime;

    console.log(`[Cron] ✅ Job complete in ${duration}ms`);
    console.log(`[Cron] Updated: ${updateResults.updated}, Failed: ${updateResults.failed}`);
    console.log(`[Cron] Cleaned up ${cleanupCount} old snapshots`);

    return NextResponse.json({
      success: true,
      duration,
      results: {
        updated: updateResults.updated,
        failed: updateResults.failed,
        total: updateResults.total,
        cleanedSnapshots: cleanupCount,
      },
      socialMetrics: socialSyncResults,
      stats: {
        totalTokens: stats.totalTokens,
        tokensUpdatedLast24h: stats.tokensLast24h,
        totalSnapshots: stats.totalSnapshots,
        avgSnapshotsPerToken: Math.round(stats.avgSnapshotsPerToken * 10) / 10,
      },
    });
  } catch (error) {
    console.error('[Cron] Error in update job:', error);
    return NextResponse.json(
      {
        error: 'Update job failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Allow manual triggering via POST (for testing)
 */
export async function POST(request: NextRequest) {
  // For manual triggers, require a simple auth token
  const authHeader = request.headers.get('authorization');

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Reuse the GET handler
  return GET(request);
}
