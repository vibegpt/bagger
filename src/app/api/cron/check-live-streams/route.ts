import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { decrypt } from '@/lib/encryption';
import twitchService from '@/lib/services/twitch';
import { startStreamSession, endStreamSession } from '@/lib/services/stream-tracking';

/**
 * Cron Job: Check Live Streams
 * Periodically checks if users with Twitch connections are currently live
 * and automatically starts/stops stream tracking sessions
 *
 * GET /api/cron/check-live-streams
 * Should be called every 5 minutes via cron (e.g., Vercel Cron)
 *
 * Add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/check-live-streams",
 *     "schedule": "0/5 * * * *"
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[Cron] Checking for live streams...');

    // Get all users with active Twitch connections
    const twitchConnections = await db.platformConnection.findMany({
      where: {
        platform: 'twitch',
        syncStatus: 'active',
      },
      include: {
        user: {
          include: {
            tokens: true, // Include user's tokens for tracking
          },
        },
      },
    });

    console.log(`[Cron] Found ${twitchConnections.length} active Twitch connections`);

    let checkedCount = 0;
    let streamStartedCount = 0;
    let streamEndedCount = 0;
    const results = [];

    for (const connection of twitchConnections) {
      try {
        checkedCount++;

        // Decrypt access token
        const accessToken = decrypt(connection.accessToken);
        const twitchUserId = connection.platformUserId;

        if (!twitchUserId) {
          console.log(`[Cron] Skipping connection ${connection.id} - missing platformUserId`);
          continue;
        }

        // Check if user is currently live
        const currentStream = await twitchService.getCurrentStream(accessToken, twitchUserId);

        // Check if we have an active stream session for this user
        const activeSession = await db.streamSession.findFirst({
          where: {
            userId: connection.userId,
            platform: 'twitch',
            endedAt: null,
          },
          orderBy: {
            startedAt: 'desc',
          },
        });

        if (currentStream && currentStream.type === 'live') {
          // User is live
          console.log(`[Cron] User ${connection.userId} is LIVE on Twitch: ${currentStream.title}`);

          if (!activeSession) {
            // No active session - start tracking
            console.log(`[Cron] Starting stream tracking for user ${connection.userId}`);

            // Get user's primary token if they have one
            const primaryToken = connection.user.tokens.find(t => t.isPrimary) || connection.user.tokens[0];

            const sessionId = await startStreamSession(connection.userId, {
              title: currentStream.title,
              platform: 'twitch',
              tokenMint: primaryToken?.mintAddress,
              tokenAddress: primaryToken?.contractAddress,
            });

            streamStartedCount++;
            results.push({
              userId: connection.userId,
              action: 'started',
              sessionId,
              title: currentStream.title,
              viewers: currentStream.viewer_count,
            });

            console.log(`[Cron] Started stream session: ${sessionId}`);
          } else {
            // Already tracking
            console.log(`[Cron] Already tracking stream for user ${connection.userId} (session: ${activeSession.id})`);
            results.push({
              userId: connection.userId,
              action: 'tracking',
              sessionId: activeSession.id,
              viewers: currentStream.viewer_count,
            });
          }
        } else {
          // User is NOT live
          if (activeSession) {
            // Had an active session but stream ended - end tracking
            console.log(`[Cron] Stream ended for user ${connection.userId}, ending session ${activeSession.id}`);

            await endStreamSession(activeSession.id);

            streamEndedCount++;
            results.push({
              userId: connection.userId,
              action: 'ended',
              sessionId: activeSession.id,
            });

            console.log(`[Cron] Ended stream session: ${activeSession.id}`);
          }
        }
      } catch (error) {
        console.error(`[Cron] Error checking stream for connection ${connection.id}:`, error);
        results.push({
          userId: connection.userId,
          action: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    console.log(`[Cron] Check complete: ${checkedCount} checked, ${streamStartedCount} started, ${streamEndedCount} ended`);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      checked: checkedCount,
      streamStarted: streamStartedCount,
      streamEnded: streamEndedCount,
      results,
    });
  } catch (error) {
    console.error('[Cron] Error in check-live-streams:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check live streams',
      },
      { status: 500 }
    );
  }
}
