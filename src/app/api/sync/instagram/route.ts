import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { decrypt } from '@/lib/encryption';
import instagramService from '@/lib/services/instagram';

/**
 * Instagram Content Sync Route
 * Manually fetches recent posts/reels from Instagram and stores them in the database
 *
 * POST /api/sync/instagram
 * Requires: Authenticated user with Instagram connection
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
            platform: 'instagram',
            syncStatus: 'active',
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if Instagram is connected
    const instagramConnection = user.platformConnections[0];
    if (!instagramConnection) {
      return NextResponse.json(
        { error: 'Instagram not connected. Please connect your Instagram account first.' },
        { status: 400 }
      );
    }

    // Decrypt access token
    const accessToken = decrypt(instagramConnection.accessToken);
    const businessAccountId = instagramConnection.instagramBusinessId;

    if (!businessAccountId) {
      return NextResponse.json(
        { error: 'Instagram business account ID not found' },
        { status: 400 }
      );
    }

    console.log(`Fetching media for Instagram account: ${businessAccountId}`);

    // Fetch recent media (last 50 posts)
    const media = await instagramService.getRecentMedia(accessToken, businessAccountId, 50);

    console.log(`Found ${media.length} media items from Instagram`);

    // Store media in database
    let syncedCount = 0;
    let updatedCount = 0;
    const syncedMedia = [];

    for (const item of media) {
      if (!item.id || !item.timestamp) {
        console.log('Skipping media with missing ID or timestamp');
        continue;
      }

      // Determine content type
      let contentType = 'post';
      if (item.media_type === 'REELS') {
        contentType = 'reel';
      } else if (item.media_type === 'VIDEO') {
        contentType = 'video';
      } else if (item.media_type === 'CAROUSEL_ALBUM') {
        contentType = 'carousel';
      }

      // Store or update media in ContentPerformance table
      const contentPerformance = await db.contentPerformance.upsert({
        where: {
          userId_platform_contentId: {
            userId: user.id,
            platform: 'instagram',
            contentId: item.id,
          },
        },
        create: {
          userId: user.id,
          platform: 'instagram',
          contentId: item.id,
          contentType,
          title: item.caption?.slice(0, 100), // Use first 100 chars of caption as title
          description: item.caption,
          thumbnailUrl: item.thumbnail_url || item.media_url,
          contentUrl: item.permalink,
          views: item.insights?.impressions,
          likes: item.like_count,
          comments: item.comments_count,
          shares: item.insights?.shares,
          saves: item.insights?.saved,
          reach: item.insights?.reach,
          impressions: item.insights?.impressions,
          reelsPlays: item.insights?.plays,
          publishedAt: new Date(item.timestamp),
        },
        update: {
          title: item.caption?.slice(0, 100),
          description: item.caption,
          thumbnailUrl: item.thumbnail_url || item.media_url,
          views: item.insights?.impressions,
          likes: item.like_count,
          comments: item.comments_count,
          shares: item.insights?.shares,
          saves: item.insights?.saved,
          reach: item.insights?.reach,
          impressions: item.insights?.impressions,
          reelsPlays: item.insights?.plays,
        },
      });

      if (contentPerformance) {
        // Check if this was a new record or update
        const existing = await db.contentPerformance.findUnique({
          where: {
            userId_platform_contentId: {
              userId: user.id,
              platform: 'instagram',
              contentId: item.id,
            },
          },
        });

        if (existing && existing.createdAt < new Date(Date.now() - 1000)) {
          updatedCount++;
        } else {
          syncedCount++;
        }

        syncedMedia.push({
          id: item.id,
          caption: item.caption?.slice(0, 50),
          likes: item.like_count,
          comments: item.comments_count,
          publishedAt: item.timestamp,
        });
      }
    }

    // Update last synced timestamp on connection
    await db.platformConnection.update({
      where: { id: instagramConnection.id },
      data: { lastSyncedAt: new Date() },
    });

    console.log(`Sync complete: ${syncedCount} new, ${updatedCount} updated`);

    return NextResponse.json({
      success: true,
      message: `Synced ${media.length} posts (${syncedCount} new, ${updatedCount} updated)`,
      syncedCount,
      updatedCount,
      totalMedia: media.length,
      media: syncedMedia,
    });
  } catch (error) {
    console.error('Instagram sync error:', error);

    // Check if it's a token expiration error
    if (error instanceof Error && error.message.includes('token')) {
      return NextResponse.json(
        { error: 'Instagram access token expired. Please reconnect your Instagram account.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to sync Instagram content. Please try again.' },
      { status: 500 }
    );
  }
}
