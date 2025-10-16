import { db } from '@/lib/db';

interface TokenData {
  marketCap: number;
  price: number;
  volume24h: number;
  holderCount?: number;
  priceChange1h?: number;
  priceChange24h?: number;
}

/**
 * Fetch token data from Pump.fun API
 */
async function fetchPumpFunTokenData(tokenMint: string): Promise<TokenData | null> {
  try {
    const response = await fetch(`https://frontend-api.pump.fun/coins/${tokenMint}`);

    if (!response.ok) {
      console.error(`Pump.fun API error: ${response.status}`);
      return null;
    }

    const data = await response.json();

    return {
      marketCap: data.usd_market_cap || 0,
      price: data.price || 0,
      volume24h: data.volume_24h || 0,
      holderCount: data.holder_count,
      priceChange1h: data.price_change_percentage_1h,
      priceChange24h: data.price_change_percentage_24h,
    };
  } catch (error) {
    console.error('Error fetching Pump.fun token data:', error);
    return null;
  }
}

/**
 * Fetch token data from Zora API
 */
async function fetchZoraTokenData(tokenAddress: string): Promise<TokenData | null> {
  try {
    // Zora API endpoint for token data
    const response = await fetch(`https://zora.co/api/personalized/token/8453/${tokenAddress}`);

    if (!response.ok) {
      console.error(`Zora API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const token = data.token;

    return {
      marketCap: parseFloat(token.marketCap || '0'),
      price: parseFloat(token.price || '0'),
      volume24h: parseFloat(token.volume24h || '0'),
      holderCount: token.holderCount,
      priceChange1h: parseFloat(token.priceChange1h || '0'),
      priceChange24h: parseFloat(token.priceChange24h || '0'),
    };
  } catch (error) {
    console.error('Error fetching Zora token data:', error);
    return null;
  }
}

/**
 * Create a token snapshot for a stream session
 */
export async function createTokenSnapshot(
  streamSessionId: string,
  snapshotType: 'pre_stream' | 'during_stream' | 'post_stream_1h' | 'post_stream_24h',
  tokenMint?: string | null,
  tokenAddress?: string | null
): Promise<void> {
  if (!tokenMint && !tokenAddress) {
    console.log('No token specified for snapshot');
    return;
  }

  try {
    let tokenData: TokenData | null = null;

    // Fetch token data based on platform
    if (tokenMint) {
      tokenData = await fetchPumpFunTokenData(tokenMint);
    } else if (tokenAddress) {
      tokenData = await fetchZoraTokenData(tokenAddress);
    }

    if (!tokenData) {
      console.error('Failed to fetch token data for snapshot');
      return;
    }

    // Create snapshot in database
    await db.tokenSnapshot.create({
      data: {
        streamSessionId,
        snapshotType,
        snapshotTime: new Date(),
        tokenMint: tokenMint || null,
        tokenAddress: tokenAddress || null,
        marketCap: tokenData.marketCap,
        price: tokenData.price,
        volume24h: tokenData.volume24h,
        holderCount: tokenData.holderCount,
        priceChange1h: tokenData.priceChange1h,
        priceChange24h: tokenData.priceChange24h,
      },
    });

    console.log(`Created ${snapshotType} snapshot for stream ${streamSessionId}`);
  } catch (error) {
    console.error('Error creating token snapshot:', error);
    throw error;
  }
}

/**
 * Schedule post-stream snapshots (to be called after stream ends)
 * This would typically be handled by a cron job or background task
 */
export async function schedulePostStreamSnapshots(
  streamSessionId: string,
  tokenMint?: string | null,
  tokenAddress?: string | null,
  endTime: Date
): Promise<void> {
  // In a production environment, this would schedule background jobs
  // For now, we'll log that snapshots should be scheduled
  console.log(`Should schedule post-stream snapshots for stream ${streamSessionId}`);
  console.log(`- 1 hour after: ${new Date(endTime.getTime() + 60 * 60 * 1000)}`);
  console.log(`- 24 hours after: ${new Date(endTime.getTime() + 24 * 60 * 60 * 1000)}`);

  // TODO: Implement with a job queue like Bull or similar
  // For MVP, we could create snapshots immediately and update the snapshotTime field later
}
