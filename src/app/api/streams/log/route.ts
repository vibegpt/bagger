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
      title,
      description,
      category,
      platformUrl,
      startedAt,
      endedAt,
      peakViewers,
      averageViewers,
      totalViews,
      relatedTokenMint,
      relatedTokenAddress,
    } = body;

    // Calculate duration if endedAt is provided
    let durationMinutes: number | undefined;
    if (endedAt) {
      const start = new Date(startedAt);
      const end = new Date(endedAt);
      durationMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
    }

    // Create stream session
    const streamSession = await db.streamSession.create({
      data: {
        userId: user.id,
        platform,
        title,
        description,
        category,
        platformUrl,
        startedAt: new Date(startedAt),
        endedAt: endedAt ? new Date(endedAt) : undefined,
        durationMinutes,
        peakViewers,
        averageViewers,
        totalViews,
        relatedTokenMint,
        relatedTokenAddress,
        source: 'manual',
      },
    });

    // TODO: Automatically capture token snapshots
    // - Pre-stream snapshot (at startedAt)
    // - During stream snapshot (if still ongoing)
    // - Post-stream snapshots (1h, 24h after endedAt)

    return NextResponse.json({
      success: true,
      data: streamSession,
    });
  } catch (error) {
    console.error('Error logging stream:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to log stream'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve stream sessions
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

    const streamSessions = await db.streamSession.findMany({
      where: {
        userId: user.id,
        ...(platform && { platform }),
      },
      include: {
        tokenSnapshots: true,
      },
      orderBy: {
        startedAt: 'desc',
      },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: streamSessions,
    });
  } catch (error) {
    console.error('Error fetching stream sessions:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch stream sessions'
      },
      { status: 500 }
    );
  }
}
