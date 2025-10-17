import { NextResponse } from 'next/server';
import { getZoraHoldingsByWallet } from '@/lib/base-indexer';
import { getPumpFunHoldingsByWallet } from '@/lib/solana-indexer';
import { isValidSolanaAddress } from '@/lib/solana-indexer';
import type { Address } from 'viem';

export const runtime = 'nodejs';

/**
 * Unified Cross-Chain Holdings API
 *
 * Fetches creator coin holdings across all supported chains
 * Returns Zora (Base) + Pump.fun (Solana) holdings
 *
 * Query params:
 * - address: Wallet address (required)
 * - chain: Filter by specific chain (optional: 'base' | 'solana' | 'all')
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('address');
    const chainFilter = searchParams.get('chain') || 'all';

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Determine which chains to query
    const queryBase = chainFilter === 'all' || chainFilter === 'base';
    const querySolana = chainFilter === 'all' || chainFilter === 'solana';

    const holdings: {
      base?: any[];
      solana?: any[];
      totalValueUsd: number;
      chains: string[];
    } = {
      totalValueUsd: 0,
      chains: [],
    };

    // Fetch Base (Zora) holdings
    if (queryBase) {
      try {
        // Validate Base address format
        if (/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
          const zoraHoldings = await getZoraHoldingsByWallet(walletAddress as Address);
          holdings.base = zoraHoldings.map((h) => ({
            chain: 'base',
            platform: 'zora',
            tokenAddress: h.address,
            balance: h.balance.toString(),
            valueUsd: h.value,
            token: {
              name: h.coin.name,
              symbol: h.coin.symbol,
              creator: h.coin.creator,
              imageUrl: h.coin.creatorProfile,
            },
          }));
          holdings.totalValueUsd += zoraHoldings.reduce((sum, h) => sum + h.value, 0);
          holdings.chains.push('base');
        }
      } catch (error) {
        console.error('Error fetching Base holdings:', error);
        holdings.base = [];
      }
    }

    // Fetch Solana (Pump.fun) holdings
    if (querySolana) {
      try {
        // Validate Solana address format
        if (isValidSolanaAddress(walletAddress)) {
          const pumpHoldings = await getPumpFunHoldingsByWallet(walletAddress);
          holdings.solana = pumpHoldings.map((h) => ({
            chain: 'solana',
            platform: 'pumpfun',
            tokenAddress: h.address,
            balance: h.balance.toString(),
            valueUsd: h.value,
            token: {
              name: h.coin.name,
              symbol: h.coin.symbol,
              creator: h.coin.creator,
              imageUrl: h.coin.imageUri,
            },
          }));
          holdings.totalValueUsd += pumpHoldings.reduce((sum, h) => sum + h.value, 0);
          holdings.chains.push('solana');
        }
      } catch (error) {
        console.error('Error fetching Solana holdings:', error);
        holdings.solana = [];
      }
    }

    // Calculate total count
    const totalCount =
      (holdings.base?.length || 0) + (holdings.solana?.length || 0);

    return NextResponse.json({
      success: true,
      wallet: walletAddress,
      holdings,
      summary: {
        totalTokens: totalCount,
        totalValueUsd: holdings.totalValueUsd,
        chains: holdings.chains,
        baseTokens: holdings.base?.length || 0,
        solanaTokens: holdings.solana?.length || 0,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Holdings API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
