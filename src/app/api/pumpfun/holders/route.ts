import { NextResponse } from 'next/server';
import { Connection, PublicKey } from '@solana/web3.js';

const SOLANA_RPC = 'https://api.mainnet-beta.solana.com';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mintAddress = searchParams.get('mint');

    if (!mintAddress) {
      return NextResponse.json(
        { error: 'Mint address is required' },
        { status: 400 }
      );
    }

    const connection = new Connection(SOLANA_RPC, 'confirmed');
    const mintPubkey = new PublicKey(mintAddress);

    // Get all token accounts for this mint
    const tokenAccounts = await connection.getParsedProgramAccounts(
      new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
      {
        filters: [
          {
            dataSize: 165, // Size of token account
          },
          {
            memcmp: {
              offset: 0, // Mint address is at offset 0
              bytes: mintPubkey.toBase58(),
            },
          },
        ],
      }
    );

    console.log(`Found ${tokenAccounts.length} token accounts for mint ${mintAddress}`);

    // Parse and sort holders by balance
    const holders = tokenAccounts
      .map((account) => {
        const parsedInfo = account.account.data.parsed?.info;
        if (!parsedInfo) return null;

        const owner = parsedInfo.owner;
        const balance = parseFloat(parsedInfo.tokenAmount?.uiAmount || '0');
        const decimals = parsedInfo.tokenAmount?.decimals || 0;

        return {
          address: owner,
          balance,
          decimals,
        };
      })
      .filter((holder): holder is NonNullable<typeof holder> => {
        return holder !== null && holder.balance > 0;
      })
      .sort((a, b) => b.balance - a.balance); // Sort by balance descending

    // Calculate total supply from all holders
    const totalSupply = holders.reduce((sum, h) => sum + h.balance, 0);

    // Add percentage of supply to each holder
    const holdersWithPercentage = holders.map((holder) => ({
      ...holder,
      percentageOfSupply: totalSupply > 0 ? (holder.balance / totalSupply) * 100 : 0,
    }));

    // Get top 100 holders
    const topHolders = holdersWithPercentage.slice(0, 100);

    // Calculate distribution metrics
    const top10Supply = topHolders.slice(0, 10).reduce((sum, h) => sum + h.balance, 0);
    const top10Percentage = totalSupply > 0 ? (top10Supply / totalSupply) * 100 : 0;

    const top50Supply = topHolders.slice(0, 50).reduce((sum, h) => sum + h.balance, 0);
    const top50Percentage = totalSupply > 0 ? (top50Supply / totalSupply) * 100 : 0;

    return NextResponse.json({
      success: true,
      data: {
        mint: mintAddress,
        totalHolders: holders.length,
        totalSupply,
        topHolders: topHolders.slice(0, 50), // Return top 50
        distribution: {
          top10Holders: topHolders.slice(0, 10).length,
          top10Percentage,
          top50Holders: topHolders.slice(0, 50).length,
          top50Percentage,
          giniCoefficient: calculateGiniCoefficient(holders.map(h => h.balance)),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching token holders:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch holders',
      },
      { status: 500 }
    );
  }
}

/**
 * Calculate Gini coefficient for token distribution
 * 0 = perfect equality, 1 = perfect inequality
 */
function calculateGiniCoefficient(balances: number[]): number {
  if (balances.length === 0) return 0;

  const sorted = [...balances].sort((a, b) => a - b);
  const n = sorted.length;
  const sum = sorted.reduce((a, b) => a + b, 0);

  if (sum === 0) return 0;

  let numerator = 0;
  for (let i = 0; i < n; i++) {
    numerator += (2 * (i + 1) - n - 1) * sorted[i];
  }

  return numerator / (n * sum);
}
