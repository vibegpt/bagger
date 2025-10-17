/**
 * Feature Flags System
 *
 * Controls which platforms and features are visible to users.
 * Allows building features in stealth mode and launching strategically.
 */

export interface PlatformFlags {
  // Core platforms
  zora: boolean;
  pumpfun: boolean;

  // Expansion platforms (hidden by default)
  arena: boolean;
  diamond: boolean;
  rally: boolean;
  coinvise: boolean;
}

export interface FeatureFlags {
  platforms: PlatformFlags;

  // Feature-specific flags
  weeklyReports: boolean;
  twitterThreads: boolean;
  visualizations: boolean;
  historicalTrends: boolean;

  // Admin features
  adminDashboard: boolean;
  arenaPreview: boolean; // Admin-only Arena preview
}

// Default feature flags
const DEFAULT_FLAGS: FeatureFlags = {
  platforms: {
    zora: true,
    pumpfun: true,
    arena: false,        // Hidden - collecting data in background
    diamond: false,      // Not implemented
    rally: false,        // Not implemented
    coinvise: false,     // Not implemented
  },
  weeklyReports: true,
  twitterThreads: true,
  visualizations: true,
  historicalTrends: true,
  adminDashboard: true,
  arenaPreview: true,    // Admin can see Arena
};

/**
 * Get feature flags from environment or use defaults
 */
export function getFeatureFlags(): FeatureFlags {
  // In production, these could come from environment variables or a config service
  // For now, using defaults with option to override via env

  const flags: FeatureFlags = { ...DEFAULT_FLAGS };

  // Allow environment variable overrides
  if (process.env.NEXT_PUBLIC_ENABLE_ARENA === 'true') {
    flags.platforms.arena = true;
  }

  if (process.env.NEXT_PUBLIC_ENABLE_DIAMOND === 'true') {
    flags.platforms.diamond = true;
  }

  return flags;
}

/**
 * Check if a specific platform is enabled
 */
export function isPlatformEnabled(platform: keyof PlatformFlags): boolean {
  const flags = getFeatureFlags();
  return flags.platforms[platform];
}

/**
 * Get list of enabled platforms
 */
export function getEnabledPlatforms(): Array<keyof PlatformFlags> {
  const flags = getFeatureFlags();
  return Object.entries(flags.platforms)
    .filter(([_, enabled]) => enabled)
    .map(([platform]) => platform as keyof PlatformFlags);
}

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  const flags = getFeatureFlags();
  return flags[feature] as boolean;
}

/**
 * Get platforms for public display (respects feature flags)
 */
export function getPublicPlatforms(): Array<keyof PlatformFlags> {
  return getEnabledPlatforms();
}

/**
 * Get ALL platforms including hidden ones (for admin/data collection)
 */
export function getAllPlatforms(): Array<keyof PlatformFlags> {
  return ['zora', 'pumpfun', 'arena', 'diamond', 'rally', 'coinvise'];
}

/**
 * Platform display configuration
 */
export const PLATFORM_CONFIG = {
  zora: {
    name: 'Zora',
    chain: 'Base',
    color: '#4169E1',
    enabled: true,
  },
  pumpfun: {
    name: 'Pump.fun',
    chain: 'Solana',
    color: '#9945FF',
    enabled: true,
  },
  arena: {
    name: 'Arena',
    chain: 'Avalanche',
    color: '#E84142',
    enabled: false, // Stealth mode
  },
  diamond: {
    name: 'Diamond',
    chain: 'DeSo',
    color: '#00D4AA',
    enabled: false,
  },
  rally: {
    name: 'Rally',
    chain: 'Ethereum',
    color: '#7C3AED',
    enabled: false,
  },
  coinvise: {
    name: 'Coinvise',
    chain: 'Ethereum',
    color: '#F59E0B',
    enabled: false,
  },
} as const;

/**
 * Get platform configuration
 */
export function getPlatformConfig(platform: keyof PlatformFlags) {
  return PLATFORM_CONFIG[platform];
}
