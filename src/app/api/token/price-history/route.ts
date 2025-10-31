import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { calculateContentPriceImpact } from '@/lib/services/content-token-snapshot';

/**
 * Get Token Price History with Content Events
 * Returns token price history combined with video/content publication events
 *
 * GET /api/token/price-history?tokenMint=xxx or tokenAddress=xxx&days=30
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
    const tokenMint = searchParams.get('tokenMint');
    const tokenAddress = searchParams.get('tokenAddress');
    const days = parseInt(searchParams.get('days') || '30');

    if (!tokenMint && !tokenAddress) {
      return NextResponse.json(
        { error: 'Either tokenMint or tokenAddress is required' },
        { status: 400 }
      );
    }

    // Calculate date range
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - days);

    // Find user's content associated with this token
    const content = await db.contentPerformance.findMany({
      where: {
        userId: user.id,
        ...(tokenMint
          ? { relatedTokenMint: tokenMint }
          : { relatedTokenAddress: tokenAddress }),
        publishedAt: {
          gte: startDate,
        },
      },
      orderBy: {
        publishedAt: 'asc',
      },
      select: {
        id: true,
        title: true,
        publishedAt: true,
        thumbnailUrl: true,
        views: true,
        tokenSnapshots: {
          where: {
            snapshotType: {
              in: ['before_post', 'post_24h'],
            },
          },
          orderBy: {
            snapshotTime: 'asc',
          },
        },
      },
    });

    // Calculate price impact for each piece of content
    const videoEvents = await Promise.all(
      content.map(async (item) => {
        let priceImpact: number | undefined;

        const impact = await calculateContentPriceImpact(item.id);
        if (impact && impact.impact24h !== undefined) {
          priceImpact = impact.impact24h;
        }

        return {
          id: item.id,
          title: item.title || 'Untitled',
          publishedAt: item.publishedAt,
          thumbnailUrl: item.thumbnailUrl,
          views: item.views,
          priceImpact,
        };
      })
    );

    // Get token price history from snapshots
    // Aggregate all snapshots for this token across all content
    const tokenSnapshots = await db.contentTokenSnapshot.findMany({
      where: {
        ...(tokenMint
          ? { tokenMint: tokenMint }
          : { tokenAddress: tokenAddress }),
        snapshotTime: {
          gte: startDate,
        },
      },
      orderBy: {
        snapshotTime: 'asc',
      },
      select: {
        snapshotTime: true,
        price: true,
        marketCap: true,
        volume24h: true,
      },
    });

    // Format price history for chart
    const priceHistory = tokenSnapshots.map((snapshot) => ({
      timestamp: snapshot.snapshotTime,
      price: parseFloat(snapshot.price.toString()),
      marketCap: parseFloat(snapshot.marketCap.toString()),
      volume: parseFloat(snapshot.volume24h.toString()),
    }));

    // If we don't have much historical data, try to fetch current price
    // This could be enhanced to fetch historical data from external APIs
    if (priceHistory.length < 2) {
      console.log('Limited historical data available. Consider fetching from external API.');
    }

    return NextResponse.json({
      success: true,
      tokenMint: tokenMint || null,
      tokenAddress: tokenAddress || null,
      priceHistory,
      videoEvents,
      timeRange: {
        start: startDate,
        end: now,
        days,
      },
    });
  } catch (error) {
    console.error('Error fetching token price history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch token price history' },
      { status: 500 }
    );
  }
}
