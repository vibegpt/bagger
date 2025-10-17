import { NextResponse } from 'next/server';
import { checkSolanaConnection, getCurrentSlot, getSolanaVersion } from '@/lib/solana-indexer';
import { getChain } from '@/lib/chains';

export const runtime = 'nodejs';

/**
 * Solana Network Health Check API
 *
 * Tests connection to Solana blockchain
 * Returns current slot and network info
 */
export async function GET() {
  try {
    // Get Solana chain config
    const solanaConfig = getChain('solana');

    // Test connection
    const isConnected = await checkSolanaConnection();

    if (!isConnected) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to connect to Solana network',
          chain: solanaConfig.name,
        },
        { status: 500 }
      );
    }

    // Get current slot (Solana's version of block number)
    const slot = await getCurrentSlot();

    // Get network version
    const version = await getSolanaVersion();

    return NextResponse.json({
      success: true,
      connected: true,
      chain: {
        name: solanaConfig.name,
        rpcUrl: solanaConfig.rpcUrl,
        explorer: solanaConfig.explorer,
      },
      slot: {
        number: slot,
        hex: `0x${slot.toString(16)}`,
      },
      version: version || undefined,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Solana health check error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
