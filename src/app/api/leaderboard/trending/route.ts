import { NextRequest, NextResponse } from 'next/server';
import { tokenFilteringService } from '@/lib/services/token-filtering';

/**
 * GET /api/leaderboard/trending?limit=20
 * Returns tokens passing Trending Launches filters, ranked by velocity
 * - Market cap ≥ $10k
 * - Liquidity ≥ $5k
 * - Volume (24h) ≥ $5k
 * - Holders ≥ 50
 * - Age: 1-24 hours (new launches only)
 * - No rug signals (price crash, liquidity drain)
 * - Ranked by growth velocity
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20');

    console.log(`[API] Fetching top ${limit} trending tokens...`);

    const tokens = await tokenFilteringService.getTrendingTokens(limit);

    // Transform to leaderboard format with velocity score
    const leaderboardData = tokens.map((token, index) => {
      // Calculate velocity score for display
      const ageInHours = Math.max(token.tokenAgeHours, 1);
      const mcapVelocity = Number(token.marketCapUsd) / ageInHours;
      const holderVelocity = token.holderCount / ageInHours;
      const velocityScore = mcapVelocity * holderVelocity;

      return {
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
        velocityScore: Math.floor(velocityScore),
        creatorVerified: token.creatorVerified,
        graduatedToRaydium: token.graduatedToRaydium,
        platform: 'pumpfun' as const,
      };
    });

    console.log(`[API] Returning ${leaderboardData.length} trending tokens`);

    return NextResponse.json({
      success: true,
      data: leaderboardData,
      meta: {
        filterType: 'trending',
        count: leaderboardData.length,
        filters: {
          minMarketCap: 10000,
          minLiquidity: 5000,
          minVolume24h: 5000,
          minHolders: 50,
          minTokenAgeHours: 1,
          maxTokenAgeHours: 24,
        },
      },
    });
  } catch (error) {
    console.error('[API] Trending leaderboard error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch trending leaderboard',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
