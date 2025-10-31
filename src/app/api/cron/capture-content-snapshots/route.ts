import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { capturePostPublicationSnapshots } from '@/lib/services/content-token-snapshot';

/**
 * Content Token Snapshot Cron Job
 * Captures token performance snapshots at various intervals after content publication
 * (1h, 6h, 24h, 7d after video/post goes live)
 *
 * GET /api/cron/capture-content-snapshots
 * Requires: CRON_SECRET in headers for authentication
 * Runs: Every hour (configured in vercel.json)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error('CRON_SECRET not configured');
      return NextResponse.json(
        { error: 'Cron job not configured' },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error('Invalid cron secret');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Starting content token snapshot cron job...');

    // Find all content with token associations that was published recently
    // We look back 8 days to catch the 7d snapshots (with a 1-day buffer)
    const eightDaysAgo = new Date();
    eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);

    const recentContent = await db.contentPerformance.findMany({
      where: {
        publishedAt: {
          gte: eightDaysAgo,
        },
        OR: [
          { relatedTokenMint: { not: null } },
          { relatedTokenAddress: { not: null } },
        ],
      },
      select: {
        id: true,
        publishedAt: true,
        relatedTokenMint: true,
        relatedTokenAddress: true,
        title: true,
      },
    });

    console.log(`Found ${recentContent.length} pieces of content to check for snapshots`);

    const results = {
      totalContent: recentContent.length,
      snapshotsCaptured: 0,
      errors: [] as string[],
    };

    // Process each piece of content
    for (const content of recentContent) {
      try {
        console.log(`Processing content: ${content.title || content.id}`);

        // Capture post-publication snapshots (1h, 6h, 24h, 7d)
        // The function will check if it's time to capture each snapshot
        await capturePostPublicationSnapshots(
          content.id,
          content.publishedAt,
          content.relatedTokenMint,
          content.relatedTokenAddress
        );

        results.snapshotsCaptured++;
      } catch (error) {
        console.error(`Error processing content ${content.id}:`, error);
        results.errors.push(
          `Content ${content.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    console.log('Content snapshot cron job complete:', results);

    return NextResponse.json({
      success: true,
      message: `Processed ${results.snapshotsCaptured}/${results.totalContent} content items`,
      ...results,
    });
  } catch (error) {
    console.error('Content snapshot cron job error:', error);
    return NextResponse.json(
      {
        error: 'Cron job failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
