import { NextResponse } from 'next/server';
import { getSPLTokenMetadata, getSPLTokenTotalSupply, isValidSolanaAddress } from '@/lib/solana-indexer';

export const runtime = 'nodejs';

/**
 * Solana Tokens API
 *
 * Fetches SPL token data from Solana blockchain
 * Can be used to query Pump.fun creator coins or any Solana token
 *
 * Query params:
 * - address: Token mint address (required)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tokenAddress = searchParams.get('address');

    if (!tokenAddress) {
      return NextResponse.json(
        { success: false, error: 'Token mint address is required' },
        { status: 400 }
      );
    }

    // Validate Solana address format
    if (!isValidSolanaAddress(tokenAddress)) {
      return NextResponse.json(
        { success: false, error: 'Invalid Solana address format' },
        { status: 400 }
      );
    }

    // Fetch token metadata (includes Pump.fun data if available)
    const metadata = await getSPLTokenMetadata(tokenAddress);

    if (!metadata) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch token metadata' },
        { status: 500 }
      );
    }

    // Fetch total supply
    const totalSupply = await getSPLTokenTotalSupply(tokenAddress);

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
        creatorUsername: metadata.creatorUsername,
        imageUrl: metadata.imageUrl,
        description: metadata.description,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Solana tokens API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
