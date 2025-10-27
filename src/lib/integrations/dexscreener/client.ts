/**
 * DexScreener API client for Solana/Pump.fun token data
 * Docs: https://docs.dexscreener.com/api/reference
 *
 * Rate Limits:
 * - 300 requests/minute for token/pair endpoints
 * - 60 requests/minute for boost/profile endpoints
 *
 * No API key required - completely free!
 */

interface DexScreenerPair {
  chainId: string; // 'solana'
  dexId: string; // 'raydium', 'pumpfun'
  url: string;
  pairAddress: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  quoteToken: {
    address: string;
    name: string;
    symbol: string;
  };
  priceNative: string;
  priceUsd?: string;
  txns: {
    m5: { buys: number; sells: number };
    h1: { buys: number; sells: number };
    h6: { buys: number; sells: number };
    h24: { buys: number; sells: number };
  };
  volume: {
    h24: number;
    h6: number;
    h1: number;
    m5: number;
  };
  priceChange: {
    m5: number;
    h1: number;
    h6: number;
    h24: number;
  };
  liquidity?: {
    usd?: number;
    base: number;
    quote: number;
  };
  fdv?: number; // Fully diluted valuation (market cap)
  pairCreatedAt?: number; // Unix timestamp in milliseconds
}

interface DexScreenerTokenResponse {
  schemaVersion: string;
  pairs: DexScreenerPair[] | null;
}

interface TokenMetricsData {
  mintAddress: string;
  name: string;
  symbol: string;
  imageUrl?: string;
  marketCap: number;
  liquidity: number;
  volume24h: number;
  price: number;
  priceChange24h: number;
  holderCount: number; // Estimated, DexScreener doesn't provide this
  createdAt: Date;
  tokenAgeHours: number;
  uniqueTraders24h: number;
  dexId: string; // 'raydium', 'pumpfun', etc.
}

/**
 * DexScreener API client with rate limiting
 */
export class DexScreenerClient {
  private baseUrl = 'https://api.dexscreener.com/latest';
  private requestQueue: Promise<any>[] = [];
  private requestCount = 0;
  private windowStart = Date.now();
  private readonly MAX_REQUESTS_PER_MINUTE = 300;

  constructor() {
    // No API key needed!
  }

  /**
   * Rate limiting: max 300 requests per minute
   */
  private async waitForRateLimit(): Promise<void> {
    const now = Date.now();
    const windowElapsed = now - this.windowStart;

    // Reset window if more than 60 seconds have passed
    if (windowElapsed >= 60000) {
      this.requestCount = 0;
      this.windowStart = now;
      return;
    }

    // If we've hit the limit, wait until the window resets
    if (this.requestCount >= this.MAX_REQUESTS_PER_MINUTE) {
      const waitTime = 60000 - windowElapsed;
      console.log(`[DexScreener] Rate limit reached, waiting ${Math.ceil(waitTime / 1000)}s`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      this.requestCount = 0;
      this.windowStart = Date.now();
    }

    this.requestCount++;
  }

  /**
   * Get token data by mint address
   */
  async getTokenData(mintAddress: string): Promise<TokenMetricsData | null> {
    try {
      await this.waitForRateLimit();

      const response = await fetch(
        `${this.baseUrl}/dex/tokens/${mintAddress}`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          console.error('[DexScreener] Rate limit exceeded (429)');
          // Wait and retry once
          await new Promise(resolve => setTimeout(resolve, 5000));
          return this.getTokenData(mintAddress);
        }
        console.error(`[DexScreener] Token data failed: ${response.status}`);
        return null;
      }

      const data: DexScreenerTokenResponse = await response.json();

      if (!data.pairs || data.pairs.length === 0) {
        console.log(`[DexScreener] No pairs found for ${mintAddress}`);
        return null;
      }

      // Find the primary pair (usually the one with highest liquidity)
      const primaryPair = data.pairs.reduce((best, current) => {
        const bestLiq = best.liquidity?.usd || 0;
        const currentLiq = current.liquidity?.usd || 0;
        return currentLiq > bestLiq ? current : best;
      });

      // Calculate token age
      const createdAt = primaryPair.pairCreatedAt
        ? new Date(primaryPair.pairCreatedAt)
        : new Date(); // Fallback to now if not available

      const tokenAgeHours = Math.floor(
        (Date.now() - createdAt.getTime()) / (1000 * 60 * 60)
      );

      // Calculate unique traders (sum of buys + sells)
      const uniqueTraders =
        (primaryPair.txns.h24.buys || 0) +
        (primaryPair.txns.h24.sells || 0);

      // Estimate holder count based on unique traders and volume
      // Rough heuristic: holders ≈ unique_traders * 2.5 (many holders don't trade daily)
      const estimatedHolders = Math.floor(uniqueTraders * 2.5);

      return {
        mintAddress,
        name: primaryPair.baseToken.name,
        symbol: primaryPair.baseToken.symbol,
        imageUrl: primaryPair.info?.imageUrl || undefined, // Extract image from DexScreener API
        marketCap: primaryPair.fdv || 0,
        liquidity: primaryPair.liquidity?.usd || 0,
        volume24h: primaryPair.volume.h24 || 0,
        price: parseFloat(primaryPair.priceUsd || '0'),
        priceChange24h: primaryPair.priceChange.h24 || 0,
        holderCount: estimatedHolders,
        createdAt,
        tokenAgeHours,
        uniqueTraders24h: uniqueTraders,
        dexId: primaryPair.dexId,
      };
    } catch (error) {
      console.error(`[DexScreener] Error fetching token ${mintAddress}:`, error);
      return null;
    }
  }

  /**
   * Get multiple tokens in batch (respects rate limits)
   */
  async getTokensBatch(mintAddresses: string[]): Promise<(TokenMetricsData | null)[]> {
    const results: (TokenMetricsData | null)[] = [];

    for (const mintAddress of mintAddresses) {
      const data = await this.getTokenData(mintAddress);
      results.push(data);

      // Small delay between requests to be nice to the API
      if (results.length < mintAddresses.length) {
        await new Promise(resolve => setTimeout(resolve, 200)); // 200ms = max 5 req/sec
      }
    }

    return results;
  }

  /**
   * Get token price history for volatility analysis
   * Note: DexScreener API doesn't provide historical data in free tier
   * For MVP, we'll track this ourselves via snapshots
   */
  async detectPriceCrash(
    mintAddress: string,
    recentSnapshots: Array<{ timestamp: Date; price: number }>
  ): Promise<boolean> {
    if (recentSnapshots.length < 2) {
      return false;
    }

    // Find peak price in last 2 hours
    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
    const recentPrices = recentSnapshots.filter(
      s => s.timestamp.getTime() >= twoHoursAgo
    );

    if (recentPrices.length === 0) {
      return false;
    }

    const peak = Math.max(...recentPrices.map(s => s.price));
    const current = recentPrices[recentPrices.length - 1].price;

    // Check for >80% crash from peak
    const crashDetected = current < peak * 0.2;

    if (crashDetected) {
      console.warn(
        `[DexScreener] Price crash detected for ${mintAddress}: ${peak} → ${current} (${((1 - current / peak) * 100).toFixed(1)}% drop)`
      );
    }

    return crashDetected;
  }

  /**
   * Detect liquidity drain by comparing snapshots
   */
  async detectLiquidityDrain(
    recentSnapshots: Array<{ timestamp: Date; liquidity: number }>
  ): Promise<boolean> {
    if (recentSnapshots.length < 2) {
      return false;
    }

    // Check last 30 minutes
    const thirtyMinsAgo = Date.now() - 30 * 60 * 1000;
    const recentLiquidity = recentSnapshots.filter(
      s => s.timestamp.getTime() >= thirtyMinsAgo
    );

    if (recentLiquidity.length < 2) {
      return false;
    }

    const initial = recentLiquidity[0].liquidity;
    const current = recentLiquidity[recentLiquidity.length - 1].liquidity;

    // Check for >50% drain
    const drainDetected = current < initial * 0.5;

    if (drainDetected) {
      console.warn(
        `[DexScreener] Liquidity drain detected: ${initial} → ${current} (${((1 - current / initial) * 100).toFixed(1)}% drained)`
      );
    }

    return drainDetected;
  }

  /**
   * Calculate distinct trading hours from transaction data
   */
  calculateDistinctTradingHours(txns: DexScreenerPair['txns']): number {
    // DexScreener provides aggregated buckets, not hour-by-hour
    // Estimate based on activity across different time windows

    const hasM5Activity = (txns.m5.buys + txns.m5.sells) > 0;
    const hasH1Activity = (txns.h1.buys + txns.h1.sells) > 0;
    const hasH6Activity = (txns.h6.buys + txns.h6.sells) > 0;
    const hasH24Activity = (txns.h24.buys + txns.h24.sells) > 0;

    // Very rough estimate:
    // If trading in multiple windows, assume distributed activity
    if (!hasH24Activity) return 0;
    if (!hasH6Activity) return Math.min(Math.floor(txns.h24.buys + txns.h24.sells / 10), 6);
    if (!hasH1Activity) return Math.min(Math.floor((txns.h6.buys + txns.h6.sells) / 5), 12);

    // If active in all windows, estimate higher distinct hours
    const totalTxns24h = txns.h24.buys + txns.h24.sells;
    return Math.min(Math.floor(totalTxns24h / 10), 24); // Rough: 10 txns per hour = 1 distinct hour
  }
}

export const dexScreenerClient = new DexScreenerClient();
