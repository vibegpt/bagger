import { NextRequest, NextResponse } from 'next/server';
import { tokenIngestionService } from '@/lib/services/token-ingestion';

/**
 * Admin endpoint to add new tokens to the database
 *
 * POST /api/admin/add-token
 * Body: { "mintAddress": "..." } or { "mintAddresses": ["...", "..."] }
 *
 * Authorization: Bearer token (ADMIN_SECRET env var)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin authorization
    const authHeader = request.headers.get('authorization');

    if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Support both single and batch addition
    const mintAddresses = body.mintAddresses || [body.mintAddress];

    if (!mintAddresses || mintAddresses.length === 0) {
      return NextResponse.json(
        { error: 'Missing mintAddress or mintAddresses in request body' },
        { status: 400 }
      );
    }

    console.log(`[Admin] Adding ${mintAddresses.length} token(s)...`);

    const results = await tokenIngestionService.ingestTokenBatch(mintAddresses);

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    return NextResponse.json({
      success: true,
      added: successful.length,
      failed: failed.length,
      results: results.map(r => ({
        mintAddress: r.mintAddress,
        success: r.success,
        message: r.message,
        marketCap: r.marketCap,
        tokenAgeHours: r.tokenAgeHours,
      })),
    });
  } catch (error) {
    console.error('[Admin] Error adding tokens:', error);
    return NextResponse.json(
      {
        error: 'Failed to add tokens',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
