/**
 * CoinGecko API Client for Creator Coin Social Metrics
 *
 * Free API - No authentication required
 * Rate Limit: 30 calls/minute (Demo/Free tier)
 * Docs: https://docs.coingecko.com/reference/introduction
 */

export interface CoinGeckoSocialData {
  twitterFollowers: number | null;
  redditSubscribers: number | null;
  telegramUsers: number | null;
  facebookLikes: number | null;
  communityScore: number | null;
  sentimentUpPercentage: number | null;
  sentimentDownPercentage: number | null;
}

export interface CoinGeckoCoinData {
  id: string;
  symbol: string;
  name: string;
  categories: string[];
  communityData: {
    twitter_followers: number | null;
    reddit_subscribers: number | null;
    telegram_channel_user_count: number | null;
    facebook_likes: number | null;
  };
  communityScore: number | null;
  sentimentVotesUpPercentage: number | null;
  sentimentVotesDownPercentage: number | null;
  marketData: {
    currentPrice: number | null;
    marketCap: number | null;
    totalVolume: number | null;
  };
}

export interface CreatorCoinCategory {
  id: string;
  name: string;
  marketCap: number;
  volume24h: number;
  marketCapChange24h: number;
  topCoins: string[]; // Array of coin IDs
}

/**
 * CoinGecko API Client
 */
export class CoinGeckoClient {
  private baseUrl = 'https://api.coingecko.com/api/v3';
  private requestCount = 0;
  private windowStart = Date.now();
  private readonly MAX_REQUESTS_PER_MINUTE = 30; // Free tier limit

  /**
   * Rate limiting: max 30 requests per minute (free tier)
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
      console.log(`[CoinGecko] Rate limit reached, waiting ${Math.ceil(waitTime / 1000)}s`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      this.requestCount = 0;
      this.windowStart = Date.now();
    }

    this.requestCount++;
  }

  /**
   * Get all available categories
   */
  async getCategories(): Promise<CreatorCoinCategory[]> {
    try {
      await this.waitForRateLimit();

      const response = await fetch(
        `${this.baseUrl}/coins/categories`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        console.error(`[CoinGecko] Categories failed: ${response.status}`);
        return [];
      }

      const data = await response.json();

      return data.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        marketCap: cat.market_cap || 0,
        volume24h: cat.volume_24h || 0,
        marketCapChange24h: cat.market_cap_change_24h || 0,
        topCoins: cat.top_3_coins || [],
      }));
    } catch (error) {
      console.error('[CoinGecko] Error fetching categories:', error);
      return [];
    }
  }

  /**
   * Find creator coin category
   */
  async getCreatorCoinCategory(): Promise<CreatorCoinCategory | null> {
    const categories = await this.getCategories();

    // Look for creator coin related categories
    const creatorCategory = categories.find(cat =>
      cat.name.toLowerCase().includes('creator') ||
      cat.name.toLowerCase().includes('content creator') ||
      cat.id.includes('creator')
    );

    return creatorCategory || null;
  }

  /**
   * Get coins in a specific category
   */
  async getCoinsByCategory(categoryId: string): Promise<string[]> {
    try {
      await this.waitForRateLimit();

      const response = await fetch(
        `${this.baseUrl}/coins/markets?vs_currency=usd&category=${categoryId}&order=market_cap_desc&per_page=250&page=1`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        console.error(`[CoinGecko] Category coins failed: ${response.status}`);
        return [];
      }

      const data = await response.json();
      return data.map((coin: any) => coin.id);
    } catch (error) {
      console.error('[CoinGecko] Error fetching category coins:', error);
      return [];
    }
  }

  /**
   * Get detailed coin data including social metrics
   */
  async getCoinData(coinId: string): Promise<CoinGeckoCoinData | null> {
    try {
      await this.waitForRateLimit();

      const response = await fetch(
        `${this.baseUrl}/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=true&developer_data=false&sparkline=false`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          console.log(`[CoinGecko] Coin not found: ${coinId}`);
          return null;
        }
        console.error(`[CoinGecko] Coin data failed: ${response.status}`);
        return null;
      }

      const data = await response.json();

      return {
        id: data.id,
        symbol: data.symbol,
        name: data.name,
        categories: data.categories || [],
        communityData: {
          twitter_followers: data.community_data?.twitter_followers || null,
          reddit_subscribers: data.community_data?.reddit_subscribers || null,
          telegram_channel_user_count: data.community_data?.telegram_channel_user_count || null,
          facebook_likes: data.community_data?.facebook_likes || null,
        },
        communityScore: data.community_score || null,
        sentimentVotesUpPercentage: data.sentiment_votes_up_percentage || null,
        sentimentVotesDownPercentage: data.sentiment_votes_down_percentage || null,
        marketData: {
          currentPrice: data.market_data?.current_price?.usd || null,
          marketCap: data.market_data?.market_cap?.usd || null,
          totalVolume: data.market_data?.total_volume?.usd || null,
        },
      };
    } catch (error) {
      console.error(`[CoinGecko] Error fetching coin ${coinId}:`, error);
      return null;
    }
  }

  /**
   * Get social metrics only (lighter call)
   */
  async getSocialMetrics(coinId: string): Promise<CoinGeckoSocialData | null> {
    const coinData = await this.getCoinData(coinId);

    if (!coinData) {
      return null;
    }

    return {
      twitterFollowers: coinData.communityData.twitter_followers,
      redditSubscribers: coinData.communityData.reddit_subscribers,
      telegramUsers: coinData.communityData.telegram_channel_user_count,
      facebookLikes: coinData.communityData.facebook_likes,
      communityScore: coinData.communityScore,
      sentimentUpPercentage: coinData.sentimentVotesUpPercentage,
      sentimentDownPercentage: coinData.sentimentVotesDownPercentage,
    };
  }

  /**
   * Search for coin by symbol or name
   */
  async searchCoin(query: string): Promise<{ id: string; symbol: string; name: string }[]> {
    try {
      await this.waitForRateLimit();

      const response = await fetch(
        `${this.baseUrl}/search?query=${encodeURIComponent(query)}`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        console.error(`[CoinGecko] Search failed: ${response.status}`);
        return [];
      }

      const data = await response.json();

      return data.coins.map((coin: any) => ({
        id: coin.id,
        symbol: coin.symbol,
        name: coin.name,
      }));
    } catch (error) {
      console.error('[CoinGecko] Error searching coins:', error);
      return [];
    }
  }

  /**
   * Get multiple coins' social data in batch
   */
  async getSocialMetricsBatch(coinIds: string[]): Promise<Map<string, CoinGeckoSocialData>> {
    const results = new Map<string, CoinGeckoSocialData>();

    for (const coinId of coinIds) {
      const metrics = await this.getSocialMetrics(coinId);

      if (metrics) {
        results.set(coinId, metrics);
      }

      // Small delay between requests to be nice to the API
      if (results.size < coinIds.length) {
        await new Promise(resolve => setTimeout(resolve, 500)); // 500ms = 2 req/sec
      }
    }

    return results;
  }

  /**
   * Check if coin is in creator coins category
   */
  async isCreatorCoin(coinId: string): Promise<boolean> {
    const coinData = await this.getCoinData(coinId);

    if (!coinData) {
      return false;
    }

    // Check if any category includes "creator"
    return coinData.categories.some(cat =>
      cat.toLowerCase().includes('creator')
    );
  }
}

// Singleton instance
export const coinGeckoClient = new CoinGeckoClient();
