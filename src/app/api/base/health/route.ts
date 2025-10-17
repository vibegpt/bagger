import { NextResponse } from 'next/server';
import { checkBaseConnection, getCurrentBlock, baseClient } from '@/lib/base-indexer';
import { getChain } from '@/lib/chains';

export const runtime = 'nodejs';

/**
 * Base Network Health Check API
 *
 * Tests connection to Base blockchain via Alchemy RPC
 * Returns current block number and chain info
 */
export async function GET() {
  try {
    // Get Base chain config
    const baseConfig = getChain('base');

    // Test connection
    const isConnected = await checkBaseConnection();

    if (!isConnected) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to connect to Base network',
          chain: baseConfig.name,
        },
        { status: 500 }
      );
    }

    // Get current block
    const blockNumber = await getCurrentBlock();

    // Get chain ID
    const chainId = await baseClient.getChainId();

    return NextResponse.json({
      success: true,
      connected: true,
      chain: {
        id: chainId,
        name: baseConfig.name,
        rpcUrl: baseConfig.rpcUrl.replace(/\/v2\/.*/, '/v2/***'), // Hide API key
        explorer: baseConfig.explorer,
      },
      block: {
        number: blockNumber.toString(),
        hex: `0x${blockNumber.toString(16)}`,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Base health check error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
