/**
 * Chain Abstraction Layer
 *
 * This module provides a unified interface for interacting with multiple blockchains:
 * - Base (Ethereum L2) for Zora creator coins
 * - Solana for Pump.fun creator coins
 * - Avalanche for Arena (future)
 *
 * Architecture:
 * - Chain-agnostic data models
 * - Pluggable chain adapters
 * - Unified metrics normalization
 */

export type ChainId = 'base' | 'solana' | 'avalanche';

export interface ChainConfig {
  id: ChainId;
  name: string;
  displayName: string;
  rpcUrl: string;
  explorer: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  color: string; // For UI theming
}

/**
 * Supported blockchain configurations
 */
export const CHAINS: Record<ChainId, ChainConfig> = {
  base: {
    id: 'base',
    name: 'Base',
    displayName: 'Base',
    rpcUrl: process.env.NEXT_PUBLIC_BASE_RPC_URL || '',
    explorer: 'https://basescan.org',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    color: '#0052FF', // Base blue
  },
  solana: {
    id: 'solana',
    name: 'Solana',
    displayName: 'Solana',
    rpcUrl: process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
    explorer: 'https://solscan.io',
    nativeCurrency: {
      name: 'Solana',
      symbol: 'SOL',
      decimals: 9,
    },
    color: '#14F195', // Solana green
  },
  avalanche: {
    id: 'avalanche',
    name: 'Avalanche',
    displayName: 'Avalanche',
    rpcUrl: process.env.NEXT_PUBLIC_AVALANCHE_RPC_URL || 'https://api.avax.network/ext/bc/C/rpc',
    explorer: 'https://snowtrace.io',
    nativeCurrency: {
      name: 'Avalanche',
      symbol: 'AVAX',
      decimals: 18,
    },
    color: '#E84142', // Avalanche red
  },
};

/**
 * Unified token metadata across chains
 */
export interface TokenMetadata {
  chainId: ChainId;
  address: string; // Contract address or mint address
  symbol: string;
  name: string;
  decimals: number;
  creator: string; // Creator wallet address
  creatorUsername?: string;
  imageUrl?: string;
  description?: string;
}

/**
 * Unified token metrics across chains
 */
export interface TokenMetrics {
  chainId: ChainId;
  tokenAddress: string;

  // Price & Market Cap
  priceUsd: number;
  marketCapUsd: number;
  fullyDilutedValuation: number;

  // Supply
  totalSupply: number;
  circulatingSupply: number;

  // Holders
  holderCount: number;
  topHolderPercentage: number; // % held by top holder

  // Trading Volume
  volume24h: number;
  volume7d: number;
  volumeAllTime: number;

  // Liquidity
  liquidityUsd: number;

  // Performance
  priceChange24h: number; // Percentage
  priceChange7d: number;  // Percentage

  // Creator Earnings
  creatorEarningsTotal: number;
  creatorEarnings24h: number;

  // Timestamps
  createdAt: Date;
  lastUpdated: Date;
}

/**
 * Platform-specific token types
 */
export type PlatformType = 'zora' | 'pumpfun' | 'arena';

export interface PlatformMapping {
  chainId: ChainId;
  platform: PlatformType;
  displayName: string;
}

/**
 * Map platforms to their respective chains
 */
export const PLATFORM_CHAINS: Record<PlatformType, PlatformMapping> = {
  zora: {
    chainId: 'base',
    platform: 'zora',
    displayName: 'Zora (Base)',
  },
  pumpfun: {
    chainId: 'solana',
    platform: 'pumpfun',
    displayName: 'Pump.fun (Solana)',
  },
  arena: {
    chainId: 'avalanche',
    platform: 'arena',
    displayName: 'Arena (Avalanche)',
  },
};

/**
 * Get chain configuration by ID
 */
export function getChain(chainId: ChainId): ChainConfig {
  const chain = CHAINS[chainId];
  if (!chain) {
    throw new Error(`Chain configuration not found for: ${chainId}`);
  }
  return chain;
}

/**
 * Get chain configuration by platform
 */
export function getChainByPlatform(platform: PlatformType): ChainConfig {
  const mapping = PLATFORM_CHAINS[platform];
  if (!mapping) {
    throw new Error(`Platform mapping not found for: ${platform}`);
  }
  return getChain(mapping.chainId);
}

/**
 * Validate if chain is supported
 */
export function isChainSupported(chainId: string): chainId is ChainId {
  return chainId in CHAINS;
}

/**
 * Get all supported chain IDs
 */
export function getSupportedChains(): ChainId[] {
  return Object.keys(CHAINS) as ChainId[];
}

/**
 * Get enabled chains from feature flags
 */
export function getEnabledChains(): ChainId[] {
  // This will integrate with feature flags to determine which chains are currently enabled
  const enabled: ChainId[] = [];

  // Base is always enabled (Zora coins)
  enabled.push('base');

  // Solana is always enabled (Pump.fun)
  enabled.push('solana');

  // Arena/Avalanche is in stealth mode (feature flag controlled)
  // enabled.push('avalanche'); // Uncomment when Arena goes live

  return enabled;
}

/**
 * Format token amount with proper decimals
 */
export function formatTokenAmount(
  amount: number | string,
  decimals: number,
  chainId?: ChainId
): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  const divisor = Math.pow(10, decimals);
  const formatted = num / divisor;

  return formatted.toLocaleString('en-US', {
    maximumFractionDigits: decimals > 6 ? 6 : decimals,
  });
}

/**
 * Get explorer URL for a token
 */
export function getTokenExplorerUrl(chainId: ChainId, tokenAddress: string): string {
  const chain = getChain(chainId);

  switch (chainId) {
    case 'base':
      return `${chain.explorer}/token/${tokenAddress}`;
    case 'solana':
      return `${chain.explorer}/token/${tokenAddress}`;
    case 'avalanche':
      return `${chain.explorer}/token/${tokenAddress}`;
    default:
      return chain.explorer;
  }
}

/**
 * Get explorer URL for a transaction
 */
export function getTxExplorerUrl(chainId: ChainId, txHash: string): string {
  const chain = getChain(chainId);

  switch (chainId) {
    case 'base':
    case 'avalanche':
      return `${chain.explorer}/tx/${txHash}`;
    case 'solana':
      return `${chain.explorer}/tx/${txHash}`;
    default:
      return chain.explorer;
  }
}

/**
 * Get explorer URL for an address
 */
export function getAddressExplorerUrl(chainId: ChainId, address: string): string {
  const chain = getChain(chainId);

  switch (chainId) {
    case 'base':
    case 'avalanche':
      return `${chain.explorer}/address/${address}`;
    case 'solana':
      return `${chain.explorer}/account/${address}`;
    default:
      return chain.explorer;
  }
}
