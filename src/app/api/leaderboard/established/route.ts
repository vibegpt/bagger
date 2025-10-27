import { NextRequest, NextResponse } from 'next/server';
import { tokenFilteringService } from '@/lib/services/token-filtering';

/**
 * GET /api/leaderboard/established?limit=10
 * Returns tokens passing Established Creators filters
 * - Market cap ≥ $100k
 * - Liquidity ≥ $25k
 * - Volume (24h) ≥ $25k
 * - Holders ≥ 200
 * - Age ≥ 3 days
 * - No rug signals (price crash, liquidity drain, wash trading)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');

    console.log(`[API] Fetching top ${limit} established tokens...`);

    const tokens = await tokenFilteringService.getEstablishedTokens(limit);

    // Transform to leaderboard format
    const leaderboardData = tokens.map((token, index) => ({
      rank: index + 1,
      address: token.mintAddress,
      name: token.name || token.symbol || 'Unknown',
      symbol: token.symbol,
      imageUrl: token.imageUrl,
      totalMarketCap: Number(token.marketCapUsd),
      liquidity: Number(token.liquidityUsd),
      volume24h: Number(token.volume24hUsd),
      totalHolders: token.holderCount,
      uniqueTraders24h: token.uniqueTraders24h,
      tokenAgeHours: token.tokenAgeHours,
      priceChange24h: token.priceChange24h ? Number(token.priceChange24h) : null,
      creatorVerified: token.creatorVerified,
      graduatedToRaydium: token.graduatedToRaydium,
      platform: 'pumpfun' as const,
    }));

    console.log(`[API] Returning ${leaderboardData.length} established tokens`);

    return NextResponse.json({
      success: true,
      data: leaderboardData,
      meta: {
        filterType: 'established',
        count: leaderboardData.length,
        filters: {
          minMarketCap: 100000,
          minLiquidity: 25000,
          minVolume24h: 25000,
          minHolders: 200,
          minTokenAgeHours: 72,
        },
        sortBy: 'marketCap',
      },
    });
  } catch (error) {
    console.error('[API] Established leaderboard error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch established leaderboard',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
