import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { decrypt } from '@/lib/encryption';
import twitchService from '@/lib/services/twitch';

/**
 * Twitch Content Sync Route
 * Manually fetches recent VODs (past broadcasts) from Twitch and stores them in the database
 *
 * POST /api/sync/twitch
 * Requires: Authenticated user with Twitch connection
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
      include: {
        platformConnections: {
          where: {
            platform: 'twitch',
            syncStatus: 'active',
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if Twitch is connected
    const twitchConnection = user.platformConnections[0];
    if (!twitchConnection) {
      return NextResponse.json(
        { error: 'Twitch not connected. Please connect your Twitch account first.' },
        { status: 400 }
      );
    }

    // Decrypt access token
    const accessToken = decrypt(twitchConnection.accessToken);
    const twitchUserId = twitchConnection.platformUserId;

    if (!twitchUserId) {
      return NextResponse.json(
        { error: 'Twitch user ID not found' },
        { status: 400 }
      );
    }

    console.log(`Fetching VODs for Twitch user: ${twitchUserId}`);

    // Fetch recent VODs (last 50 broadcasts)
    const videos = await twitchService.getVideos(accessToken, twitchUserId, 50);

    console.log(`Found ${videos.length} VODs from Twitch`);

    // Store videos in database
    let syncedCount = 0;
    let updatedCount = 0;
    const syncedVideos = [];

    for (const video of videos) {
      if (!video.id || !video.created_at) {
        console.log('Skipping video with missing ID or created_at');
        continue;
      }

      // Determine content type
      let contentType = 'stream';
      if (video.type === 'highlight') {
        contentType = 'highlight';
      } else if (video.type === 'upload') {
        contentType = 'video';
      }

      // Parse duration (format: "1h2m3s" or "2m3s" or "3s")
      let durationSeconds = 0;
      if (video.duration) {
        const hourMatch = video.duration.match(/(\d+)h/);
        const minuteMatch = video.duration.match(/(\d+)m/);
        const secondMatch = video.duration.match(/(\d+)s/);

        if (hourMatch) durationSeconds += parseInt(hourMatch[1]) * 3600;
        if (minuteMatch) durationSeconds += parseInt(minuteMatch[1]) * 60;
        if (secondMatch) durationSeconds += parseInt(secondMatch[1]);
      }

      // Store or update video in ContentPerformance table
      const existingContent = await db.contentPerformance.findUnique({
        where: {
          userId_platform_contentId: {
            userId: user.id,
            platform: 'twitch',
            contentId: video.id,
          },
        },
      });

      const contentPerformance = await db.contentPerformance.upsert({
        where: {
          userId_platform_contentId: {
            userId: user.id,
            platform: 'twitch',
            contentId: video.id,
          },
        },
        create: {
          userId: user.id,
          platform: 'twitch',
          contentId: video.id,
          contentType,
          title: video.title?.slice(0, 255),
          description: video.description,
          thumbnailUrl: video.thumbnail_url?.replace('%{width}', '1280').replace('%{height}', '720'),
          contentUrl: video.url,
          views: video.view_count,
          duration: durationSeconds,
          publishedAt: new Date(video.created_at),
        },
        update: {
          title: video.title?.slice(0, 255),
          description: video.description,
          thumbnailUrl: video.thumbnail_url?.replace('%{width}', '1280').replace('%{height}', '720'),
          views: video.view_count,
        },
      });

      if (contentPerformance) {
        if (existingContent) {
          updatedCount++;
        } else {
          syncedCount++;
        }

        syncedVideos.push({
          id: video.id,
          title: video.title?.slice(0, 50),
          views: video.view_count,
          duration: video.duration,
          publishedAt: video.created_at,
        });
      }
    }

    // Update last synced timestamp on connection
    await db.platformConnection.update({
      where: { id: twitchConnection.id },
      data: { lastSyncedAt: new Date() },
    });

    console.log(`Sync complete: ${syncedCount} new, ${updatedCount} updated`);

    return NextResponse.json({
      success: true,
      message: `Synced ${videos.length} streams (${syncedCount} new, ${updatedCount} updated)`,
      syncedCount,
      updatedCount,
      totalMedia: videos.length,
      videos: syncedVideos,
    });
  } catch (error) {
    console.error('Twitch sync error:', error);

    // Check if it's a token expiration error
    if (error instanceof Error && error.message.includes('token')) {
      return NextResponse.json(
        { error: 'Twitch access token expired. Please reconnect your Twitch account.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to sync Twitch content. Please try again.' },
      { status: 500 }
    );
  }
}
