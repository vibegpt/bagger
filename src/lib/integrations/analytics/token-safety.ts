/**
 * Token Safety Rating System
 * Similar to BSCScan's token checks - objective metrics displayed compactly
 */

import type { TokenAnalytics } from '../types/token-analytics';

export type SafetyRating = 'LOW_RISK' | 'MEDIUM_RISK' | 'HIGH_RISK' | 'CRITICAL_RISK';

export interface SafetyCheck {
  id: string;
  label: string;
  status: 'pass' | 'warning' | 'fail';
  value: string; // The actual metric to display
  severity: 'low' | 'medium' | 'high';
}

export interface TokenSafetyReport {
  overallRating: SafetyRating;
  score: number; // 0-100
  checks: SafetyCheck[];
  lastUpdated: Date;
}

/**
 * Calculate safety score and generate compact report
 */
export function analyzeTokenSafety(analytics: TokenAnalytics): TokenSafetyReport {
  const checks: SafetyCheck[] = [];
  let totalScore = 100;
  let penalties = 0;

  // 1. Wallet Concentration Check
  const top10Percent = analytics.walletConcentration.top10HoldersPercent;
  if (top10Percent > 70) {
    checks.push({
      id: 'concentration',
      label: 'Top 10 Holders',
      status: 'fail',
      value: `${top10Percent.toFixed(0)}% of supply`,
      severity: 'high'
    });
    penalties += 30;
  } else if (top10Percent > 50) {
    checks.push({
      id: 'concentration',
      label: 'Top 10 Holders',
      status: 'warning',
      value: `${top10Percent.toFixed(0)}% of supply`,
      severity: 'medium'
    });
    penalties += 15;
  } else {
    checks.push({
      id: 'concentration',
      label: 'Top 10 Holders',
      status: 'pass',
      value: `${top10Percent.toFixed(0)}% of supply`,
      severity: 'low'
    });
  }

  // 2. Developer Holdings Check
  const devPercent = analytics.developerActivity.percentOfSupply;
  const devNetSold = analytics.developerActivity.totalSold - analytics.developerActivity.totalBought;
  const devSoldPercent = analytics.developerActivity.totalBought > 0
    ? (devNetSold / analytics.developerActivity.totalBought) * 100
    : 0;

  if (devSoldPercent > 50) {
    checks.push({
      id: 'dev_sells',
      label: 'Dev Selling',
      status: 'fail',
      value: `Sold ${devSoldPercent.toFixed(0)}% of holdings`,
      severity: 'high'
    });
    penalties += 25;
  } else if (devPercent > 20) {
    checks.push({
      id: 'dev_holdings',
      label: 'Dev Holdings',
      status: 'warning',
      value: `${devPercent.toFixed(1)}% of supply`,
      severity: 'medium'
    });
    penalties += 10;
  } else {
    checks.push({
      id: 'dev_holdings',
      label: 'Dev Holdings',
      status: 'pass',
      value: `${devPercent.toFixed(1)}% of supply`,
      severity: 'low'
    });
  }

  // 3. Launch Fairness Check
  const firstBlockPercent = analytics.launchMetrics.topHolderAcquisitionPattern.firstBlock;
  if (firstBlockPercent > 40) {
    checks.push({
      id: 'launch_fairness',
      label: 'Launch Pattern',
      status: 'fail',
      value: `${firstBlockPercent.toFixed(0)}% bought in first block`,
      severity: 'high'
    });
    penalties += 25;
  } else if (firstBlockPercent > 20) {
    checks.push({
      id: 'launch_fairness',
      label: 'Launch Pattern',
      status: 'warning',
      value: `${firstBlockPercent.toFixed(0)}% bought in first block`,
      severity: 'medium'
    });
    penalties += 12;
  } else {
    checks.push({
      id: 'launch_fairness',
      label: 'Launch Pattern',
      status: 'pass',
      value: 'Gradual distribution',
      severity: 'low'
    });
  }

  // 4. Liquidity Check
  const liquidity = analytics.tradingData.liquidityDepth;
  if (liquidity < 1000) {
    checks.push({
      id: 'liquidity',
      label: 'Liquidity',
      status: 'fail',
      value: `$${liquidity.toFixed(0)} to move 1%`,
      severity: 'high'
    });
    penalties += 20;
  } else if (liquidity < 5000) {
    checks.push({
      id: 'liquidity',
      label: 'Liquidity',
      status: 'warning',
      value: `$${liquidity.toFixed(0)} to move 1%`,
      severity: 'medium'
    });
    penalties += 8;
  } else {
    checks.push({
      id: 'liquidity',
      label: 'Liquidity',
      status: 'pass',
      value: `$${liquidity.toFixed(0)} to move 1%`,
      severity: 'low'
    });
  }

  // 5. Creator Track Record
  const successRate = analytics.creatorTrackRecord.successRate;
  if (successRate < 20) {
    checks.push({
      id: 'track_record',
      label: 'Creator Success',
      status: 'fail',
      value: `${successRate.toFixed(0)}% success rate`,
      severity: 'medium'
    });
    penalties += 15;
  } else if (successRate < 40) {
    checks.push({
      id: 'track_record',
      label: 'Creator Success',
      status: 'warning',
      value: `${successRate.toFixed(0)}% success rate`,
      severity: 'low'
    });
    penalties += 5;
  } else {
    checks.push({
      id: 'track_record',
      label: 'Creator Success',
      status: 'pass',
      value: `${successRate.toFixed(0)}% success rate`,
      severity: 'low'
    });
  }

  // Calculate final score
  const score = Math.max(0, totalScore - penalties);

  // Determine overall rating
  let overallRating: SafetyRating;
  if (score >= 80) {
    overallRating = 'LOW_RISK';
  } else if (score >= 60) {
    overallRating = 'MEDIUM_RISK';
  } else if (score >= 40) {
    overallRating = 'HIGH_RISK';
  } else {
    overallRating = 'CRITICAL_RISK';
  }

  return {
    overallRating,
    score,
    checks,
    lastUpdated: new Date()
  };
}

/**
 * Get compact display for rating badge
 */
export function getRatingDisplay(rating: SafetyRating): {
  label: string;
  color: string;
  bgColor: string;
  emoji: string;
} {
  switch (rating) {
    case 'LOW_RISK':
      return {
        label: 'Low Risk',
        color: 'text-green-600',
        bgColor: 'bg-green-50 border-green-200',
        emoji: '✓'
      };
    case 'MEDIUM_RISK':
      return {
        label: 'Medium Risk',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50 border-yellow-200',
        emoji: '⚠'
      };
    case 'HIGH_RISK':
      return {
        label: 'High Risk',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50 border-orange-200',
        emoji: '⚠'
      };
    case 'CRITICAL_RISK':
      return {
        label: 'Critical Risk',
        color: 'text-red-600',
        bgColor: 'bg-red-50 border-red-200',
        emoji: '⛔'
      };
  }
}

/**
 * Get icon for check status
 */
export function getCheckIcon(status: 'pass' | 'warning' | 'fail'): string {
  switch (status) {
    case 'pass':
      return '✓';
    case 'warning':
      return '⚠';
    case 'fail':
      return '✗';
  }
}
