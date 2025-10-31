import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { getUserInsights, generateCorrelationInsights, dismissInsight } from '@/lib/services/insights-engine';

/**
 * Get User Insights
 * Returns correlation insights for the current user
 *
 * GET /api/insights?tokenMint=xxx or tokenAddress=xxx&limit=10
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
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get insights for user
    const insights = await getUserInsights(user.id, {
      tokenMint: tokenMint || undefined,
      tokenAddress: tokenAddress || undefined,
      includeDismissed: false,
      limit,
    });

    return NextResponse.json({
      success: true,
      insights,
      count: insights.length,
    });
  } catch (error) {
    console.error('Error fetching insights:', error);
    return NextResponse.json(
      { error: 'Failed to fetch insights' },
      { status: 500 }
    );
  }
}

/**
 * Generate Insights for Current User
 * Manually triggers insight generation
 *
 * POST /api/insights
 * Body: { tokenMint?, tokenAddress? }
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
    const { tokenMint, tokenAddress } = body;

    // Generate insights
    const insightsCount = await generateCorrelationInsights(
      user.id,
      tokenMint,
      tokenAddress
    );

    return NextResponse.json({
      success: true,
      message: `Generated ${insightsCount} insights`,
      insightsCount,
    });
  } catch (error) {
    console.error('Error generating insights:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
}

/**
 * Dismiss an Insight
 * Marks an insight as dismissed
 *
 * DELETE /api/insights
 * Body: { insightId }
 */
export async function DELETE(request: NextRequest) {
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
    const { insightId } = body;

    if (!insightId) {
      return NextResponse.json(
        { error: 'Insight ID is required' },
        { status: 400 }
      );
    }

    // Verify insight belongs to user
    const insight = await db.correlationInsight.findUnique({
      where: { id: insightId },
    });

    if (!insight) {
      return NextResponse.json({ error: 'Insight not found' }, { status: 404 });
    }

    if (insight.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized access to insight' },
        { status: 403 }
      );
    }

    // Dismiss insight
    await dismissInsight(insightId);

    return NextResponse.json({
      success: true,
      message: 'Insight dismissed successfully',
    });
  } catch (error) {
    console.error('Error dismissing insight:', error);
    return NextResponse.json(
      { error: 'Failed to dismiss insight' },
      { status: 500 }
    );
  }
}
