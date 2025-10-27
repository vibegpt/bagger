import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';

/**
 * GET /api/leaderboard/creator-coins?limit=10
 * Returns curated creator coins with verified creators/brands
 * - Manually curated list of mint addresses
 * - Fetches live data from database
 * - Ranked by market cap (descending)
 */

// Curated list of verified creator tokens
// These are tokens with real companies/brands/known people behind them
const CREATOR_COIN_ADDRESSES = [
  'Df6yfrKC8kZE3KNkrHERKzAetSxbrWeniQfyJY4Jpump', // CHILLGUY - Just a chill guy
  'CPLTbYbtDMKZtHBaPqdDmHjxNwESCEB14gm6VuoDpump', // DTV - DraperTV
  '2GXmB95pGD3pHV4mzNq7YsmyiEmVYWQLptbwYqgdpump', // WNTV - Winternomics TV
  'BWExg398H58wceWfmMDZQdeVhFGe4wQFrbV72VoZpump', // BIRDIE - Birdie
  '7ctK21VZcJX1t1jiWLyWkSJk2Wm7xHYdsnWegzR6pump', // WOLF - Wolf
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');

    console.log(`[API] Fetching creator coins...`);

    // Fetch tokens from database that match our curated list
    const tokens = await prisma.tokenMetrics.findMany({
      where: {
        mintAddress: {
          in: CREATOR_COIN_ADDRESSES,
        },
      },
      orderBy: {
        marketCapUsd: 'desc', // Ranked by market cap
      },
      take: limit,
    });

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

    console.log(`[API] Returning ${leaderboardData.length} creator coins`);

    return NextResponse.json({
      success: true,
      data: leaderboardData,
      meta: {
        filterType: 'creator-coins',
        count: leaderboardData.length,
        curatedList: true,
        sortBy: 'marketCap',
      },
    });
  } catch (error) {
    console.error('[API] Creator coins leaderboard error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch creator coins leaderboard',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
