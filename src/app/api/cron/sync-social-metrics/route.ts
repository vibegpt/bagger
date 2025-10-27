import { NextRequest, NextResponse } from 'next/server';
import { socialMetricsService } from '@/lib/services/social-metrics';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes

/**
 * POST /api/cron/sync-social-metrics
 * Syncs social metrics (Twitter, Reddit, Telegram followers) from CoinGecko
 *
 * Should run daily via Vercel Cron
 *
 * Vercel cron config (vercel.json):
 * {
 *   "crons": [{
 *     "path": "/api/cron/sync-social-metrics",
 *     "schedule": "0 2 * * *"
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (Vercel Cron sends this header)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.warn('[Cron] Unauthorized sync-social-metrics request');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[Cron] Starting social metrics sync...');
    const startTime = Date.now();

    // Sync all tokens
    const syncedCount = await socialMetricsService.syncAllTokens();

    // Cleanup old snapshots (keep last 90 days)
    const deletedCount = await socialMetricsService.cleanupOldSnapshots();

    const duration = Date.now() - startTime;

    console.log(`[Cron] Social metrics sync complete in ${duration}ms`);
    console.log(`[Cron] Synced: ${syncedCount} tokens, Deleted: ${deletedCount} old snapshots`);

    return NextResponse.json({
      success: true,
      syncedTokens: syncedCount,
      deletedSnapshots: deletedCount,
      durationMs: duration,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Cron] Social metrics sync error:', error);
    return NextResponse.json(
      {
        error: 'Social metrics sync failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Also allow POST for manual triggers
export async function POST(request: NextRequest) {
  return GET(request);
}
