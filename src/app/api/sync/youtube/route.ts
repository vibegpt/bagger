import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { decrypt } from '@/lib/encryption';
import { youtubeService } from '@/lib/services/youtube';

/**
 * YouTube Video Sync Route
 * Manually fetches recent videos from YouTube and stores them in the database
 *
 * POST /api/sync/youtube
 * Requires: Authenticated user with YouTube connection
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
            platform: 'youtube',
            syncStatus: 'active',
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if YouTube is connected
    const youtubeConnection = user.platformConnections[0];
    if (!youtubeConnection) {
      return NextResponse.json(
        { error: 'YouTube not connected. Please connect your YouTube account first.' },
        { status: 400 }
      );
    }

    // Decrypt access token
    const accessToken = decrypt(youtubeConnection.accessToken);
    const channelId = youtubeConnection.youtubeChannelId;

    if (!channelId) {
      return NextResponse.json(
        { error: 'YouTube channel ID not found' },
        { status: 400 }
      );
    }

    console.log(`Fetching videos for channel: ${channelId}`);

    // Fetch recent videos from YouTube (last 50)
    const videos = await youtubeService.getRecentVideos(accessToken, channelId, 50);

    console.log(`Found ${videos.length} videos from YouTube`);

    // Store videos in database
    let syncedCount = 0;
    let updatedCount = 0;
    const syncedVideos = [];

    for (const video of videos) {
      if (!video.id || !video.publishedAt) {
        console.log('Skipping video with missing ID or publishedAt');
        continue;
      }

      // Store or update video in ContentPerformance table
      const contentPerformance = await db.contentPerformance.upsert({
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

      if (contentPerformance) {
        // Check if this was a new record or update
        const existing = await db.contentPerformance.findUnique({
          where: {
            userId_platform_contentId: {
              userId: user.id,
              platform: 'youtube',
              contentId: video.id,
            },
          },
        });

        if (existing && existing.createdAt < new Date(Date.now() - 1000)) {
          updatedCount++;
        } else {
          syncedCount++;
        }

        syncedVideos.push({
          id: video.id,
          title: video.title,
          views: video.views,
          publishedAt: video.publishedAt,
        });
      }
    }

    // Update last synced timestamp on connection
    await db.platformConnection.update({
      where: { id: youtubeConnection.id },
      data: { lastSyncedAt: new Date() },
    });

    console.log(`Sync complete: ${syncedCount} new, ${updatedCount} updated`);

    return NextResponse.json({
      success: true,
      message: `Synced ${videos.length} videos (${syncedCount} new, ${updatedCount} updated)`,
      syncedCount,
      updatedCount,
      totalVideos: videos.length,
      videos: syncedVideos,
    });
  } catch (error) {
    console.error('YouTube sync error:', error);

    // Check if it's a token expiration error
    if (error instanceof Error && error.message.includes('invalid_grant')) {
      return NextResponse.json(
        { error: 'YouTube access token expired. Please reconnect your YouTube account.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to sync YouTube videos. Please try again.' },
      { status: 500 }
    );
  }
}
