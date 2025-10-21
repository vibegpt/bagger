/**
 * Token Analytics Types
 * Objective metrics for token/creator analysis
 */

export interface WalletConcentration {
  top10HoldersPercent: number;
  giniCoefficient: number; // 0 = perfect equality, 1 = total inequality
  uniqueHolders: number;
  whaleWallets: number; // Wallets holding >1% of supply
  topHolders: Array<{
    address: string;
    balance: number;
    percentOfSupply: number;
    acquisitionDate?: Date;
  }>;
}

export interface DeveloperActivity {
  developerWallet: string;
  currentHoldings: number;
  percentOfSupply: number;
  totalBought: number;
  totalSold: number;
  netPosition: number; // totalBought - totalSold
  firstTransaction?: Date;
  lastTransaction?: Date;
  transactionHistory: Array<{
    date: Date;
    type: 'buy' | 'sell';
    amount: number;
    priceAtTime?: number;
  }>;
}

export interface CreatorTrackRecord {
  creatorAddress: string;
  tokensCreated: number;
  successfulTokens: number; // Graduated or maintained value
  successRate: number; // percentage
  totalMarketCapAllTokens: number;
  averageHolderRetention: number; // percentage of holders after 30d
  oldestToken?: Date;
  newestToken?: Date;
}

export interface LaunchMetrics {
  launchDate: Date;
  launchPrice: number;
  currentPrice: number;
  priceChange: number; // percentage
  allTimeHigh: number;
  allTimeLow: number;
  initialLiquidity: number;
  currentLiquidity: number;
  topHolderAcquisitionPattern: {
    // How top holders acquired their positions
    firstBlock: number; // % acquired in first 10 blocks
    firstHour: number; // % acquired in first hour
    firstDay: number; // % acquired in first day
    gradual: number; // % acquired over >7 days
  };
}

export interface TradingData {
  volume24h: number;
  volume7d: number;
  volume30d: number;
  trades24h: number;
  trades7d: number;
  trades30d: number;
  averageTradeSize: number;
  buyPressure: number; // % of volume that is buys vs sells
  liquidityDepth: number; // How much $ needed to move price 1%
}

export interface TokenAnalytics {
  tokenAddress: string;
  platform: 'zora' | 'pumpfun';
  walletConcentration: WalletConcentration;
  developerActivity: DeveloperActivity;
  creatorTrackRecord: CreatorTrackRecord;
  launchMetrics: LaunchMetrics;
  tradingData: TradingData;
  lastUpdated: Date;
}

/**
 * Red flags to display (objective observations, not judgments)
 */
export interface TokenRedFlags {
  // Concentration concerns
  top10OwnOver50Percent?: boolean;
  singleWalletOver20Percent?: boolean;

  // Launch concerns
  topHoldersBoughtInFirstBlock?: boolean;
  majorityBoughtInFirstHour?: boolean;

  // Developer concerns
  devSoldOver50Percent?: boolean;
  devWalletCreatedSameDay?: boolean;

  // Trading concerns
  lowLiquidity?: boolean;
  highSlippage?: boolean;
  suspiciousVolumeSpikes?: boolean;
}

/**
 * Helper function to identify potential red flags
 * Returns objective facts, not subjective ratings
 */
export function identifyRedFlags(analytics: TokenAnalytics): TokenRedFlags {
  const flags: TokenRedFlags = {};

  // Wallet concentration
  if (analytics.walletConcentration.top10HoldersPercent > 50) {
    flags.top10OwnOver50Percent = true;
  }

  const topHolder = analytics.walletConcentration.topHolders[0];
  if (topHolder && topHolder.percentOfSupply > 20) {
    flags.singleWalletOver20Percent = true;
  }

  // Launch pattern
  if (analytics.launchMetrics.topHolderAcquisitionPattern.firstBlock > 30) {
    flags.topHoldersBoughtInFirstBlock = true;
  }

  if (analytics.launchMetrics.topHolderAcquisitionPattern.firstHour > 70) {
    flags.majorityBoughtInFirstHour = true;
  }

  // Developer activity
  const devNetSold = analytics.developerActivity.totalSold - analytics.developerActivity.totalBought;
  if (devNetSold > analytics.developerActivity.totalBought * 0.5) {
    flags.devSoldOver50Percent = true;
  }

  // Trading
  if (analytics.tradingData.liquidityDepth < 1000) {
    flags.lowLiquidity = true;
  }

  return flags;
}
