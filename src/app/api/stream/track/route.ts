import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { startStreamSession, endStreamSession } from '@/lib/services/stream-tracking';
import { analyzeStreamImpact, getRecentStreamsWithImpact } from '@/lib/services/stream-analytics';

/**
 * Start Stream Tracking
 * Begins tracking a live stream session and captures initial token snapshot
 *
 * POST /api/stream/track
 * Body: {
 *   action: "start",
 *   title: "My Epic Stream",
 *   platform: "youtube",
 *   platformUrl: "https://youtube.com/watch?v=...",
 *   tokenMint?: "xxx",
 *   tokenAddress?: "0xxx"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Get current user from Clerk
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find user in database
    const user = await db.user.findUnique({
      where: { clerkId: clerkUser.id },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Parse request body
    const body = await request.json();
    const { action, streamId, title, platform, platformUrl, tokenMint, tokenAddress } = body;

    if (action === 'start') {
      // Start new stream session
      if (!platform) {
        return NextResponse.json({ error: 'Platform is required' }, { status: 400 });
      }

      if (!tokenMint && !tokenAddress) {
        return NextResponse.json(
          { error: 'Either tokenMint or tokenAddress is required' },
          { status: 400 }
        );
      }

      const streamSessionId = await startStreamSession(user.id, {
        title,
        platform,
        platformUrl,
        tokenMint,
        tokenAddress,
      });

      return NextResponse.json({
        success: true,
        message: 'Stream tracking started',
        streamId: streamSessionId,
      });
    } else if (action === 'end') {
      // End existing stream session
      if (!streamId) {
        return NextResponse.json({ error: 'Stream ID is required' }, { status: 400 });
      }

      // Verify stream belongs to user
      const stream = await db.streamSession.findUnique({
        where: { id: streamId },
      });

      if (!stream) {
        return NextResponse.json({ error: 'Stream not found' }, { status: 404 });
      }

      if (stream.userId !== user.id) {
        return NextResponse.json(
          { error: 'Unauthorized access to stream' },
          { status: 403 }
        );
      }

      await endStreamSession(streamId);

      // Analyze the stream impact
      const impact = await analyzeStreamImpact(streamId);

      return NextResponse.json({
        success: true,
        message: 'Stream tracking ended',
        streamId,
        impact,
      });
    } else {
      return NextResponse.json({ error: 'Invalid action. Use "start" or "end"' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error tracking stream:', error);
    return NextResponse.json(
      {
        error: 'Failed to track stream',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Get Stream Analytics
 * Retrieves stream impact metrics for recent streams
 *
 * GET /api/stream/track?limit=10
 */
export async function GET(request: NextRequest) {
  try {
    // Get current user from Clerk
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find user in database
    const user = await db.user.findUnique({
      where: { clerkId: clerkUser.id },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get recent streams with impact metrics
    const streams = await getRecentStreamsWithImpact(user.id, limit);

    return NextResponse.json({
      success: true,
      streams,
      count: streams.length,
    });
  } catch (error) {
    console.error('Error fetching stream analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stream analytics' },
      { status: 500 }
    );
  }
}
