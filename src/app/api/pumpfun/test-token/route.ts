import { NextResponse } from 'next/server';
import { pumpFunClient } from '@/lib/integrations/pumpfun/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mint = searchParams.get('mint');

    if (!mint) {
      return NextResponse.json(
        { error: 'Mint address is required' },
        { status: 400 }
      );
    }

    console.log('Testing token fetch for:', mint);

    const tokenData = await pumpFunClient.getToken(mint);

    return NextResponse.json({
      success: true,
      data: tokenData,
      debug: {
        mint,
        found: !!tokenData,
      }
    });
  } catch (error) {
    console.error('Error testing token:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch token',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
