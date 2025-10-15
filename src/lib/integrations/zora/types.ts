/**
 * Zora Creator Coins & Content Coins Types
 */

export interface ZoraCreatorCoin {
  address: string;
  creatorAddress: string;
  name: string;
  symbol: string;
  totalSupply: string;
  marketCap: number; // in USD
  price: number; // in USD
  priceChange24h: number; // percentage
  volume24h: number; // in USD
  volume7d: number; // in USD
  volumeAllTime: number; // in USD
  holderCount: number;
  liquidityPool: number; // 50% of supply
  vestedToCreator: number; // 50% of supply over 5 years
  createdAt: Date;
  isOwnedByWallet?: boolean; // True if this is a holding (not created by wallet)
  balance?: string; // Actual token balance held by the wallet
  percentageOfSupply?: number; // Percentage of total supply held
  holdingsValue?: number; // Dollar value of holdings (balance × price)
}

export interface ZoraContentCoin {
  id: string;
  address: string;
  creatorAddress: string;
  name?: string; // Content Coin name (e.g., "The Real Nomics", "Cartel")
  postId: string;
  postContent?: string;
  postUrl?: string;
  totalSupply: string;
  marketCap: number; // in USD
  price: number; // in USD
  volume24h: number;
  volumeAllTime: number;
  holderCount: number;
  creatorAllocation: number; // 10M tokens
  marketAllocation: number; // 990M tokens
  createdAt: Date;
  isOwnedByWallet?: boolean; // True if this is a holding (not created by wallet)
  balance?: string; // Actual token balance held by the wallet
  percentageOfSupply?: number; // Percentage of total supply held
  holdingsValue?: number; // Dollar value of holdings (balance × price)
  priceChange24h?: number; // 24h price change percentage
}

export interface ZoraCreatorEarnings {
  totalTradingFeesEarned: number; // 50% of trading fees in $ZORA
  totalCreatorCutEarned: number; // 1% of every trade
  vestedTokensValue: number; // Current value of vested creator coins
  totalEarnings: number; // Sum of all earnings
  earningsBreakdown: {
    fromCreatorCoin: number;
    fromContentCoins: number;
    from24h: number;
    from7d: number;
    from30d: number;
  };
}

export interface ZoraCreatorStats {
  creatorAddress: string;
  creatorCoin: ZoraCreatorCoin | null;
  contentCoins: ZoraContentCoin[];
  totalPosts: number;
  earnings: ZoraCreatorEarnings;
  performance: {
    topPost: ZoraContentCoin | null;
    avgPostMarketCap: number;
    totalContentCoinsValue: number;
    holderGrowth24h: number;
    holderGrowth7d: number;
  };
}

export interface ZoraApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
