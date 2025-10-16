import { NextResponse } from 'next/server';
import { createPublicClient, http, type Address, erc20Abi } from 'viem';
import { base } from 'viem/chains';

const BASE_NETWORK_RPC = 'https://mainnet.base.org';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tokenAddress = searchParams.get('address');

    if (!tokenAddress) {
      return NextResponse.json(
        { error: 'Token address is required' },
        { status: 400 }
      );
    }

    const publicClient = createPublicClient({
      chain: base,
      transport: http(BASE_NETWORK_RPC),
    });

    // For ERC20 tokens on Base, we need to use an indexer or subgraph
    // The standard ERC20 contract doesn't have a method to list all holders
    // For now, we'll return a placeholder with instructions

    // Get basic token info
    const [name, symbol, totalSupply, decimals] = await Promise.all([
      publicClient.readContract({
        address: tokenAddress as Address,
        abi: erc20Abi,
        functionName: 'name',
      }),
      publicClient.readContract({
        address: tokenAddress as Address,
        abi: erc20Abi,
        functionName: 'symbol',
      }),
      publicClient.readContract({
        address: tokenAddress as Address,
        abi: erc20Abi,
        functionName: 'totalSupply',
      }),
      publicClient.readContract({
        address: tokenAddress as Address,
        abi: erc20Abi,
        functionName: 'decimals',
      }),
    ]);

    // Note: To get actual holder list, we'd need to use:
    // 1. Zora's GraphQL API (if they provide holder data)
    // 2. Base blockchain indexer like Blockscout or Covalent
    // 3. Event logs (Transfer events) to build holder list

    return NextResponse.json({
      success: true,
      data: {
        tokenAddress,
        name,
        symbol,
        totalSupply: totalSupply.toString(),
        decimals,
        message: 'Holder list requires blockchain indexer integration. Consider using Blockscout API or Covalent for Base chain.',
        // Placeholder structure
        totalHolders: 0,
        topHolders: [],
        distribution: {
          top10Percentage: 0,
          top50Percentage: 0,
          giniCoefficient: 0,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching Zora token holders:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch holders',
      },
      { status: 500 }
    );
  }
}
