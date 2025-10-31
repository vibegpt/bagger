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
 * Fetch token data from Zora API (Base network)
 */
async function fetchZoraTokenData(tokenAddress: string): Promise<TokenData | null> {
  try {
    // Zora API endpoint for token data on Base (chain ID 8453)
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
 * Create a token snapshot for content (video/post)
 * Captures token performance at time of content publication
 */
export async function createContentTokenSnapshot(
  contentId: string,
  snapshotType: 'before_post' | 'post_1h' | 'post_6h' | 'post_24h' | 'post_7d',
  tokenMint?: string | null,
  tokenAddress?: string | null
): Promise<void> {
  if (!tokenMint && !tokenAddress) {
    console.log('No token specified for content snapshot');
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
      console.error('Failed to fetch token data for content snapshot');
      return;
    }

    // Create snapshot in database
    await db.contentTokenSnapshot.create({
      data: {
        contentId,
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

    console.log(`Created ${snapshotType} snapshot for content ${contentId}`);
  } catch (error) {
    console.error('Error creating content token snapshot:', error);
    throw error;
  }
}

/**
 * Capture immediate "before_post" snapshot for newly published content
 * This should be called when content is first synced
 */
export async function captureContentPublishSnapshot(
  contentId: string,
  tokenMint?: string | null,
  tokenAddress?: string | null
): Promise<void> {
  await createContentTokenSnapshot(contentId, 'before_post', tokenMint, tokenAddress);
}

/**
 * Capture post-publication snapshots (1h, 6h, 24h, 7d after content)
 * This would typically be called by a cron job
 */
export async function capturePostPublicationSnapshots(
  contentId: string,
  publishedAt: Date,
  tokenMint?: string | null,
  tokenAddress?: string | null
): Promise<void> {
  const now = new Date();
  const timeSincePublish = now.getTime() - publishedAt.getTime();

  // Calculate time thresholds (in milliseconds)
  const ONE_HOUR = 60 * 60 * 1000;
  const SIX_HOURS = 6 * 60 * 60 * 1000;
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
  const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

  // Check if we need to capture each snapshot
  // Only capture if time threshold has passed and snapshot doesn't exist yet

  try {
    // Check existing snapshots
    const existingSnapshots = await db.contentTokenSnapshot.findMany({
      where: { contentId },
      select: { snapshotType: true },
    });

    const existingTypes = new Set(existingSnapshots.map((s) => s.snapshotType));

    // Capture 1h snapshot
    if (timeSincePublish >= ONE_HOUR && !existingTypes.has('post_1h')) {
      await createContentTokenSnapshot(contentId, 'post_1h', tokenMint, tokenAddress);
    }

    // Capture 6h snapshot
    if (timeSincePublish >= SIX_HOURS && !existingTypes.has('post_6h')) {
      await createContentTokenSnapshot(contentId, 'post_6h', tokenMint, tokenAddress);
    }

    // Capture 24h snapshot
    if (timeSincePublish >= TWENTY_FOUR_HOURS && !existingTypes.has('post_24h')) {
      await createContentTokenSnapshot(contentId, 'post_24h', tokenMint, tokenAddress);
    }

    // Capture 7d snapshot
    if (timeSincePublish >= SEVEN_DAYS && !existingTypes.has('post_7d')) {
      await createContentTokenSnapshot(contentId, 'post_7d', tokenMint, tokenAddress);
    }
  } catch (error) {
    console.error('Error capturing post-publication snapshots:', error);
  }
}

/**
 * Calculate price impact from content publication
 * Returns percentage change in price after content was published
 */
export async function calculateContentPriceImpact(
  contentId: string
): Promise<{
  impact1h?: number;
  impact6h?: number;
  impact24h?: number;
  impact7d?: number;
} | null> {
  try {
    // Get all snapshots for this content
    const snapshots = await db.contentTokenSnapshot.findMany({
      where: { contentId },
      orderBy: { snapshotTime: 'asc' },
    });

    if (snapshots.length === 0) {
      return null;
    }

    // Find baseline (before_post snapshot)
    const baseline = snapshots.find((s) => s.snapshotType === 'before_post');
    if (!baseline) {
      return null;
    }

    const baselinePrice = parseFloat(baseline.price.toString());

    // Calculate impact for each time period
    const result: {
      impact1h?: number;
      impact6h?: number;
      impact24h?: number;
      impact7d?: number;
    } = {};

    const post1h = snapshots.find((s) => s.snapshotType === 'post_1h');
    if (post1h) {
      const price = parseFloat(post1h.price.toString());
      result.impact1h = ((price - baselinePrice) / baselinePrice) * 100;
    }

    const post6h = snapshots.find((s) => s.snapshotType === 'post_6h');
    if (post6h) {
      const price = parseFloat(post6h.price.toString());
      result.impact6h = ((price - baselinePrice) / baselinePrice) * 100;
    }

    const post24h = snapshots.find((s) => s.snapshotType === 'post_24h');
    if (post24h) {
      const price = parseFloat(post24h.price.toString());
      result.impact24h = ((price - baselinePrice) / baselinePrice) * 100;
    }

    const post7d = snapshots.find((s) => s.snapshotType === 'post_7d');
    if (post7d) {
      const price = parseFloat(post7d.price.toString());
      result.impact7d = ((price - baselinePrice) / baselinePrice) * 100;
    }

    return result;
  } catch (error) {
    console.error('Error calculating content price impact:', error);
    return null;
  }
}

/**
 * Get content with the highest positive token impact
 * Useful for showing "your best performing content" insights
 */
export async function getTopImpactContent(
  userId: string,
  limit: number = 10
): Promise<Array<{
  contentId: string;
  title: string;
  impact24h: number;
  publishedAt: Date;
}>> {
  try {
    // Get all content with token associations
    const content = await db.contentPerformance.findMany({
      where: {
        userId,
        OR: [
          { relatedTokenMint: { not: null } },
          { relatedTokenAddress: { not: null } },
        ],
      },
      include: {
        tokenSnapshots: {
          where: {
            snapshotType: { in: ['before_post', 'post_24h'] },
          },
        },
      },
    });

    // Calculate impact for each piece of content
    const contentWithImpact = content
      .map((item) => {
        const baseline = item.tokenSnapshots.find((s) => s.snapshotType === 'before_post');
        const post24h = item.tokenSnapshots.find((s) => s.snapshotType === 'post_24h');

        if (!baseline || !post24h) {
          return null;
        }

        const baselinePrice = parseFloat(baseline.price.toString());
        const post24hPrice = parseFloat(post24h.price.toString());
        const impact = ((post24hPrice - baselinePrice) / baselinePrice) * 100;

        return {
          contentId: item.id,
          title: item.title || 'Untitled',
          impact24h: impact,
          publishedAt: item.publishedAt,
        };
      })
      .filter((item) => item !== null) as Array<{
      contentId: string;
      title: string;
      impact24h: number;
      publishedAt: Date;
    }>;

    // Sort by impact (highest first) and return top N
    return contentWithImpact.sort((a, b) => b.impact24h - a.impact24h).slice(0, limit);
  } catch (error) {
    console.error('Error getting top impact content:', error);
    return [];
  }
}
