# Pump.fun Leaderboard Filtering - Implementation Plan
**Created:** October 27, 2025
**Status:** In Progress
**Goal:** Build dual-leaderboard system to filter out pump-and-dumps while enabling discovery

---

## 📋 Executive Summary

Implement a two-tier leaderboard for Pump.fun tokens:
1. **Established Creators** - Proven tokens with 3+ days history, $100k+ mcap, strong liquidity
2. **Trending Launches** - New tokens (1-24h old) with early traction, velocity-ranked

**Timeline:** 2-3 weeks MVP
**Confidence:** High (8-9/10 from expert consensus)
**Differentiation:** First platform to prioritize creator tokens over generic memes

---

## 🎯 Success Criteria

### Week 1 (Data Infrastructure)
- [ ] Token metadata ingestion pipeline operational
- [ ] Birdeye/DexScreener API integration working
- [ ] Database schema created and tested
- [ ] Rolling metric calculations (24h, 7d) functional

### Week 2 (Filtering & API)
- [ ] Filtering engine with configurable thresholds
- [ ] `/api/leaderboard/established` endpoint returning filtered results
- [ ] `/api/leaderboard/trending` endpoint with velocity ranking
- [ ] Anti-rug detection algorithms tested
- [ ] Creator linkage heuristics implemented

### Week 3 (UI & Launch)
- [ ] Dual-tab leaderboard UI deployed
- [ ] Transparency features (filter criteria tooltips) added
- [ ] Cron job for hourly updates configured
- [ ] Monitoring dashboard for false positives/negatives
- [ ] Public methodology documentation published

### Week 4 (Tuning)
- [ ] ≥90% of leaderboard tokens survive 7 days
- [ ] <5% user reports of scams on leaderboard
- [ ] False positive rate <10%
- [ ] Thresholds adjusted based on empirical data

---

## 📊 Filter Specifications

### Established Creators Board

**Hard Requirements (ALL must pass):**
```typescript
interface EstablishedFilters {
  tokenAge: '>= 3 days',
  marketCap: '>= $100,000 USD',
  liquidity: '>= $25,000 USD',
  volume24h: '>= $25,000 USD',
  holderCount: '>= 200 unique wallets',
  creatorLinked: true, // Token tied to creator profile
}
```

**Anti-Rug Guardrails (ANY triggers exclusion):**
```typescript
interface RugChecks {
  liquidityDrain: '< 50% removed in 30min window',
  priceCrash: '< 80% drop from peak in 2h',
  holderConcentration: 'Top 10 holders < 80% (ex-LP)',
  tradingActivity: '>= 20 unique traders in 24h',
}
```

**Ranking Score:**
```typescript
score = (
  liquidity * 0.3 +
  volume24h * 0.25 +
  holderCount * 0.2 +
  marketCap * 0.15 +
  stability * 0.1  // (1 - volatility)
) * creatorVerificationBonus // 1.2x if verified
```

---

### Trending Launches Board

**Hard Requirements:**
```typescript
interface TrendingFilters {
  tokenAge: '1-24 hours',
  marketCapPeak: '>= $10,000 USD',
  liquidityCurrent: '>= $5,000 USD',
  volumeSinceLaunch: '>= $5,000 USD',
  holderCount: '>= 50 unique wallets',
  activeHours: '>= 6 distinct trading hours',
  liquidityStability: 'No >30% drain in 1h window',
}
```

**Velocity Ranking:**
```typescript
velocityScore = (
  (marketCapGrowth * holderGrowth) / ageInHours
) * activityMultiplier

where:
  marketCapGrowth = (currentMcap - initialMcap) / initialMcap
  holderGrowth = (currentHolders - initialHolders) / initialHolders
  activityMultiplier = distinctTradingHours / ageInHours
```

**Display Limit:** Top 20 tokens only (prevent spam)

---

## 🏗️ Architecture

### Data Flow
```
Solana Blockchain
    ↓
Birdeye/DexScreener API
    ↓
Token Ingestion Service (Node.js cron)
    ↓
PostgreSQL Database (token metrics, time-series)
    ↓
Filtering Engine (Next.js API route)
    ↓
Frontend Leaderboard UI (React components)
```

### Database Schema

```sql
-- New table: token_metrics
CREATE TABLE token_metrics (
  id SERIAL PRIMARY KEY,
  mint_address VARCHAR(44) UNIQUE NOT NULL,
  name VARCHAR(255),
  symbol VARCHAR(10),
  image_url TEXT,
  creator_wallet VARCHAR(44),
  created_at TIMESTAMP NOT NULL,

  -- Current metrics
  market_cap_usd DECIMAL(15, 2),
  liquidity_usd DECIMAL(15, 2),
  volume_24h_usd DECIMAL(15, 2),
  volume_7d_usd DECIMAL(15, 2),
  holder_count INTEGER,
  unique_traders_24h INTEGER,
  unique_traders_7d INTEGER,

  -- Derived metrics
  token_age_hours INTEGER,
  distinct_trading_hours_24h INTEGER,
  price_change_24h DECIMAL(10, 4),
  liquidity_change_24h DECIMAL(10, 4),

  -- Anti-rug flags
  liquidity_drain_detected BOOLEAN DEFAULT FALSE,
  price_crash_detected BOOLEAN DEFAULT FALSE,
  wash_trading_suspected BOOLEAN DEFAULT FALSE,

  -- Metadata
  creator_verified BOOLEAN DEFAULT FALSE,
  graduated_to_raydium BOOLEAN DEFAULT FALSE,

  -- Timestamps
  last_updated_at TIMESTAMP DEFAULT NOW(),

  INDEX idx_market_cap (market_cap_usd),
  INDEX idx_token_age (token_age_hours),
  INDEX idx_creator (creator_wallet)
);

-- New table: token_snapshots (time-series)
CREATE TABLE token_snapshots (
  id SERIAL PRIMARY KEY,
  mint_address VARCHAR(44) NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  market_cap_usd DECIMAL(15, 2),
  liquidity_usd DECIMAL(15, 2),
  price_usd DECIMAL(15, 8),
  holder_count INTEGER,

  FOREIGN KEY (mint_address) REFERENCES token_metrics(mint_address),
  INDEX idx_snapshots_mint_time (mint_address, timestamp)
);

-- New table: creator_registry
CREATE TABLE creator_registry (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(44) UNIQUE NOT NULL,
  username VARCHAR(100),
  verified BOOLEAN DEFAULT FALSE,
  verification_method VARCHAR(50), -- 'twitter', 'discord', 'manual'
  social_links JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔧 Implementation Steps

### Phase 1: Data Infrastructure (Week 1)

#### 1.1 Database Setup
**File:** `prisma/schema.prisma`
```typescript
model TokenMetrics {
  id                    Int       @id @default(autoincrement())
  mintAddress           String    @unique @db.VarChar(44)
  name                  String?
  symbol                String?
  imageUrl              String?
  creatorWallet         String?   @db.VarChar(44)
  createdAt             DateTime

  marketCapUsd          Decimal   @db.Decimal(15, 2)
  liquidityUsd          Decimal   @db.Decimal(15, 2)
  volume24hUsd          Decimal   @db.Decimal(15, 2)
  volume7dUsd           Decimal?  @db.Decimal(15, 2)
  holderCount           Int
  uniqueTraders24h      Int?

  tokenAgeHours         Int
  distinctTradingHours24h Int?
  priceChange24h        Decimal?  @db.Decimal(10, 4)
  liquidityChange24h    Decimal?  @db.Decimal(10, 4)

  liquidityDrainDetected Boolean  @default(false)
  priceCrashDetected    Boolean   @default(false)
  washTradingSuspected  Boolean   @default(false)

  creatorVerified       Boolean   @default(false)
  graduatedToRaydium    Boolean   @default(false)

  lastUpdatedAt         DateTime  @updatedAt

  snapshots             TokenSnapshot[]

  @@index([marketCapUsd])
  @@index([tokenAgeHours])
  @@index([creatorWallet])
}

model TokenSnapshot {
  id            Int       @id @default(autoincrement())
  mintAddress   String    @db.VarChar(44)
  timestamp     DateTime
  marketCapUsd  Decimal   @db.Decimal(15, 2)
  liquidityUsd  Decimal   @db.Decimal(15, 2)
  priceUsd      Decimal   @db.Decimal(15, 8)
  holderCount   Int

  token         TokenMetrics @relation(fields: [mintAddress], references: [mintAddress])

  @@index([mintAddress, timestamp])
}

model CreatorRegistry {
  id                  Int       @id @default(autoincrement())
  walletAddress       String    @unique @db.VarChar(44)
  username            String?
  verified            Boolean   @default(false)
  verificationMethod  String?
  socialLinks         Json?
  createdAt           DateTime  @default(now())
}
```

**Tasks:**
- [ ] Add models to Prisma schema
- [ ] Run `npx prisma migrate dev --name add_token_filtering`
- [ ] Generate Prisma client

---

#### 1.2 Birdeye API Integration
**File:** `/src/lib/integrations/birdeye/client.ts`

```typescript
/**
 * Birdeye API client for Solana token data
 * Docs: https://docs.birdeye.so/
 */

interface BirdeyeTokenOverview {
  address: string;
  decimals: number;
  symbol: string;
  name: string;
  logoURI?: string;
  liquidity: number; // USD
  v24hUSD: number; // 24h volume
  mc: number; // Market cap USD
  holder: number; // Holder count
  creator?: string; // Creator wallet
}

interface BirdeyeTokenTrade {
  txHash: string;
  blockUnixTime: number;
  owner: string;
  // ... other fields
}

export class BirdeyeClient {
  private apiKey: string;
  private baseUrl = 'https://public-api.birdeye.so';

  constructor() {
    this.apiKey = process.env.BIRDEYE_API_KEY || '';
    if (!this.apiKey) {
      console.warn('[Birdeye] No API key configured');
    }
  }

  /**
   * Get token overview with market data
   */
  async getTokenOverview(mintAddress: string): Promise<BirdeyeTokenOverview | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/defi/token_overview?address=${mintAddress}`,
        {
          headers: {
            'X-API-KEY': this.apiKey,
          },
        }
      );

      if (!response.ok) {
        console.error(`[Birdeye] Token overview failed: ${response.status}`);
        return null;
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('[Birdeye] getTokenOverview error:', error);
      return null;
    }
  }

  /**
   * Get token creation info (for age calculation)
   */
  async getTokenCreationTime(mintAddress: string): Promise<Date | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/defi/token_creation_info?address=${mintAddress}`,
        {
          headers: {
            'X-API-KEY': this.apiKey,
          },
        }
      );

      if (!response.ok) return null;

      const data = await response.json();
      return data.data?.blockTime ? new Date(data.data.blockTime * 1000) : null;
    } catch (error) {
      console.error('[Birdeye] getTokenCreationTime error:', error);
      return null;
    }
  }

  /**
   * Get recent trades for unique trader count
   */
  async getTokenTrades(
    mintAddress: string,
    limit: number = 100
  ): Promise<BirdeyeTokenTrade[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/defi/txs/token?address=${mintAddress}&tx_type=swap&limit=${limit}`,
        {
          headers: {
            'X-API-KEY': this.apiKey,
          },
        }
      );

      if (!response.ok) return [];

      const data = await response.json();
      return data.data?.items || [];
    } catch (error) {
      console.error('[Birdeye] getTokenTrades error:', error);
      return [];
    }
  }

  /**
   * Get token price history for volatility analysis
   */
  async getTokenPriceHistory(
    mintAddress: string,
    timeframe: '1H' | '24H' | '7D' = '24H'
  ): Promise<Array<{ timestamp: number; value: number }>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/defi/history_price?address=${mintAddress}&address_type=token&type=${timeframe}`,
        {
          headers: {
            'X-API-KEY': this.apiKey,
          },
        }
      );

      if (!response.ok) return [];

      const data = await response.json();
      return data.data?.items || [];
    } catch (error) {
      console.error('[Birdeye] getTokenPriceHistory error:', error);
      return [];
    }
  }
}

export const birdeyeClient = new BirdeyeClient();
```

**Tasks:**
- [ ] Create Birdeye client file
- [ ] Add `BIRDEYE_API_KEY` to `.env.local`
- [ ] Test API endpoints with known token addresses
- [ ] Implement rate limiting (Birdeye: 100 req/min free tier)

---

#### 1.3 Token Ingestion Service
**File:** `/src/lib/services/token-ingestion.ts`

```typescript
import { prisma } from '@/lib/db';
import { birdeyeClient } from '@/lib/integrations/birdeye/client';
import { pumpFunClient } from '@/lib/integrations/pumpfun/client';

interface TokenIngestionResult {
  success: boolean;
  mintAddress: string;
  message: string;
}

export class TokenIngestionService {
  /**
   * Ingest a single token's current metrics
   */
  async ingestToken(mintAddress: string): Promise<TokenIngestionResult> {
    try {
      // Fetch from Birdeye
      const overview = await birdeyeClient.getTokenOverview(mintAddress);
      if (!overview) {
        return {
          success: false,
          mintAddress,
          message: 'Failed to fetch token data from Birdeye',
        };
      }

      // Get creation time
      const createdAt = await birdeyeClient.getTokenCreationTime(mintAddress);
      if (!createdAt) {
        return {
          success: false,
          mintAddress,
          message: 'Failed to determine token creation time',
        };
      }

      // Calculate age in hours
      const tokenAgeHours = Math.floor(
        (Date.now() - createdAt.getTime()) / (1000 * 60 * 60)
      );

      // Get recent trades for activity analysis
      const trades = await birdeyeClient.getTokenTrades(mintAddress, 100);
      const last24h = Date.now() - 24 * 60 * 60 * 1000;
      const recentTrades = trades.filter(t => t.blockUnixTime * 1000 >= last24h);

      // Calculate unique traders
      const uniqueTraders = new Set(recentTrades.map(t => t.owner)).size;

      // Calculate distinct trading hours
      const tradingHours = new Set(
        recentTrades.map(t => new Date(t.blockUnixTime * 1000).getHours())
      );

      // Get price history for volatility check
      const priceHistory = await birdeyeClient.getTokenPriceHistory(mintAddress, '24H');
      const { priceCrashDetected, liquidityDrainDetected } = this.detectRugSignals(
        priceHistory,
        overview
      );

      // Upsert to database
      await prisma.tokenMetrics.upsert({
        where: { mintAddress },
        create: {
          mintAddress,
          name: overview.name,
          symbol: overview.symbol,
          imageUrl: overview.logoURI,
          creatorWallet: overview.creator,
          createdAt,
          marketCapUsd: overview.mc,
          liquidityUsd: overview.liquidity,
          volume24hUsd: overview.v24hUSD,
          holderCount: overview.holder,
          uniqueTraders24h: uniqueTraders,
          tokenAgeHours,
          distinctTradingHours24h: tradingHours.size,
          priceCrashDetected,
          liquidityDrainDetected,
        },
        update: {
          name: overview.name,
          symbol: overview.symbol,
          imageUrl: overview.logoURI,
          marketCapUsd: overview.mc,
          liquidityUsd: overview.liquidity,
          volume24hUsd: overview.v24hUSD,
          holderCount: overview.holder,
          uniqueTraders24h: uniqueTraders,
          tokenAgeHours,
          distinctTradingHours24h: tradingHours.size,
          priceCrashDetected,
          liquidityDrainDetected,
          lastUpdatedAt: new Date(),
        },
      });

      // Store snapshot for time-series
      await prisma.tokenSnapshot.create({
        data: {
          mintAddress,
          timestamp: new Date(),
          marketCapUsd: overview.mc,
          liquidityUsd: overview.liquidity,
          priceUsd: overview.mc / (overview.holder || 1), // Rough price estimate
          holderCount: overview.holder,
        },
      });

      return {
        success: true,
        mintAddress,
        message: 'Token ingested successfully',
      };
    } catch (error) {
      console.error(`[Ingestion] Error processing ${mintAddress}:`, error);
      return {
        success: false,
        mintAddress,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Detect rug pull signals from price/liquidity history
   */
  private detectRugSignals(
    priceHistory: Array<{ timestamp: number; value: number }>,
    overview: any
  ): { priceCrashDetected: boolean; liquidityDrainDetected: boolean } {
    if (priceHistory.length < 2) {
      return { priceCrashDetected: false, liquidityDrainDetected: false };
    }

    // Find peak price in last 24h
    const peak = Math.max(...priceHistory.map(p => p.value));
    const current = priceHistory[priceHistory.length - 1]?.value || 0;

    // Check for 80% crash from peak within 2 hours
    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
    const recentPrices = priceHistory.filter(p => p.timestamp >= twoHoursAgo);
    const recentPeak = Math.max(...recentPrices.map(p => p.value));
    const priceCrashDetected = current < recentPeak * 0.2; // >80% drop

    // TODO: Implement liquidity drain detection (requires historical liquidity data)
    const liquidityDrainDetected = false;

    return { priceCrashDetected, liquidityDrainDetected };
  }

  /**
   * Batch ingest multiple tokens
   */
  async ingestTokenBatch(mintAddresses: string[]): Promise<TokenIngestionResult[]> {
    const results = await Promise.allSettled(
      mintAddresses.map(addr => this.ingestToken(addr))
    );

    return results.map((result, idx) =>
      result.status === 'fulfilled'
        ? result.value
        : {
            success: false,
            mintAddress: mintAddresses[idx],
            message: 'Promise rejected',
          }
    );
  }
}

export const tokenIngestionService = new TokenIngestionService();
```

**Tasks:**
- [ ] Create ingestion service
- [ ] Test with sample tokens
- [ ] Add error handling and retries
- [ ] Implement rate limiting

---

### Phase 2: Filtering & API (Week 2)

#### 2.1 Filtering Engine
**File:** `/src/lib/services/token-filtering.ts`

```typescript
import { prisma } from '@/lib/db';
import type { TokenMetrics } from '@prisma/client';

interface FilterCriteria {
  minMarketCap: number;
  minLiquidity: number;
  minVolume24h: number;
  minHolderCount: number;
  minTokenAgeHours: number;
  maxTokenAgeHours?: number;
  requireCreatorLinked?: boolean;
}

export const ESTABLISHED_FILTERS: FilterCriteria = {
  minMarketCap: 100000, // $100k
  minLiquidity: 25000, // $25k
  minVolume24h: 25000, // $25k
  minHolderCount: 200,
  minTokenAgeHours: 72, // 3 days
  requireCreatorLinked: true,
};

export const TRENDING_FILTERS: FilterCriteria = {
  minMarketCap: 10000, // $10k
  minLiquidity: 5000, // $5k
  minVolume24h: 5000, // $5k
  minHolderCount: 50,
  minTokenAgeHours: 1, // 1 hour
  maxTokenAgeHours: 24, // 24 hours
  requireCreatorLinked: false,
};

export class TokenFilteringService {
  /**
   * Get tokens that pass Established Creators filters
   */
  async getEstablishedTokens(limit: number = 10): Promise<TokenMetrics[]> {
    const tokens = await prisma.tokenMetrics.findMany({
      where: {
        marketCapUsd: { gte: ESTABLISHED_FILTERS.minMarketCap },
        liquidityUsd: { gte: ESTABLISHED_FILTERS.minLiquidity },
        volume24hUsd: { gte: ESTABLISHED_FILTERS.minVolume24h },
        holderCount: { gte: ESTABLISHED_FILTERS.minHolderCount },
        tokenAgeHours: { gte: ESTABLISHED_FILTERS.minTokenAgeHours },
        creatorWallet: { not: null }, // Creator linked
        // Anti-rug filters
        priceCrashDetected: false,
        liquidityDrainDetected: false,
        washTradingSuspected: false,
      },
      orderBy: [
        { creatorVerified: 'desc' }, // Verified creators first
        { marketCapUsd: 'desc' }, // Then by market cap
      ],
      take: limit,
    });

    return tokens;
  }

  /**
   * Get tokens that pass Trending Launches filters
   */
  async getTrendingTokens(limit: number = 20): Promise<TokenMetrics[]> {
    const tokens = await prisma.tokenMetrics.findMany({
      where: {
        marketCapUsd: { gte: TRENDING_FILTERS.minMarketCap },
        liquidityUsd: { gte: TRENDING_FILTERS.minLiquidity },
        volume24hUsd: { gte: TRENDING_FILTERS.minVolume24h },
        holderCount: { gte: TRENDING_FILTERS.minHolderCount },
        tokenAgeHours: {
          gte: TRENDING_FILTERS.minTokenAgeHours,
          lte: TRENDING_FILTERS.maxTokenAgeHours || 24,
        },
        distinctTradingHours24h: { gte: 6 }, // Active in 6+ hours
        // Anti-rug filters
        priceCrashDetected: false,
        liquidityDrainDetected: false,
      },
      take: limit * 2, // Fetch extra for velocity ranking
    });

    // Calculate velocity scores and re-rank
    const rankedTokens = this.rankByVelocity(tokens);

    return rankedTokens.slice(0, limit);
  }

  /**
   * Rank tokens by velocity (growth rate)
   */
  private rankByVelocity(tokens: TokenMetrics[]): TokenMetrics[] {
    // TODO: Implement proper velocity calculation using snapshots
    // For now, use a simple heuristic: (market cap / age) * (holders / age)

    const scored = tokens.map(token => {
      const mcapVelocity = Number(token.marketCapUsd) / Math.max(token.tokenAgeHours, 1);
      const holderVelocity = token.holderCount / Math.max(token.tokenAgeHours, 1);
      const velocityScore = mcapVelocity * holderVelocity;

      return {
        token,
        velocityScore,
      };
    });

    // Sort by velocity score descending
    scored.sort((a, b) => b.velocityScore - a.velocityScore);

    return scored.map(s => s.token);
  }

  /**
   * Check if a token passes filters (for validation)
   */
  isEstablished(token: TokenMetrics): boolean {
    return (
      Number(token.marketCapUsd) >= ESTABLISHED_FILTERS.minMarketCap &&
      Number(token.liquidityUsd) >= ESTABLISHED_FILTERS.minLiquidity &&
      Number(token.volume24hUsd) >= ESTABLISHED_FILTERS.minVolume24h &&
      token.holderCount >= ESTABLISHED_FILTERS.minHolderCount &&
      token.tokenAgeHours >= ESTABLISHED_FILTERS.minTokenAgeHours &&
      token.creatorWallet !== null &&
      !token.priceCrashDetected &&
      !token.liquidityDrainDetected &&
      !token.washTradingSuspected
    );
  }

  isTrending(token: TokenMetrics): boolean {
    return (
      Number(token.marketCapUsd) >= TRENDING_FILTERS.minMarketCap &&
      Number(token.liquidityUsd) >= TRENDING_FILTERS.minLiquidity &&
      Number(token.volume24hUsd) >= TRENDING_FILTERS.minVolume24h &&
      token.holderCount >= TRENDING_FILTERS.minHolderCount &&
      token.tokenAgeHours >= TRENDING_FILTERS.minTokenAgeHours &&
      token.tokenAgeHours <= (TRENDING_FILTERS.maxTokenAgeHours || 24) &&
      (token.distinctTradingHours24h || 0) >= 6 &&
      !token.priceCrashDetected &&
      !token.liquidityDrainDetected
    );
  }
}

export const tokenFilteringService = new TokenFilteringService();
```

**Tasks:**
- [ ] Create filtering service
- [ ] Test filters with sample data
- [ ] Tune thresholds based on real Pump.fun data
- [ ] Add filter criteria documentation

---

#### 2.2 API Endpoints
**File:** `/src/app/api/leaderboard/established/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { tokenFilteringService } from '@/lib/services/token-filtering';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');

    const tokens = await tokenFilteringService.getEstablishedTokens(limit);

    const formattedTokens = tokens.map((token, index) => ({
      rank: index + 1,
      address: token.mintAddress,
      name: token.name,
      symbol: token.symbol,
      imageUrl: token.imageUrl,
      totalMarketCap: Number(token.marketCapUsd),
      liquidity: Number(token.liquidityUsd),
      totalVolume: Number(token.volume24hUsd),
      totalHolders: token.holderCount,
      tokenAgeHours: token.tokenAgeHours,
      creatorVerified: token.creatorVerified,
      platform: 'pumpfun' as const,
      filtersPassed: {
        marketCap: true,
        liquidity: true,
        volume: true,
        holders: true,
        age: true,
        creatorLinked: true,
      },
    }));

    return NextResponse.json({
      success: true,
      data: formattedTokens,
      meta: {
        total: formattedTokens.length,
        limit,
        filters: {
          minMarketCap: 100000,
          minLiquidity: 25000,
          minVolume24h: 25000,
          minHolderCount: 200,
          minTokenAge: '3 days',
        },
      },
    });
  } catch (error) {
    console.error('[API] Established leaderboard error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch established leaderboard',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
```

**File:** `/src/app/api/leaderboard/trending/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { tokenFilteringService } from '@/lib/services/token-filtering';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20');

    const tokens = await tokenFilteringService.getTrendingTokens(limit);

    const formattedTokens = tokens.map((token, index) => ({
      rank: index + 1,
      address: token.mintAddress,
      name: token.name,
      symbol: token.symbol,
      imageUrl: token.imageUrl,
      totalMarketCap: Number(token.marketCapUsd),
      liquidity: Number(token.liquidityUsd),
      totalVolume: Number(token.volume24hUsd),
      totalHolders: token.holderCount,
      tokenAgeHours: token.tokenAgeHours,
      tradingHours: token.distinctTradingHours24h,
      platform: 'pumpfun' as const,
      badge: 'trending' as const,
      filtersPassed: {
        marketCap: true,
        liquidity: true,
        volume: true,
        holders: true,
        age: true,
        activity: true,
      },
    }));

    return NextResponse.json({
      success: true,
      data: formattedTokens,
      meta: {
        total: formattedTokens.length,
        limit,
        filters: {
          minMarketCap: 10000,
          minLiquidity: 5000,
          minVolume24h: 5000,
          minHolderCount: 50,
          ageRange: '1-24 hours',
          minTradingHours: 6,
        },
        warning: 'High risk - newly launched tokens. DYOR.',
      },
    });
  } catch (error) {
    console.error('[API] Trending leaderboard error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch trending leaderboard',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
```

**Tasks:**
- [ ] Create API route files
- [ ] Test endpoints locally
- [ ] Add request validation
- [ ] Implement caching (60s cache for trending, 5min for established)

---

### Phase 3: UI & Launch (Week 3)

#### 3.1 Update Leaderboard Page with Tabs
**File:** `/src/app/(marketing)/leaderboard/page.tsx` (partial update)

Add to existing leaderboard:

```typescript
// Add new state for Pump.fun sub-tabs
const [pumpfunView, setPumpfunView] = useState<'established' | 'trending'>('established');
const [establishedTokens, setEstablishedTokens] = useState<LeaderboardEntry[]>([]);
const [trendingTokens, setTrendingTokens] = useState<LeaderboardEntry[]>([]);

// Update fetch logic
useEffect(() => {
  async function fetchLeaderboards() {
    try {
      const [zoraRes, establishedRes, trendingRes] = await Promise.all([
        fetch("/api/leaderboard?platform=zora&limit=10"),
        fetch("/api/leaderboard/established?limit=10"),
        fetch("/api/leaderboard/trending?limit=20"),
      ]);

      if (zoraRes.ok) {
        const zoraData = await zoraRes.json();
        if (zoraData.success) {
          setZoraLeaderboard(zoraData.data);
        }
      }

      if (establishedRes.ok) {
        const establishedData = await establishedRes.json();
        if (establishedData.success) {
          setEstablishedTokens(establishedData.data);
        }
      }

      if (trendingRes.ok) {
        const trendingData = await trendingRes.json();
        if (trendingData.success) {
          setTrendingTokens(trendingData.data);
        }
      }
    } catch (error) {
      console.error("Failed to fetch leaderboards:", error);
    } finally {
      setLoading(false);
    }
  }

  fetchLeaderboards();
}, []);

// Update Pump.fun tab content
<TabsContent value="pumpfun" className="space-y-6">
  <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Users className="h-5 w-5" />
        Pump.fun Creator Tokens
      </CardTitle>
      <CardDescription>
        Filtered to show only legitimate creator tokens with proven activity
      </CardDescription>
    </CardHeader>
  </Card>

  {/* Sub-tabs for Established vs Trending */}
  <Tabs value={pumpfunView} onValueChange={(v) => setPumpfunView(v as any)}>
    <TabsList className="grid w-full max-w-md grid-cols-2">
      <TabsTrigger value="established">
        <Trophy className="h-4 w-4 mr-2" />
        Established Creators
      </TabsTrigger>
      <TabsTrigger value="trending">
        <Zap className="h-4 w-4 mr-2" />
        🔥 Trending Launches
      </TabsTrigger>
    </TabsList>

    <TabsContent value="established">
      <LeaderboardTable entries={establishedTokens} platform="pumpfun" />
      <Card className="border-dashed mt-4">
        <CardContent className="py-4 text-center text-sm text-muted-foreground">
          Filters: $100k+ market cap • $25k+ liquidity • 3+ days old • Creator verified
        </CardContent>
      </Card>
    </TabsContent>

    <TabsContent value="trending">
      <Badge variant="destructive" className="mb-4">
        ⚠️ HIGH RISK - Newly Launched (1-24h old)
      </Badge>
      <LeaderboardTable entries={trendingTokens} platform="pumpfun" />
      <Card className="border-dashed mt-4">
        <CardContent className="py-4 text-center text-sm text-muted-foreground">
          Filters: $10k+ market cap • $5k+ liquidity • 1-24h old • 6+ active hours
        </CardContent>
      </Card>
    </TabsContent>
  </Tabs>
</TabsContent>
```

**Tasks:**
- [ ] Update leaderboard page with sub-tabs
- [ ] Add filter criteria tooltips
- [ ] Add "Why this token?" modal with passed filters
- [ ] Style trending tokens with warning badges
- [ ] Test responsive design

---

#### 3.2 Cron Job for Token Updates
**File:** `/src/app/api/cron/update-tokens/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { tokenIngestionService } from '@/lib/services/token-ingestion';
import { prisma } from '@/lib/db';

/**
 * Cron job to update token metrics
 * Configure in Vercel: */5 * * * * (every 5 minutes)
 * Endpoint: https://bagger.tools/api/cron/update-tokens
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all tracked tokens
    const tokens = await prisma.tokenMetrics.findMany({
      select: { mintAddress: true },
      where: {
        // Only update tokens less than 30 days old
        tokenAgeHours: { lte: 720 },
      },
    });

    console.log(`[Cron] Updating ${tokens.length} tokens...`);

    // Batch update (limit to 50 per run to avoid timeouts)
    const batch = tokens.slice(0, 50).map(t => t.mintAddress);
    const results = await tokenIngestionService.ingestTokenBatch(batch);

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`[Cron] Updated ${successful} tokens, ${failed} failed`);

    return NextResponse.json({
      success: true,
      updated: successful,
      failed,
      total: batch.length,
    });
  } catch (error) {
    console.error('[Cron] Update error:', error);
    return NextResponse.json(
      { error: 'Cron job failed', message: String(error) },
      { status: 500 }
    );
  }
}
```

**Vercel Cron Configuration:**
Add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/update-tokens",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

**Tasks:**
- [ ] Create cron endpoint
- [ ] Add `CRON_SECRET` to Vercel environment variables
- [ ] Configure Vercel cron schedule
- [ ] Test cron execution
- [ ] Monitor execution logs

---

## 📈 Monitoring & Analytics

### Metrics to Track

**Filter Effectiveness:**
- % of tokens on leaderboard still active after 7 days (target: >90%)
- % of scam reports from users (target: <5%)
- False positive rate (legitimate tokens excluded)
- False negative rate (scams that passed)

**User Engagement:**
- Leaderboard page views
- Established vs Trending tab usage ratio
- Click-through rate to token profiles
- Time spent on leaderboard page

**System Health:**
- API response times (target: <500ms)
- Cron job success rate (target: >95%)
- Database query performance
- External API uptime (Birdeye, DexScreener)

---

## 🚧 Known Limitations & Future Enhancements

### MVP Limitations
1. No historical velocity calculation (using simple heuristic)
2. Liquidity drain detection not fully implemented
3. Creator verification is manual (no automated social proof)
4. Limited to 50 token updates per cron run
5. No wash trading detection algorithm

### Phase 2 Enhancements (Post-MVP)
1. **Advanced Velocity Ranking**
   - Use token snapshots for accurate growth rates
   - Implement TWAP (time-weighted average price)
   - Track holder growth velocity

2. **Creator Verification System**
   - Twitter/X API integration for handle verification
   - Discord role verification
   - Manual verification queue for admins

3. **Wash Trading Detection**
   - Unique traders to volume ratio analysis
   - Circular trading pattern detection
   - Sybil wallet identification

4. **Dynamic Threshold Calibration**
   - Weekly percentile-based recalibration
   - Market regime detection (bull vs bear adjustments)
   - Automated threshold optimization

5. **User Features**
   - Custom watchlists
   - Alert notifications for thresholds
   - "Report suspicious token" functionality
   - Export to CSV/API access

---

## 🎯 Success Milestones

**Week 1 Complete:**
- ✅ Database schema deployed
- ✅ Birdeye API integrated
- ✅ Token ingestion working for test tokens
- ✅ Snapshots storing correctly

**Week 2 Complete:**
- ✅ Filtering engine tested with 100+ tokens
- ✅ API endpoints returning filtered results
- ✅ Anti-rug detection catching known scams
- ✅ Creator linkage heuristics functional

**Week 3 Complete:**
- ✅ Dual-tab UI deployed to production
- ✅ Cron job running every 5 minutes
- ✅ Public methodology docs published
- ✅ Monitoring dashboard operational

**Week 4 Complete:**
- ✅ 90%+ token survival rate achieved
- ✅ <10% false positive rate
- ✅ User feedback overwhelmingly positive
- ✅ Ready for next phase features

---

## 📚 Resources

**APIs:**
- Birdeye: https://docs.birdeye.so/
- DexScreener: https://docs.dexscreener.com/
- Pump.fun (unofficial): Community docs

**References:**
- CoinMarketCap Trending: https://coinmarketcap.com/trending-cryptocurrencies/
- OpenSea Rankings: https://opensea.io/rankings
- MagicEden Collections: https://magiceden.io/collections

**Internal:**
- PROJECT_STATUS.md - Overall project status
- Expert Consensus (Oct 27, 2025) - O3, Gemini, GPT-5 analysis

---

*This plan is a living document. Update as implementation progresses.*
