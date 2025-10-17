import { NextResponse } from 'next/server';
import { getTokenMetadata as getBaseTokenMetadata, getTokenTotalSupply as getBaseTotalSupply } from '@/lib/base-indexer';
import { getSPLTokenMetadata, getSPLTokenTotalSupply, isValidSolanaAddress } from '@/lib/solana-indexer';
import { getChain, type ChainId } from '@/lib/chains';
import type { Address } from 'viem';

export const runtime = 'nodejs';

/**
 * Unified Cross-Chain Tokens API
 *
 * Fetches token data from any supported blockchain
 * Automatically detects chain based on address format
 *
 * Query params:
 * - address: Token address (required)
 * - chain: Chain ID override (optional: 'base' | 'solana')
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tokenAddress = searchParams.get('address');
    const chainOverride = searchParams.get('chain') as ChainId | null;

    if (!tokenAddress) {
      return NextResponse.json(
        { success: false, error: 'Token address is required' },
        { status: 400 }
      );
    }

    // Auto-detect chain from address format if not specified
    let chainId: ChainId;

    if (chainOverride) {
      chainId = chainOverride;
    } else {
      // Base/EVM: 0x followed by 40 hex chars
      // Solana: Base58 string, typically 32-44 chars
      if (/^0x[a-fA-F0-9]{40}$/.test(tokenAddress)) {
        chainId = 'base';
      } else if (isValidSolanaAddress(tokenAddress)) {
        chainId = 'solana';
      } else {
        return NextResponse.json(
          { success: false, error: 'Invalid token address format. Must be Ethereum (0x...) or Solana (base58) address' },
          { status: 400 }
        );
      }
    }

    const chainConfig = getChain(chainId);

    // Fetch metadata and supply based on chain
    let metadata;
    let totalSupply: bigint;

    if (chainId === 'base') {
      metadata = await getBaseTokenMetadata(tokenAddress as Address);
      if (!metadata) {
        return NextResponse.json(
          { success: false, error: 'Failed to fetch Base token metadata' },
          { status: 500 }
        );
      }
      totalSupply = await getBaseTotalSupply(tokenAddress as Address);
    } else if (chainId === 'solana') {
      metadata = await getSPLTokenMetadata(tokenAddress);
      if (!metadata) {
        return NextResponse.json(
          { success: false, error: 'Failed to fetch Solana token metadata' },
          { status: 500 }
        );
      }
      totalSupply = await getSPLTokenTotalSupply(tokenAddress);
    } else {
      return NextResponse.json(
        { success: false, error: `Chain '${chainId}' not yet supported` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      token: {
        address: tokenAddress,
        chain: {
          id: metadata.chainId,
          name: chainConfig.name,
          explorer: chainConfig.explorer,
        },
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
    console.error('Unified tokens API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
