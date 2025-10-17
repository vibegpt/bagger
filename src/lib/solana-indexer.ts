/**
 * Solana Chain Indexer for Pump.fun Creator Coins
 *
 * This module integrates with the existing Pump.fun client and provides
 * a unified interface matching the Base indexer architecture.
 * Uses:
 * - Solana Web3.js for blockchain data
 * - Existing Pump.fun API client
 * - Chain abstraction layer for normalized data
 */

import { Connection, PublicKey, type ParsedAccountData } from '@solana/web3.js';
import { pumpFunClient } from './integrations/pumpfun/client';
import type { PumpFunToken } from './integrations/pumpfun/types';
import type { TokenMetadata, TokenMetrics } from './chains';

/**
 * Solana RPC client
 */
export const solanaConnection = new Connection(
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
  'confirmed'
);

/**
 * Pump.fun Creator Coin on Solana
 * (Re-export of existing type with additional metadata)
 */
export type { PumpFunToken as SolanaCreatorCoin };

/**
 * Fetch Pump.fun creator coin data from Solana
 */
export async function fetchPumpFunCoin(mintAddress: string): Promise<PumpFunToken | null> {
  try {
    return await pumpFunClient.getToken(mintAddress);
  } catch (error) {
    console.error('Error fetching Pump.fun coin:', error);
    return null;
  }
}

/**
 * Get SPL token metadata from Solana
 */
export async function getSPLTokenMetadata(mintAddress: string): Promise<TokenMetadata | null> {
  try {
    const mintPubkey = new PublicKey(mintAddress);

    // Get token supply
    const supply = await solanaConnection.getTokenSupply(mintPubkey);

    // Try to get Pump.fun data for additional metadata
    const pumpData = await pumpFunClient.getToken(mintAddress);

    if (pumpData) {
      return {
        chainId: 'solana',
        address: mintAddress,
        symbol: pumpData.symbol,
        name: pumpData.name,
        decimals: supply.value.decimals,
        creator: pumpData.creator || '',
        creatorUsername: undefined,
        imageUrl: pumpData.imageUri,
        description: pumpData.description,
      };
    }

    // Fallback to basic metadata
    return {
      chainId: 'solana',
      address: mintAddress,
      symbol: 'UNKNOWN',
      name: mintAddress.slice(0, 8) + '...',
      decimals: supply.value.decimals,
      creator: '',
    };
  } catch (error) {
    console.error('Error fetching SPL token metadata:', error);
    return null;
  }
}

/**
 * Get token balance for a Solana wallet
 */
export async function getSPLTokenBalance(
  mintAddress: string,
  walletAddress: string
): Promise<bigint> {
  try {
    const mintPubkey = new PublicKey(mintAddress);
    const walletPubkey = new PublicKey(walletAddress);

    // Get token accounts for this wallet and mint
    const tokenAccounts = await solanaConnection.getParsedTokenAccountsByOwner(
      walletPubkey,
      { mint: mintPubkey }
    );

    if (tokenAccounts.value.length === 0) {
      return 0n;
    }

    // Sum balances (usually just one account per mint)
    const totalBalance = tokenAccounts.value.reduce((sum, account) => {
      const data = account.account.data as ParsedAccountData;
      const balance = BigInt(data.parsed.info.tokenAmount.amount);
      return sum + balance;
    }, 0n);

    return totalBalance;
  } catch (error) {
    console.error('Error fetching SPL token balance:', error);
    return 0n;
  }
}

/**
 * Get token total supply from Solana
 */
export async function getSPLTokenTotalSupply(mintAddress: string): Promise<bigint> {
  try {
    const mintPubkey = new PublicKey(mintAddress);
    const supply = await solanaConnection.getTokenSupply(mintPubkey);
    return BigInt(supply.value.amount);
  } catch (error) {
    console.error('Error fetching SPL token total supply:', error);
    return 0n;
  }
}

/**
 * Get current Solana slot (similar to block number)
 */
export async function getCurrentSlot(): Promise<number> {
  try {
    const slot = await solanaConnection.getSlot();
    return slot;
  } catch (error) {
    console.error('Error fetching Solana slot:', error);
    return 0;
  }
}

/**
 * Get SOL balance for a wallet
 */
export async function getSOLBalance(address: string): Promise<bigint> {
  try {
    const pubkey = new PublicKey(address);
    const balance = await solanaConnection.getBalance(pubkey);
    return BigInt(balance);
  } catch (error) {
    console.error('Error fetching SOL balance:', error);
    return 0n;
  }
}

/**
 * Search for Pump.fun creator coins
 */
export async function searchPumpFunCoins(query: string): Promise<PumpFunToken[]> {
  try {
    return await pumpFunClient.searchTokens(query);
  } catch (error) {
    console.error('Error searching Pump.fun coins:', error);
    return [];
  }
}

/**
 * Get trending Pump.fun coins
 */
export async function getTrendingPumpFunCoins(limit: number = 10): Promise<PumpFunToken[]> {
  try {
    return await pumpFunClient.getTrendingTokens(limit);
  } catch (error) {
    console.error('Error fetching trending Pump.fun coins:', error);
    return [];
  }
}

/**
 * Get new Pump.fun coins (recently launched)
 */
export async function getNewPumpFunCoins(limit: number = 10): Promise<PumpFunToken[]> {
  try {
    // Pump.fun API doesn't have a "new coins" endpoint yet
    // This would require indexing or using a specialized service
    console.log(`Fetching ${limit} newest Pump.fun coins (not fully implemented)`);
    return [];
  } catch (error) {
    console.error('Error fetching new Pump.fun coins:', error);
    return [];
  }
}

/**
 * Get top Pump.fun coins by market cap
 */
export async function getTopPumpFunCoinsByMarketCap(limit: number = 10): Promise<PumpFunToken[]> {
  try {
    // This would need custom sorting
    const trending = await getTrendingPumpFunCoins(limit);
    return trending.sort((a, b) => b.marketCap - a.marketCap).slice(0, limit);
  } catch (error) {
    console.error('Error fetching top Pump.fun coins:', error);
    return [];
  }
}

/**
 * Get Pump.fun coins held by a wallet
 */
export async function getPumpFunHoldingsByWallet(walletAddress: string): Promise<{
  address: string;
  balance: bigint;
  value: number;
  coin: PumpFunToken;
}[]> {
  try {
    const holdings = await pumpFunClient.getUserHoldings(walletAddress);

    return holdings.holdings.map((holding) => ({
      address: holding.token.mint,
      balance: BigInt(Math.floor(holding.balance * 1e9)), // Convert to lamports
      value: holding.valueUsd,
      coin: holding.token,
    }));
  } catch (error) {
    console.error('Error fetching Pump.fun wallet holdings:', error);
    return [];
  }
}

/**
 * Get creator statistics for Pump.fun
 */
export async function getPumpFunCreatorStats(creatorAddress: string) {
  try {
    return await pumpFunClient.getCreatorStats(creatorAddress);
  } catch (error) {
    console.error('Error fetching Pump.fun creator stats:', error);
    return null;
  }
}

/**
 * Normalize Pump.fun coin data to unified TokenMetrics format
 */
export function normalizePumpFunCoinMetrics(coin: PumpFunToken): TokenMetrics {
  return {
    chainId: 'solana',
    tokenAddress: coin.mint,
    priceUsd: coin.price,
    marketCapUsd: coin.marketCap,
    fullyDilutedValuation: coin.marketCap, // FDV = market cap for Pump.fun coins
    totalSupply: coin.totalSupply,
    circulatingSupply: coin.totalSupply, // All tokens circulating on Pump.fun
    holderCount: coin.holderCount,
    topHolderPercentage: 0, // Not provided by Pump.fun API
    volume24h: coin.volume24h,
    volume7d: 0, // Not provided by API
    volumeAllTime: coin.volumeAllTime,
    liquidityUsd: coin.realSolReserves * 100, // Rough estimate: SOL reserves * price
    priceChange24h: 0, // Not provided directly
    priceChange7d: 0, // Not provided directly
    creatorEarningsTotal: 0, // Would need to calculate from bonding curve
    creatorEarnings24h: 0, // Would need to calculate
    createdAt: new Date(coin.createdTimestamp),
    lastUpdated: new Date(),
  };
}

/**
 * Health check for Solana RPC connection
 */
export async function checkSolanaConnection(): Promise<boolean> {
  try {
    const slot = await getCurrentSlot();
    return slot > 0;
  } catch (error) {
    console.error('Solana connection health check failed:', error);
    return false;
  }
}

/**
 * Get Solana network version info
 */
export async function getSolanaVersion(): Promise<{ solana: string; 'feature-set'?: number } | null> {
  try {
    const version = await solanaConnection.getVersion();
    return version;
  } catch (error) {
    console.error('Error fetching Solana version:', error);
    return null;
  }
}

/**
 * Validate Solana address format
 */
export function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}
