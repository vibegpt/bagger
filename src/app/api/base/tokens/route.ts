import { NextResponse } from 'next/server';
import { getTokenMetadata, getTokenTotalSupply } from '@/lib/base-indexer';
import type { Address } from 'viem';

export const runtime = 'nodejs';

/**
 * Base Tokens API
 *
 * Fetches ERC-20 token data from Base blockchain
 * Can be used to query Zora creator coins or any Base token
 *
 * Query params:
 * - address: Token contract address (required)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tokenAddress = searchParams.get('address');

    if (!tokenAddress) {
      return NextResponse.json(
        { success: false, error: 'Token address is required' },
        { status: 400 }
      );
    }

    // Validate address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(tokenAddress)) {
      return NextResponse.json(
        { success: false, error: 'Invalid token address format' },
        { status: 400 }
      );
    }

    // Fetch token metadata
    const metadata = await getTokenMetadata(tokenAddress as Address);

    if (!metadata) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch token metadata' },
        { status: 500 }
      );
    }

    // Fetch total supply
    const totalSupply = await getTokenTotalSupply(tokenAddress as Address);

    return NextResponse.json({
      success: true,
      token: {
        address: tokenAddress,
        chain: metadata.chainId,
        name: metadata.name,
        symbol: metadata.symbol,
        decimals: metadata.decimals,
        totalSupply: totalSupply.toString(),
        creator: metadata.creator,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Base tokens API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
