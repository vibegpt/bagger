/**
 * Pump.fun API Client for Token Analytics
 */

import { Connection, PublicKey } from "@solana/web3.js";
import type { PumpFunToken, PumpFunCreatorStats, PumpFunUserHoldings } from "./types";

const PUMP_FUN_API = "https://frontend-api.pump.fun";
const PUMP_FUN_COINS_API = "https://frontend-api.pump.fun/coins";
// Use Helius RPC for better performance and reliability
const SOLANA_RPC = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";

export class PumpFunClient {
  /**
   * Get token data by mint address
   */
  async getToken(mintAddress: string): Promise<PumpFunToken | null> {
    try {
      const response = await fetch(`${PUMP_FUN_COINS_API}/${mintAddress}`);

      if (!response.ok) {
        console.error("Failed to fetch token:", response.statusText);
        return null;
      }

      const data = await response.json();

      if (!data) {
        return null;
      }

      return {
        mint: data.mint || mintAddress,
        name: data.name || "Unknown",
        symbol: data.symbol || "UNKNOWN",
        description: data.description,
        imageUri: data.image_uri || data.imageUri,
        metadataUri: data.metadata_uri || data.metadataUri,

        creator: data.creator,
        createdTimestamp: data.created_timestamp || Date.now(),

        marketCap: parseFloat(data.usd_market_cap || data.market_cap || "0"),
        price: parseFloat(data.price || "0"),
        totalSupply: 1_000_000_000, // All pump.fun tokens have 1B supply

        volume24h: parseFloat(data.volume_24h || "0"),
        volumeAllTime: parseFloat(data.total_volume || "0"),

        virtualSolReserves: parseFloat(data.virtual_sol_reserves || "0"),
        virtualTokenReserves: parseFloat(data.virtual_token_reserves || "0"),
        realSolReserves: parseFloat(data.real_sol_reserves || "0"),
        realTokenReserves: parseFloat(data.real_token_reserves || "0"),

        txCount: parseInt(data.tx_count || "0"),
        buyerCount: parseInt(data.buyer_count || "0"),
        holderCount: parseInt(data.holder_count || "0"),

        complete: data.complete || false,
        raydiumPool: data.raydium_pool,
        nsfw: data.nsfw || false,

        twitter: data.twitter,
        telegram: data.telegram,
        website: data.website,

        kingOfTheHillTimestamp: data.king_of_the_hill_timestamp,
        marketCapThreshold: data.market_cap_threshold,
      };
    } catch (error) {
      console.error("Error fetching token:", error);
      return null;
    }
  }

  /**
   * Get all tokens created by a specific creator
   */
  async getCreatorTokens(creatorAddress: string): Promise<PumpFunToken[]> {
    try {
      // The API doesn't have a direct endpoint for creator tokens,
      // so we'll need to fetch from the general coins endpoint and filter
      // or use alternative methods. For now, return empty array.
      // In production, you'd want to use a blockchain indexer like Helius or Moralis
      console.warn("getCreatorTokens: Not implemented - requires blockchain indexer");
      return [];
    } catch (error) {
      console.error("Error fetching creator tokens:", error);
      return [];
    }
  }

  /**
   * Get creator statistics
   */
  async getCreatorStats(creatorAddress: string): Promise<PumpFunCreatorStats> {
    try {
      const tokens = await this.getCreatorTokens(creatorAddress);

      const totalVolume = tokens.reduce((sum, t) => sum + t.volumeAllTime, 0);
      const totalMarketCap = tokens.reduce((sum, t) => sum + t.marketCap, 0);
      const successfulTokens = tokens.filter((t) => t.complete).length;

      const topToken =
        tokens.length > 0
          ? tokens.reduce((max, t) => (t.marketCap > max.marketCap ? t : max))
          : null;

      const avgMarketCap = tokens.length > 0 ? totalMarketCap / tokens.length : 0;
      const totalBuyers = tokens.reduce((sum, t) => sum + t.buyerCount, 0);
      const successRate = tokens.length > 0 ? (successfulTokens / tokens.length) * 100 : 0;

      // Estimate earnings (creator gets tokens in bonding curve)
      const fromCompletedBondingCurves = successfulTokens * 50_000; // Rough estimate
      const estimatedTotalEarnings = fromCompletedBondingCurves;

      return {
        creator: creatorAddress,
        tokens,
        totalTokensCreated: tokens.length,
        totalVolume,
        totalMarketCap,
        successfulTokens,
        performance: {
          topToken,
          avgMarketCap,
          totalBuyers,
          successRate,
        },
        earnings: {
          fromCompletedBondingCurves,
          estimatedTotalEarnings,
        },
      };
    } catch (error) {
      console.error("Error fetching creator stats:", error);
      throw error;
    }
  }

  /**
   * Get token metadata from DexScreener (works for graduated tokens)
   */
  async getTokenMetadata(mintAddress: string): Promise<{ name: string; symbol: string; imageUri?: string } | null> {
    try {
      const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${mintAddress}`);

      if (!response.ok) {
        console.log(`DexScreener API error for ${mintAddress}`);
        return null;
      }

      const data = await response.json();

      if (!data.pairs || data.pairs.length === 0) {
        console.log(`No DEX data found for ${mintAddress}`);
        return null;
      }

      // Get the first pair (usually the most liquid)
      const pair = data.pairs[0];
      const baseToken = pair.baseToken;

      const name = baseToken.name || mintAddress.slice(0, 8) + "...";
      const symbol = baseToken.symbol || "UNKNOWN";
      const imageUri = pair.info?.imageUrl;

      console.log(`Got DexScreener metadata for ${mintAddress}: ${name} (${symbol})`);
      return { name, symbol, imageUri };
    } catch (error) {
      console.error(`Error fetching token metadata from DexScreener for ${mintAddress}:`, error);
      return null;
    }
  }

  /**
   * Get token price from Jupiter API (fallback when Pump.fun doesn't have data)
   */
  async getTokenPriceFromJupiter(mintAddress: string): Promise<number> {
    try {
      const response = await fetch(`https://price.jup.ag/v4/price?ids=${mintAddress}`);

      if (!response.ok) {
        return 0;
      }

      const data = await response.json();
      const priceData = data.data?.[mintAddress];

      if (priceData?.price) {
        console.log(`Got price from Jupiter for ${mintAddress}: $${priceData.price}`);
        return priceData.price;
      }

      return 0;
    } catch (error) {
      console.error("Error fetching price from Jupiter:", error);
      return 0;
    }
  }

  /**
   * Get user's token holdings from Solana blockchain
   */
  async getUserHoldings(walletAddress: string): Promise<PumpFunUserHoldings> {
    try {
      const connection = new Connection(SOLANA_RPC, "confirmed");
      const walletPubkey = new PublicKey(walletAddress);

      // Get all token accounts for this wallet
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        walletPubkey,
        { programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA") }
      );

      const holdings: Array<{
        token: PumpFunToken;
        balance: number;
        valueUsd: number;
      }> = [];

      let totalValueUsd = 0;

      // For each token account, try to fetch Pump.fun data
      console.log(`Found ${tokenAccounts.value.length} token accounts for wallet`);

      for (const accountInfo of tokenAccounts.value) {
        const parsedInfo = accountInfo.account.data.parsed.info;
        const mint = parsedInfo.mint;
        const balance = parseFloat(parsedInfo.tokenAmount.uiAmount || "0");

        console.log(`Checking token: ${mint}, balance: ${balance}`);

        // Skip if no balance
        if (balance === 0) {
          console.log(`Skipping ${mint} - zero balance`);
          continue;
        }

        // Try to fetch token data from Pump.fun
        let tokenData = await this.getToken(mint);

        if (tokenData) {
          console.log(`Found Pump.fun token: ${tokenData.name} (${tokenData.symbol})`);
          const valueUsd = balance * tokenData.price;
          holdings.push({
            token: tokenData,
            balance,
            valueUsd,
          });
          totalValueUsd += valueUsd;
        } else {
          console.log(`Token ${mint} not found on Pump.fun - creating fallback entry`);

          // Try to get metadata from Solana blockchain
          const metadata = await this.getTokenMetadata(mint);

          // Get price from Jupiter as fallback
          const price = await this.getTokenPriceFromJupiter(mint);

          // Create fallback token data using on-chain info and Jupiter price
          const fallbackToken: PumpFunToken = {
            mint,
            name: metadata?.name || mint.slice(0, 8) + "...", // Use metadata name or shortened address
            symbol: metadata?.symbol || "UNKNOWN",
            description: "Token not found in Pump.fun database (may have graduated to Raydium)",
            imageUri: metadata?.imageUri,
            metadataUri: undefined,
            creator: undefined,
            createdTimestamp: Date.now(),
            marketCap: 0,
            price,
            totalSupply: 0,
            volume24h: 0,
            volumeAllTime: 0,
            virtualSolReserves: 0,
            virtualTokenReserves: 0,
            realSolReserves: 0,
            realTokenReserves: 0,
            txCount: 0,
            buyerCount: 0,
            holderCount: 0,
            complete: true, // Assume graduated since not in pump.fun
            raydiumPool: undefined,
            nsfw: false,
            twitter: undefined,
            telegram: undefined,
            website: undefined,
            kingOfTheHillTimestamp: undefined,
            marketCapThreshold: undefined,
          };

          const valueUsd = balance * price;
          holdings.push({
            token: fallbackToken,
            balance,
            valueUsd,
          });
          totalValueUsd += valueUsd;

          console.log(`Added fallback token entry: ${metadata?.name || mint.slice(0, 8) + "..."} (${metadata?.symbol || "UNKNOWN"}), price: $${price}, value: $${valueUsd}`);
        }
      }

      console.log(`Total Pump.fun holdings found: ${holdings.length}`);

      return {
        wallet: walletAddress,
        holdings,
        totalValueUsd,
        tokenCount: holdings.length,
      };
    } catch (error) {
      console.error("Error fetching user holdings:", error);
      return {
        wallet: walletAddress,
        holdings: [],
        totalValueUsd: 0,
        tokenCount: 0,
      };
    }
  }

  /**
   * Search for tokens by name or symbol
   */
  async searchTokens(query: string): Promise<PumpFunToken[]> {
    try {
      // The API might have a search endpoint, or we'd need to fetch and filter
      console.warn("searchTokens: Not fully implemented");
      return [];
    } catch (error) {
      console.error("Error searching tokens:", error);
      return [];
    }
  }

  /**
   * Get trending tokens from king-of-the-hill endpoint
   */
  async getTrendingTokens(limit: number = 10): Promise<PumpFunToken[]> {
    try {
      // Use king-of-the-hill endpoint which shows trending/popular tokens
      const response = await fetch(`${PUMP_FUN_COINS_API}/king-of-the-hill`);

      if (!response.ok) {
        console.error("Failed to fetch trending tokens:", response.statusText);
        return [];
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        console.error("Unexpected response format from king-of-the-hill");
        return [];
      }

      // Transform the data to match our PumpFunToken interface
      const tokens: PumpFunToken[] = data.slice(0, limit).map((token: any) => ({
        mint: token.mint,
        name: token.name || "Unknown",
        symbol: token.symbol || "UNKNOWN",
        description: token.description,
        imageUri: token.image_uri || token.image,
        metadataUri: token.metadata_uri,
        creator: token.creator,
        createdTimestamp: token.created_timestamp || Date.now(),
        marketCap: parseFloat(token.usd_market_cap || token.market_cap || "0"),
        price: parseFloat(token.price || "0"),
        totalSupply: 1_000_000_000,
        volume24h: parseFloat(token.volume_24h || "0"),
        volumeAllTime: parseFloat(token.total_volume || "0"),
        virtualSolReserves: parseFloat(token.virtual_sol_reserves || "0"),
        virtualTokenReserves: parseFloat(token.virtual_token_reserves || "0"),
        realSolReserves: parseFloat(token.real_sol_reserves || "0"),
        realTokenReserves: parseFloat(token.real_token_reserves || "0"),
        txCount: parseInt(token.tx_count || "0"),
        buyerCount: parseInt(token.buyer_count || "0"),
        holderCount: parseInt(token.holder_count || token.replies || "0"),
        complete: token.complete || false,
        raydiumPool: token.raydium_pool,
        nsfw: token.nsfw || false,
        twitter: token.twitter,
        telegram: token.telegram,
        website: token.website,
        kingOfTheHillTimestamp: token.king_of_the_hill_timestamp,
        marketCapThreshold: token.market_cap_threshold,
      }));

      return tokens;
    } catch (error) {
      console.error("Error fetching trending tokens:", error);
      return [];
    }
  }
}

// Singleton instance
export const pumpFunClient = new PumpFunClient();
