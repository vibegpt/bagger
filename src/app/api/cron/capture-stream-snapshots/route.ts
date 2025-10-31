import { NextRequest, NextResponse } from 'next/server';
import {
  getActiveStreams,
  captureDuringStreamSnapshots,
  getStreamsNeedingPostSnapshots,
  captureStreamSnapshot,
} from '@/lib/services/stream-tracking';

/**
 * Stream Snapshot Capture Cron Job
 * Captures token performance snapshots during active streams
 * and after streams end (1h, 24h post-stream)
 *
 * GET /api/cron/capture-stream-snapshots
 * Requires: CRON_SECRET in headers for authentication
 * Runs: Every 10 minutes (configured in vercel.json)
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

    console.log('Starting stream snapshot capture cron job...');

    const results = {
      activeStreamsProcessed: 0,
      activeStreamSnapshots: 0,
      postStreamSnapshots: 0,
      errors: [] as string[],
    };

    // 1. Capture snapshots for active (ongoing) streams
    const activeStreams = await getActiveStreams();
    console.log(`Found ${activeStreams.length} active streams`);

    for (const stream of activeStreams) {
      try {
        await captureDuringStreamSnapshots(
          stream.id,
          stream.relatedTokenMint,
          stream.relatedTokenAddress
        );

        results.activeStreamsProcessed++;
        results.activeStreamSnapshots++;
        console.log(`Captured during-stream snapshot for ${stream.id}`);
      } catch (error) {
        console.error(`Error processing active stream ${stream.id}:`, error);
        results.errors.push(
          `Stream ${stream.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    // 2. Capture post-stream snapshots (1h, 24h after stream ended)
    const streamsNeedingPost = await getStreamsNeedingPostSnapshots();
    console.log(`Found ${streamsNeedingPost.length} streams needing post-snapshots`);

    for (const stream of streamsNeedingPost) {
      try {
        if (!stream.endedAt) continue;

        const now = new Date();
        const timeSinceEnd = now.getTime() - stream.endedAt.getTime();

        // Check if we have existing snapshots
        const existingTypes = new Set(stream.tokenSnapshots.map((s: any) => s.snapshotType));

        // Capture 1h post-stream snapshot (if 1 hour has passed)
        const oneHour = 60 * 60 * 1000;
        if (timeSinceEnd >= oneHour && !existingTypes.has('post_stream_1h')) {
          await captureStreamSnapshot(
            stream.id,
            'post_stream_1h',
            stream.relatedTokenMint,
            stream.relatedTokenAddress
          );
          results.postStreamSnapshots++;
          console.log(`Captured 1h post-stream snapshot for ${stream.id}`);
        }

        // Capture 24h post-stream snapshot (if 24 hours have passed)
        const twentyFourHours = 24 * 60 * 60 * 1000;
        if (timeSinceEnd >= twentyFourHours && !existingTypes.has('post_stream_24h')) {
          await captureStreamSnapshot(
            stream.id,
            'post_stream_24h',
            stream.relatedTokenMint,
            stream.relatedTokenAddress
          );
          results.postStreamSnapshots++;
          console.log(`Captured 24h post-stream snapshot for ${stream.id}`);
        }
      } catch (error) {
        console.error(`Error processing post-stream snapshots for ${stream.id}:`, error);
        results.errors.push(
          `Stream ${stream.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    console.log('Stream snapshot cron job complete:', results);

    return NextResponse.json({
      success: true,
      message: `Processed ${results.activeStreamsProcessed} active streams, captured ${results.postStreamSnapshots} post-stream snapshots`,
      ...results,
    });
  } catch (error) {
    console.error('Stream snapshot cron job error:', error);
    return NextResponse.json(
      {
        error: 'Cron job failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
