import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      platform,
      platformUrl,
      content,
      contentType,
      postedAt,
      likes,
      comments,
      shares,
      views,
      clicks,
      relatedTokenMint,
      relatedTokenAddress,
    } = body;

    const postDate = new Date(postedAt);
    const dayOfWeek = postDate.getDay(); // 0-6
    const hourOfDay = postDate.getHours(); // 0-23

    // Calculate engagement metrics
    const totalEngagement = (likes || 0) + (comments || 0) + (shares || 0);
    const engagementRate = views ? (totalEngagement / views) : null;

    // Create social post
    const socialPost = await db.socialPost.create({
      data: {
        userId: user.id,
        platform,
        platformUrl,
        content,
        contentType,
        postedAt: postDate,
        dayOfWeek,
        hourOfDay,
        likes: likes || 0,
        comments: comments || 0,
        shares: shares || 0,
        views,
        clicks,
        totalEngagement,
        engagementRate: engagementRate ? engagementRate.toString() : null,
        relatedTokenMint,
        relatedTokenAddress,
        source: 'manual',
      },
    });

    return NextResponse.json({
      success: true,
      data: socialPost,
    });
  } catch (error) {
    console.error('Error logging post:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to log post'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve social posts
export async function GET(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const platform = searchParams.get('platform');

    const posts = await db.socialPost.findMany({
      where: {
        userId: user.id,
        ...(platform && { platform }),
      },
      include: {
        tokenSnapshots: true,
      },
      orderBy: {
        postedAt: 'desc',
      },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: posts,
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch posts'
      },
      { status: 500 }
    );
  }
}
