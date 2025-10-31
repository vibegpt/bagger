import { db } from '@/lib/db';

interface TokenData {
  marketCap: number;
  price: number;
  volume24h: number;
  holderCount?: number;
  priceChange1h?: number;
  priceChange24h?: number;
  transactionCount?: number; // We'll try to fetch this
}

/**
 * Fetch token data from Pump.fun API with transaction count
 */
async function fetchPumpFunTokenDataWithTxCount(tokenMint: string): Promise<TokenData | null> {
  try {
    const response = await fetch(`https://frontend-api.pump.fun/coins/${tokenMint}`);

    if (!response.ok) {
      console.error(`Pump.fun API error: ${response.status}`);
      return null;
    }

    const data = await response.json();

    // Try to get transaction count from recent trades
    let transactionCount = 0;
    try {
      const tradesResponse = await fetch(
        `https://frontend-api.pump.fun/trades/latest/${tokenMint}`
      );
      if (tradesResponse.ok) {
        const trades = await tradesResponse.json();
        transactionCount = Array.isArray(trades) ? trades.length : 0;
      }
    } catch (error) {
      console.log('Could not fetch transaction count');
    }

    return {
      marketCap: data.usd_market_cap || 0,
      price: data.price || 0,
      volume24h: data.volume_24h || 0,
      holderCount: data.holder_count,
      priceChange1h: data.price_change_percentage_1h,
      priceChange24h: data.price_change_percentage_24h,
      transactionCount,
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
 * Start tracking a stream session
 * Creates a StreamSession record and captures initial "pre_stream" snapshot
 */
export async function startStreamSession(
  userId: string,
  options: {
    title?: string;
    platform: string; // youtube, twitch, kick, pumpfun
    platformUrl?: string;
    tokenMint?: string;
    tokenAddress?: string;
  }
): Promise<string> {
  try {
    if (!options.tokenMint && !options.tokenAddress) {
      throw new Error('Either tokenMint or tokenAddress is required');
    }

    // Create stream session
    const session = await db.streamSession.create({
      data: {
        userId,
        platform: options.platform,
        platformUrl: options.platformUrl,
        title: options.title,
        startedAt: new Date(),
        relatedTokenMint: options.tokenMint,
        relatedTokenAddress: options.tokenAddress,
        source: 'manual',
      },
    });

    console.log(`Created stream session ${session.id}`);

    // Capture pre-stream snapshot
    await captureStreamSnapshot(
      session.id,
      'pre_stream',
      options.tokenMint,
      options.tokenAddress
    );

    return session.id;
  } catch (error) {
    console.error('Error starting stream session:', error);
    throw error;
  }
}

/**
 * Capture a token snapshot during a stream
 */
export async function captureStreamSnapshot(
  streamSessionId: string,
  snapshotType: 'pre_stream' | 'during_stream' | 'post_stream_1h' | 'post_stream_24h',
  tokenMint?: string | null,
  tokenAddress?: string | null
): Promise<void> {
  if (!tokenMint && !tokenAddress) {
    console.log('No token specified for stream snapshot');
    return;
  }

  try {
    let tokenData: TokenData | null = null;

    // Fetch token data based on platform
    if (tokenMint) {
      tokenData = await fetchPumpFunTokenDataWithTxCount(tokenMint);
    } else if (tokenAddress) {
      tokenData = await fetchZoraTokenData(tokenAddress);
    }

    if (!tokenData) {
      console.error('Failed to fetch token data for stream snapshot');
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
    console.error('Error creating stream snapshot:', error);
    throw error;
  }
}

/**
 * Capture multiple snapshots during a stream (called by cron)
 * Captures snapshots every 10 minutes during an active stream
 */
export async function captureDuringStreamSnapshots(
  streamSessionId: string,
  tokenMint?: string | null,
  tokenAddress?: string | null
): Promise<void> {
  try {
    // Capture a during_stream snapshot
    await captureStreamSnapshot(streamSessionId, 'during_stream', tokenMint, tokenAddress);
  } catch (error) {
    console.error('Error capturing during-stream snapshots:', error);
  }
}

/**
 * End a stream session
 * Records end time, calculates duration, and schedules post-stream snapshots
 */
export async function endStreamSession(
  streamSessionId: string
): Promise<void> {
  try {
    // Get stream session
    const session = await db.streamSession.findUnique({
      where: { id: streamSessionId },
    });

    if (!session) {
      throw new Error('Stream session not found');
    }

    if (session.endedAt) {
      throw new Error('Stream session already ended');
    }

    // Calculate duration in minutes
    const endTime = new Date();
    const durationMinutes = Math.floor(
      (endTime.getTime() - session.startedAt.getTime()) / (1000 * 60)
    );

    // Update stream session
    await db.streamSession.update({
      where: { id: streamSessionId },
      data: {
        endedAt: endTime,
        durationMinutes,
      },
    });

    console.log(`Ended stream session ${streamSessionId}, duration: ${durationMinutes} minutes`);

    // Capture immediate post-stream snapshot (acts as "during_stream" final snapshot)
    await captureStreamSnapshot(
      streamSessionId,
      'during_stream',
      session.relatedTokenMint,
      session.relatedTokenAddress
    );

    // Note: Post-stream snapshots (1h, 24h) will be captured by the cron job
  } catch (error) {
    console.error('Error ending stream session:', error);
    throw error;
  }
}

/**
 * Get active (ongoing) streams that need snapshots
 */
export async function getActiveStreams(): Promise<any[]> {
  try {
    const activeStreams = await db.streamSession.findMany({
      where: {
        endedAt: null,
        // Only get streams that started within last 6 hours (max reasonable stream length)
        startedAt: {
          gte: new Date(Date.now() - 6 * 60 * 60 * 1000),
        },
      },
      select: {
        id: true,
        userId: true,
        platform: true,
        title: true,
        startedAt: true,
        relatedTokenMint: true,
        relatedTokenAddress: true,
      },
    });

    return activeStreams;
  } catch (error) {
    console.error('Error getting active streams:', error);
    return [];
  }
}

/**
 * Get streams that need post-stream snapshots (1h, 24h after end)
 */
export async function getStreamsNeedingPostSnapshots(): Promise<any[]> {
  try {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const recentStreams = await db.streamSession.findMany({
      where: {
        endedAt: {
          not: null,
          gte: twentyFourHoursAgo,
        },
      },
      select: {
        id: true,
        userId: true,
        endedAt: true,
        relatedTokenMint: true,
        relatedTokenAddress: true,
        tokenSnapshots: {
          select: {
            snapshotType: true,
          },
        },
      },
    });

    return recentStreams;
  } catch (error) {
    console.error('Error getting streams needing post snapshots:', error);
    return [];
  }
}
