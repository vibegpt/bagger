import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { decrypt } from '@/lib/encryption';
import { youtubeService } from '@/lib/services/youtube';

/**
 * YouTube Video Auto-Sync Cron Job
 * Automatically syncs videos for all users with active YouTube connections
 *
 * GET /api/cron/sync-youtube
 * Requires: CRON_SECRET in headers for authentication
 * Runs: Every 6 hours (configured in vercel.json)
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

    console.log('Starting YouTube auto-sync cron job...');

    // Find all users with active YouTube connections
    const activeConnections = await db.platformConnection.findMany({
      where: {
        platform: 'youtube',
        syncStatus: 'active',
      },
      include: {
        user: true,
      },
    });

    console.log(`Found ${activeConnections.length} active YouTube connections`);

    const results = {
      totalConnections: activeConnections.length,
      successful: 0,
      failed: 0,
      totalVideosSynced: 0,
      errors: [] as string[],
    };

    // Sync videos for each connection
    for (const connection of activeConnections) {
      try {
        const { user } = connection;
        const channelId = connection.youtubeChannelId;

        if (!channelId) {
          console.log(`Skipping user ${user.id} - no channel ID`);
          results.failed++;
          results.errors.push(`User ${user.clerkId}: No channel ID`);
          continue;
        }

        console.log(`Syncing videos for user ${user.id}, channel ${channelId}`);

        // Decrypt access token
        const accessToken = decrypt(connection.accessToken);

        // Fetch recent videos (last 50)
        const videos = await youtubeService.getRecentVideos(accessToken, channelId, 50);

        console.log(`Found ${videos.length} videos for user ${user.id}`);

        // Store videos in database
        let syncedCount = 0;
        let updatedCount = 0;

        for (const video of videos) {
          if (!video.id || !video.publishedAt) {
            continue;
          }

          await db.contentPerformance.upsert({
            where: {
              userId_platform_contentId: {
                userId: user.id,
                platform: 'youtube',
                contentId: video.id,
              },
            },
            create: {
              userId: user.id,
              platform: 'youtube',
              contentId: video.id,
              contentType: 'video',
              title: video.title || 'Untitled Video',
              description: video.description,
              thumbnailUrl: video.thumbnailUrl,
              contentUrl: `https://www.youtube.com/watch?v=${video.id}`,
              views: video.views,
              likes: video.likes,
              comments: video.comments,
              publishedAt: new Date(video.publishedAt),
            },
            update: {
              title: video.title || 'Untitled Video',
              description: video.description,
              thumbnailUrl: video.thumbnailUrl,
              views: video.views,
              likes: video.likes,
              comments: video.comments,
            },
          });

          syncedCount++;
        }

        // Update last synced timestamp
        await db.platformConnection.update({
          where: { id: connection.id },
          data: { lastSyncedAt: new Date() },
        });

        console.log(
          `Successfully synced ${syncedCount} videos for user ${user.id}`
        );

        results.successful++;
        results.totalVideosSynced += syncedCount;
      } catch (error) {
        console.error(
          `Error syncing videos for user ${connection.user.id}:`,
          error
        );
        results.failed++;
        results.errors.push(
          `User ${connection.user.clerkId}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );

        // If token is expired, mark connection as needing reauth
        if (error instanceof Error && error.message.includes('invalid_grant')) {
          await db.platformConnection.update({
            where: { id: connection.id },
            data: { syncStatus: 'error' },
          });
          console.log(
            `Marked connection ${connection.id} as error due to token expiration`
          );
        }
      }
    }

    console.log('Cron job complete:', results);

    return NextResponse.json({
      success: true,
      message: `Synced videos for ${results.successful}/${results.totalConnections} connections`,
      ...results,
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      {
        error: 'Cron job failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
