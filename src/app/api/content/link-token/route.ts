import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { captureContentPublishSnapshot } from '@/lib/services/content-token-snapshot';

/**
 * Link Content to Token
 * Associates a piece of content (video/post) with a creator's token
 * and captures initial token performance snapshot
 *
 * POST /api/content/link-token
 * Body: { contentId, tokenMint?, tokenAddress? }
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
    const { contentId, tokenMint, tokenAddress } = body;

    if (!contentId) {
      return NextResponse.json({ error: 'Content ID is required' }, { status: 400 });
    }

    if (!tokenMint && !tokenAddress) {
      return NextResponse.json(
        { error: 'Either tokenMint or tokenAddress is required' },
        { status: 400 }
      );
    }

    // Verify content belongs to user
    const content = await db.contentPerformance.findUnique({
      where: { id: contentId },
    });

    if (!content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    if (content.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized access to content' }, { status: 403 });
    }

    // Update content with token association
    await db.contentPerformance.update({
      where: { id: contentId },
      data: {
        relatedTokenMint: tokenMint || null,
        relatedTokenAddress: tokenAddress || null,
      },
    });

    // Capture initial "before_post" snapshot
    // Note: For existing content, this is actually "at time of linking" not truly "before post"
    // But it establishes a baseline for future comparisons
    await captureContentPublishSnapshot(contentId, tokenMint, tokenAddress);

    console.log(`Linked content ${contentId} to token ${tokenMint || tokenAddress}`);

    return NextResponse.json({
      success: true,
      message: 'Content linked to token successfully',
      contentId,
      tokenMint: tokenMint || null,
      tokenAddress: tokenAddress || null,
    });
  } catch (error) {
    console.error('Error linking content to token:', error);
    return NextResponse.json(
      { error: 'Failed to link content to token' },
      { status: 500 }
    );
  }
}

/**
 * Unlink Content from Token
 * Removes token association from content
 *
 * DELETE /api/content/link-token
 * Body: { contentId }
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
    const { contentId } = body;

    if (!contentId) {
      return NextResponse.json({ error: 'Content ID is required' }, { status: 400 });
    }

    // Verify content belongs to user
    const content = await db.contentPerformance.findUnique({
      where: { id: contentId },
    });

    if (!content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    if (content.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized access to content' }, { status: 403 });
    }

    // Remove token association
    await db.contentPerformance.update({
      where: { id: contentId },
      data: {
        relatedTokenMint: null,
        relatedTokenAddress: null,
      },
    });

    console.log(`Unlinked token from content ${contentId}`);

    return NextResponse.json({
      success: true,
      message: 'Token unlinked from content successfully',
      contentId,
    });
  } catch (error) {
    console.error('Error unlinking token from content:', error);
    return NextResponse.json(
      { error: 'Failed to unlink token from content' },
      { status: 500 }
    );
  }
}
