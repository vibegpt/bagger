import { NextResponse } from 'next/server';
import { pumpFunClient } from '@/lib/integrations/pumpfun/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('address');

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    const holdings = await pumpFunClient.getUserHoldings(walletAddress);

    return NextResponse.json({
      success: true,
      data: holdings,
    });
  } catch (error) {
    console.error('Error fetching Pump.fun holdings:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch holdings'
      },
      { status: 500 }
    );
  }
}
