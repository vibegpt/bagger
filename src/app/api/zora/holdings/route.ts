import { NextResponse } from 'next/server';
import { zoraClient } from '@/lib/integrations/zora/client';
import { type Address } from 'viem';

export async function GET(request: Request) {
  try {
    console.log('[API /api/zora/holdings] Request received');
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('address');
    console.log('[API /api/zora/holdings] Wallet address:', walletAddress);

    if (!walletAddress) {
      console.log('[API /api/zora/holdings] No wallet address provided');
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    console.log('[API /api/zora/holdings] Calling zoraClient.getWalletHoldings...');
    const holdings = await zoraClient.getWalletHoldings(walletAddress as Address);
    console.log('[API /api/zora/holdings] Holdings retrieved:', holdings);

    return NextResponse.json({
      success: true,
      data: holdings,
    });
  } catch (error) {
    console.error('[API /api/zora/holdings] Error fetching wallet holdings:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch wallet holdings'
      },
      { status: 500 }
    );
  }
}
