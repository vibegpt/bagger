import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { decrypt } from '@/lib/encryption';
import tiktokService from '@/lib/services/tiktok';

/**
 * TikTok Content Sync Route
 * Manually fetches recent videos from TikTok and stores them in the database
 *
 * POST /api/sync/tiktok
 * Requires: Authenticated user with TikTok connection
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
            platform: 'tiktok',
            syncStatus: 'active',
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if TikTok is connected
    const tiktokConnection = user.platformConnections[0];
    if (!tiktokConnection) {
      return NextResponse.json(
        { error: 'TikTok not connected. Please connect your TikTok account first.' },
        { status: 400 }
      );
    }

    // Decrypt access token
    const accessToken = decrypt(tiktokConnection.accessToken);

    console.log(`Fetching videos for TikTok user: ${tiktokConnection.platformUserId}`);

    // Fetch recent videos (last 50)
    const videos = await tiktokService.getAllUserVideos(accessToken, 50);

    console.log(`Found ${videos.length} videos from TikTok`);

    // Store videos in database
    let syncedCount = 0;
    let updatedCount = 0;
    const syncedVideos = [];

    for (const video of videos) {
      if (!video.id || !video.create_time) {
        console.log('Skipping video with missing ID or create_time');
        continue;
      }

      // Check if video already exists
      const existingContent = await db.contentPerformance.findUnique({
        where: {
          userId_platform_contentId: {
            userId: user.id,
            platform: 'tiktok',
            contentId: video.id,
          },
        },
      });

      // Store or update video in ContentPerformance table
      const contentPerformance = await db.contentPerformance.upsert({
        where: {
          userId_platform_contentId: {
            userId: user.id,
            platform: 'tiktok',
            contentId: video.id,
          },
        },
        create: {
          userId: user.id,
          platform: 'tiktok',
          contentId: video.id,
          contentType: 'video',
          title: (video.title || video.video_description)?.slice(0, 255),
          description: video.video_description,
          thumbnailUrl: video.cover_image_url,
          contentUrl: video.share_url,
          views: video.view_count,
          likes: video.like_count,
          comments: video.comment_count,
          shares: video.share_count,
          duration: video.duration,
          publishedAt: new Date(video.create_time * 1000), // Convert Unix timestamp to Date
        },
        update: {
          title: (video.title || video.video_description)?.slice(0, 255),
          description: video.video_description,
          thumbnailUrl: video.cover_image_url,
          views: video.view_count,
          likes: video.like_count,
          comments: video.comment_count,
          shares: video.share_count,
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
          title: video.video_description?.slice(0, 50),
          views: video.view_count,
          likes: video.like_count,
          comments: video.comment_count,
          publishedAt: video.create_time,
        });
      }
    }

    // Update last synced timestamp on connection
    await db.platformConnection.update({
      where: { id: tiktokConnection.id },
      data: { lastSyncedAt: new Date() },
    });

    console.log(`Sync complete: ${syncedCount} new, ${updatedCount} updated`);

    return NextResponse.json({
      success: true,
      message: `Synced ${videos.length} videos (${syncedCount} new, ${updatedCount} updated)`,
      syncedCount,
      updatedCount,
      totalMedia: videos.length,
      videos: syncedVideos,
    });
  } catch (error) {
    console.error('TikTok sync error:', error);

    // Check if it's a token expiration error
    if (error instanceof Error && error.message.includes('token')) {
      return NextResponse.json(
        { error: 'TikTok access token expired. Please reconnect your TikTok account.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to sync TikTok content. Please try again.' },
      { status: 500 }
    );
  }
}
