/**
 * Zora API Client for Creator Coins & Content Coins
 */

import { createPublicClient, http, type Address } from 'viem';
import { base } from 'viem/chains';
import { getCoin, getProfileCoins, getProfile, getProfileBalances, setApiKey } from '@zoralabs/coins-sdk';
import type { ZoraCreatorCoin, ZoraContentCoin, ZoraCreatorStats, ZoraCreatorEarnings } from './types';

const BASE_NETWORK_RPC = 'https://mainnet.base.org';

export class ZoraClient {
  private publicClient;

  constructor() {
    this.publicClient = createPublicClient({
      chain: base,
      transport: http(BASE_NETWORK_RPC),
    });

    // Set API key if available
    if (process.env.NEXT_PUBLIC_ZORA_API_KEY) {
      setApiKey(process.env.NEXT_PUBLIC_ZORA_API_KEY);
    }
  }

  /**
   * Get creator's Creator Coin data
   */
  async getCreatorCoin(creatorAddress: Address): Promise<ZoraCreatorCoin | null> {
    try {
      // Get profile first to find the creator coin
      const profileResult = await getProfile({
        address: creatorAddress,
      });

      if (!profileResult.data?.profile?.creatorCoin) {
        return null;
      }

      const coinAddress = profileResult.data.profile.creatorCoin.address;

      // Get detailed coin data
      const coinResult = await getCoin({
        address: coinAddress,
        chain: base.id,
      });

      const coin = coinResult.data?.zora20Token;
      if (!coin) {
        return null;
      }

      return {
        address: coin.address,
        creatorAddress: coin.creatorAddress || creatorAddress,
        name: coin.name,
        symbol: coin.symbol,
        totalSupply: coin.totalSupply,
        marketCap: parseFloat(coin.marketCap),
        price: parseFloat(coin.marketCap) / parseFloat(coin.totalSupply),
        priceChange24h: parseFloat(coin.marketCapDelta24h || '0'),
        volume24h: parseFloat(coin.volume24h || '0'),
        volume7d: 0, // Not available in API
        volumeAllTime: parseFloat(coin.totalVolume || '0'),
        holderCount: 0, // Not available in API
        liquidityPool: parseFloat(coin.totalSupply) * 0.5,
        vestedToCreator: parseFloat(coin.totalSupply) * 0.5,
        createdAt: coin.createdAt ? new Date(coin.createdAt) : new Date(),
      };
    } catch (error) {
      console.error('Error fetching creator coin:', error);
      return null;
    }
  }

  /**
   * Get all Content Coins (posts) by creator
   */
  async getCreatorContentCoins(creatorAddress: Address): Promise<ZoraContentCoin[]> {
    try {
      const result = await getProfileCoins({
        address: creatorAddress,
      });

      const coins = result.data?.coins || [];

      return coins
        .filter((coin) => coin.creatorAddress?.toLowerCase() === creatorAddress.toLowerCase())
        .map((coin) => ({
          id: coin.id,
          address: coin.address,
          creatorAddress: coin.creatorAddress || creatorAddress,
          name: coin.name || undefined, // Add name field for Content Coins
          postId: coin.id, // Use coin ID as post ID
          postContent: coin.description || undefined,
          postUrl: coin.tokenUri || undefined,
          totalSupply: coin.totalSupply,
          marketCap: parseFloat(coin.marketCap),
          price: parseFloat(coin.marketCap) / parseFloat(coin.totalSupply),
          volume24h: parseFloat(coin.volume24h || '0'),
          volumeAllTime: parseFloat(coin.totalVolume || '0'),
          holderCount: 0, // Not available in API
          creatorAllocation: 10_000_000, // 10M tokens to creator
          marketAllocation: 990_000_000, // 990M tokens to market
          createdAt: coin.createdAt ? new Date(coin.createdAt) : new Date(),
        }));
    } catch (error) {
      console.error('Error fetching content coins:', error);
      return [];
    }
  }

  /**
   * Get ALL coins held in wallet (not just created by this address)
   * Returns both Creator Coins and Content Coins that the wallet holds
   * Uses getProfileBalances to fetch actual token balances
   */
  async getWalletHoldings(walletAddress: Address): Promise<{
    creatorCoins: ZoraCreatorCoin[];
    contentCoins: ZoraContentCoin[];
  }> {
    try {
      console.log(`[Zora] Fetching holdings for wallet: ${walletAddress}`);

      // Step 1: Get profile first to find linked wallets (PRIVY, EXTERNAL, SMART_WALLET)
      console.log(`[Zora] Step 1: Looking up profile for identifier: ${walletAddress}`);
      const profileResult = await getProfile({
        identifier: walletAddress,
      });

      console.log(`[Zora] Profile result:`, profileResult);

      // Extract linked wallets from profile
      const linkedWallets = profileResult?.data?.profile?.linkedWallets?.edges?.map(
        (e: any) => e?.node?.walletAddress
      ) ?? [];

      console.log(`[Zora] Found ${linkedWallets.length} linked wallets:`, linkedWallets);

      // Step 2: Use getProfileBalances with the identifier (handle or address)
      // This works for both Zora handles and wallet addresses
      console.log(`[Zora] Step 2: Fetching balances for identifier: ${walletAddress}`);
      const balancesResult = await getProfileBalances({
        identifier: walletAddress,
      });

      console.log(`[Zora] API Response - Success:`, balancesResult.success);
      console.log(`[Zora] API Response - Data:`, balancesResult.data);
      console.log(`[Zora] API Response - Error:`, balancesResult.error);

      // GraphQL response structure: data.profile.coinBalances.edges[]
      const coinBalancesData = balancesResult.data?.profile?.coinBalances;
      const balanceEdges = coinBalancesData?.edges || [];

      console.log(`[Zora] Found ${balanceEdges.length} coin balances for wallet ${walletAddress}`);

      if (balanceEdges.length === 0) {
        console.warn(`[Zora] ⚠️ No balances returned. This could mean:
  1. Wallet has no Zora coins
  2. Address doesn't have a Zora Profile (external wallet issue)
  3. SDK method only returns Creator Coins, not Content Coins
  4. API key permissions issue`);
      }

      const creatorCoins: ZoraCreatorCoin[] = [];
      const contentCoins: ZoraContentCoin[] = [];

      for (const edge of balanceEdges) {
        const balanceNode = edge.node;

        // Skip if no balance
        if (!balanceNode.balance || parseFloat(balanceNode.balance) === 0) {
          continue;
        }

        const coin = balanceNode.coin;
        if (!coin) continue;

        const isCreatedByWallet = coin.creatorAddress?.toLowerCase() === walletAddress.toLowerCase();

        // Total supply is in wei (18 decimals), convert to regular tokens
        // Handle both numeric and scientific notation strings (e.g., "1e-9" = 0.000000001)
        const totalSupplyStr = coin.totalSupply || coin.supply || '0';
        const totalSupplyWei = parseFloat(totalSupplyStr);

        // If totalSupply is invalid (0, NaN, null) OR very small (like 1e-9), use default 1B
        // Otherwise, if it's a large number (> 1000), it's in wei and needs to be divided by 1e18
        let totalSupply = 1_000_000_000; // Default to 1 billion
        if (totalSupplyWei && !isNaN(totalSupplyWei) && totalSupplyWei > 1000) {
          totalSupply = totalSupplyWei / 1e18;
        }

        const marketCap = parseFloat(coin.marketCap || '0');

        // Use API's tokenPrice.priceInUsdc instead of calculating from market cap
        const price = parseFloat(coin.tokenPrice?.priceInUsdc || '0');

        // Balance is in wei (18 decimals), convert to regular tokens
        const balanceWei = parseFloat(balanceNode.balance || '0');
        const balance = balanceWei / 1e18;

        // Calculate percentage of supply held
        const percentageOfSupply = totalSupply > 0 ? (balance / totalSupply) * 100 : 0;

        // Calculate dollar value of holdings
        const holdingsValue = balance * price;

        console.log(`[Zora] Coin ${coin.name}: balance=${balance.toFixed(2)}, totalSupply=${totalSupply.toFixed(0)}, percentage=${percentageOfSupply.toFixed(4)}%, price=${price}, holdingsValue=${holdingsValue.toFixed(2)}`);

        // Determine if it's a Creator Coin or Content Coin
        // Creator Coins typically have higher supply (1B)
        const isCreatorCoin = totalSupply >= 900_000_000; // Creator coins have 1B supply

        if (isCreatorCoin) {
          creatorCoins.push({
            address: coin.address,
            creatorAddress: coin.creatorAddress || walletAddress,
            name: coin.name || 'Unknown',
            symbol: coin.symbol || '',
            totalSupply: totalSupply.toString(), // Use converted value
            marketCap,
            price,
            priceChange24h: parseFloat(coin.marketCapDelta24h || '0'),
            volume24h: parseFloat(coin.volume24h || '0'),
            volume7d: 0,
            volumeAllTime: parseFloat(coin.totalVolume || '0'),
            holderCount: 0,
            liquidityPool: totalSupply * 0.5,
            vestedToCreator: totalSupply * 0.5,
            createdAt: coin.createdAt ? new Date(coin.createdAt) : new Date(),
            isOwnedByWallet: !isCreatedByWallet, // Flag for holdings vs created
            balance: balance.toString(), // Converted balance (from wei)
            percentageOfSupply, // Percentage of total supply held
            holdingsValue, // Dollar value of holdings (balance × price)
            imageUrl: coin.image || coin.imageUrl || coin.metadata?.image || undefined, // Add token image
          });
        } else {
          contentCoins.push({
            id: coin.id || coin.address,
            address: coin.address,
            creatorAddress: coin.creatorAddress || walletAddress,
            name: coin.name || undefined, // Add name field for Content Coins
            postId: coin.id || coin.address,
            postContent: coin.description || undefined,
            postUrl: coin.tokenUri || undefined,
            totalSupply: totalSupply.toString(), // Use converted value
            marketCap,
            price,
            volume24h: parseFloat(coin.volume24h || '0'),
            volumeAllTime: parseFloat(coin.totalVolume || '0'),
            holderCount: 0,
            creatorAllocation: 10_000_000,
            marketAllocation: 990_000_000,
            createdAt: coin.createdAt ? new Date(coin.createdAt) : new Date(),
            isOwnedByWallet: !isCreatedByWallet, // Flag for holdings vs created
            balance: balance.toString(), // Converted balance (from wei)
            percentageOfSupply, // Percentage of total supply held
            holdingsValue, // Dollar value of holdings (balance × price)
            imageUrl: coin.image || coin.imageUrl || coin.metadata?.image || undefined, // Add token image
          });
        }
      }

      console.log(`Processed ${creatorCoins.length} creator coins and ${contentCoins.length} content coins`);

      return {
        creatorCoins,
        contentCoins,
      };
    } catch (error) {
      console.error('Error fetching wallet holdings:', error);
      return {
        creatorCoins: [],
        contentCoins: [],
      };
    }
  }

  /**
   * Get creator's total earnings from Zora
   */
  async getCreatorEarnings(creatorAddress: Address): Promise<ZoraCreatorEarnings> {
    try {
      const [creatorCoin, contentCoins] = await Promise.all([
        this.getCreatorCoin(creatorAddress),
        this.getCreatorContentCoins(creatorAddress),
      ]);

      // Get creator earnings from the creator coin
      let totalTradingFeesEarned = 0;
      let totalCreatorCutEarned = 0;
      let fromCreatorCoin = 0;

      if (creatorCoin) {
        const coinResult = await getCoin({
          address: creatorCoin.address as Address,
          chain: base.id,
        });

        const earnings = coinResult.data?.zora20Token?.creatorEarnings || [];

        earnings.forEach((earning) => {
          const amountUsd = parseFloat(earning.amountUsd || '0');
          totalTradingFeesEarned += amountUsd;
          fromCreatorCoin += amountUsd;
        });

        // Creator cut is 1% of all trading volume
        totalCreatorCutEarned = creatorCoin.volumeAllTime * 0.01;
        fromCreatorCoin += totalCreatorCutEarned;
      }

      // Calculate earnings from content coins
      const fromContentCoins = contentCoins.reduce((sum, coin) => {
        const tradingFees = coin.volumeAllTime * 0.01; // 1% creator cut
        return sum + tradingFees;
      }, 0);

      totalCreatorCutEarned += fromContentCoins;

      const totalEarnings = fromCreatorCoin + fromContentCoins;

      return {
        totalTradingFeesEarned,
        totalCreatorCutEarned,
        vestedTokensValue: creatorCoin ? creatorCoin.vestedToCreator * creatorCoin.price : 0,
        totalEarnings,
        earningsBreakdown: {
          fromCreatorCoin,
          fromContentCoins,
          from24h: 0, // Would need historical data
          from7d: 0, // Would need historical data
          from30d: 0, // Would need historical data
        },
      };
    } catch (error) {
      console.error('Error fetching creator earnings:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive creator stats
   */
  async getCreatorStats(creatorAddress: Address): Promise<ZoraCreatorStats> {
    try {
      const [creatorCoin, contentCoins, earnings] = await Promise.all([
        this.getCreatorCoin(creatorAddress),
        this.getCreatorContentCoins(creatorAddress),
        this.getCreatorEarnings(creatorAddress),
      ]);

      // Calculate performance metrics
      const topPost = contentCoins.length > 0
        ? contentCoins.reduce((max, coin) =>
            coin.marketCap > max.marketCap ? coin : max
          )
        : null;

      const avgPostMarketCap =
        contentCoins.length > 0
          ? contentCoins.reduce((sum, coin) => sum + coin.marketCap, 0) / contentCoins.length
          : 0;

      const totalContentCoinsValue = contentCoins.reduce(
        (sum, coin) => sum + coin.marketCap,
        0
      );

      return {
        creatorAddress,
        creatorCoin,
        contentCoins,
        totalPosts: contentCoins.length,
        earnings,
        performance: {
          topPost,
          avgPostMarketCap,
          totalContentCoinsValue,
          holderGrowth24h: 0, // TODO: Calculate from historical data
          holderGrowth7d: 0, // TODO: Calculate from historical data
        },
      };
    } catch (error) {
      console.error('Error fetching creator stats:', error);
      throw error;
    }
  }

  /**
   * Get current $ZORA token price (for calculating earnings)
   */
  async getZoraTokenPrice(): Promise<number> {
    try {
      // TODO: Fetch $ZORA price from DEX or price API
      // For now return placeholder
      return 0.5; // $0.50 per $ZORA
    } catch (error) {
      console.error('Error fetching ZORA price:', error);
      return 0;
    }
  }
}

// Singleton instance
export const zoraClient = new ZoraClient();
