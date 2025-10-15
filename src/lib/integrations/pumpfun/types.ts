/**
 * Pump.fun Type Definitions
 */

export interface PumpFunToken {
  mint: string; // Token address
  name: string;
  symbol: string;
  description?: string;
  imageUri?: string;
  metadataUri?: string;

  // Creator info
  creator: string;
  createdTimestamp: number;

  // Trading data
  marketCap: number;
  price: number;
  totalSupply: number; // Always 1 billion

  // Volume metrics
  volume24h: number;
  volumeAllTime: number;

  // Liquidity
  virtualSolReserves: number;
  virtualTokenReserves: number;
  realSolReserves: number;
  realTokenReserves: number;

  // Trading stats
  txCount: number;
  buyerCount: number;
  holderCount: number;

  // Status
  complete: boolean; // Whether bonding curve is complete and migrated to Raydium
  raydiumPool?: string; // Pool address if migrated
  nsfw: boolean;

  // Social
  twitter?: string;
  telegram?: string;
  website?: string;

  // King of the Hill
  kingOfTheHillTimestamp?: number;
  marketCapThreshold?: number;
}

export interface PumpFunTrade {
  signature: string;
  mint: string;
  solAmount: number;
  tokenAmount: number;
  isBuy: boolean;
  user: string;
  timestamp: number;
  newMarketCapSol: number;
  signature: string;
}

export interface PumpFunCreatorStats {
  creator: string;
  tokens: PumpFunToken[];
  totalTokensCreated: number;
  totalVolume: number;
  totalMarketCap: number;
  successfulTokens: number; // Tokens that reached bonding curve completion
  performance: {
    topToken: PumpFunToken | null;
    avgMarketCap: number;
    totalBuyers: number;
    successRate: number; // Percentage of tokens that graduated
  };
  earnings: {
    fromCompletedBondingCurves: number;
    estimatedTotalEarnings: number;
  };
}

export interface PumpFunUserHoldings {
  wallet: string;
  holdings: Array<{
    token: PumpFunToken;
    balance: number;
    valueUsd: number;
    percentageOfSupply: number;
  }>;
  totalValueUsd: number;
  tokenCount: number;
}
