import { NextRequest, NextResponse } from 'next/server';

/**
 * Farcaster Frame webhook endpoint
 * Handles interactions from the Farcaster Frame SDK
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('[Farcaster Webhook] Received:', body);

    // Handle different types of Farcaster Frame events
    // For now, just acknowledge receipt
    return NextResponse.json({
      success: true,
      message: 'Webhook received',
    });
  } catch (error) {
    console.error('[Farcaster Webhook] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Health check for webhook endpoint
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    endpoint: 'farcaster-webhook',
    status: 'active',
  });
}
