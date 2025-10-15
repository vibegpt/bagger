-- ==============================================
-- Bagger Production Database Migration
-- Run this SQL in Supabase SQL Editor
-- ==============================================
-- This combines all 4 migration files in order:
-- 1. 20251014095516_init
-- 2. 20251014130850_add_zora_tables
-- 3. 20251014214643_add_stream_logging
-- 4. 20251015081151_add_social_posts
-- ==============================================

-- Migration 1: Initial Schema
-- ==============================================

-- CreateTable: User
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "avatarUrl" TEXT,
    "subscriptionTier" TEXT NOT NULL DEFAULT 'free',
    "stripeCustomerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable: PlatformConnection
CREATE TABLE "PlatformConnection" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" TEXT NOT NULL DEFAULT 'whop',
    "platformUserId" TEXT,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),
    "lastSyncedAt" TIMESTAMP(3),
    "syncStatus" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Product
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" TEXT NOT NULL DEFAULT 'whop',
    "platformProductId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "pricingType" TEXT,
    "billingPeriod" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "imageUrl" TEXT,
    "url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable: RevenueSnapshot
CREATE TABLE "RevenueSnapshot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "revenue" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "subscriberCount" INTEGER NOT NULL DEFAULT 0,
    "newSubscribers" INTEGER NOT NULL DEFAULT 0,
    "churnedSubscribers" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RevenueSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable: DailyMetric
CREATE TABLE "DailyMetric" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "totalRevenue" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalSubscribers" INTEGER NOT NULL DEFAULT 0,
    "newSubscribers" INTEGER NOT NULL DEFAULT 0,
    "churnedSubscribers" INTEGER NOT NULL DEFAULT 0,
    "churnRate" DECIMAL(5,2),
    "mrr" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable: SyncJob
CREATE TABLE "SyncJob" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "recordsSynced" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SyncJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Insight
CREATE TABLE "Insight" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "insightType" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'info',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "acknowledged" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Insight_pkey" PRIMARY KEY ("id")
);

-- CreateIndexes for Migration 1
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");
CREATE INDEX "User_clerkId_idx" ON "User"("clerkId");
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "PlatformConnection_userId_idx" ON "PlatformConnection"("userId");
CREATE UNIQUE INDEX "PlatformConnection_userId_platform_key" ON "PlatformConnection"("userId", "platform");
CREATE INDEX "Product_userId_idx" ON "Product"("userId");
CREATE INDEX "Product_platform_idx" ON "Product"("platform");
CREATE UNIQUE INDEX "Product_userId_platform_platformProductId_key" ON "Product"("userId", "platform", "platformProductId");
CREATE INDEX "RevenueSnapshot_userId_date_idx" ON "RevenueSnapshot"("userId", "date");
CREATE INDEX "RevenueSnapshot_productId_date_idx" ON "RevenueSnapshot"("productId", "date");
CREATE UNIQUE INDEX "RevenueSnapshot_userId_productId_date_key" ON "RevenueSnapshot"("userId", "productId", "date");
CREATE INDEX "DailyMetric_userId_date_idx" ON "DailyMetric"("userId", "date");
CREATE UNIQUE INDEX "DailyMetric_userId_date_key" ON "DailyMetric"("userId", "date");
CREATE INDEX "SyncJob_userId_idx" ON "SyncJob"("userId");
CREATE INDEX "SyncJob_status_idx" ON "SyncJob"("status");
CREATE INDEX "Insight_userId_idx" ON "Insight"("userId");
CREATE INDEX "Insight_acknowledged_idx" ON "Insight"("acknowledged");

-- AddForeignKeys for Migration 1
ALTER TABLE "PlatformConnection" ADD CONSTRAINT "PlatformConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Product" ADD CONSTRAINT "Product_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RevenueSnapshot" ADD CONSTRAINT "RevenueSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RevenueSnapshot" ADD CONSTRAINT "RevenueSnapshot_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DailyMetric" ADD CONSTRAINT "DailyMetric_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SyncJob" ADD CONSTRAINT "SyncJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Insight" ADD CONSTRAINT "Insight_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Migration 2: Zora Tables
-- ==============================================

-- CreateTable: ZoraCreatorCoin
CREATE TABLE "ZoraCreatorCoin" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "creatorAddress" TEXT NOT NULL,
    "coinAddress" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "totalSupply" TEXT NOT NULL,
    "marketCap" DECIMAL(18,2) NOT NULL,
    "price" DECIMAL(18,8) NOT NULL,
    "priceChange24h" DECIMAL(10,2) NOT NULL,
    "volume24h" DECIMAL(18,2) NOT NULL,
    "volume7d" DECIMAL(18,2) NOT NULL,
    "volumeAllTime" DECIMAL(18,2) NOT NULL,
    "holderCount" INTEGER NOT NULL DEFAULT 0,
    "liquidityPool" TEXT NOT NULL,
    "vestedToCreator" TEXT NOT NULL,
    "lastSyncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ZoraCreatorCoin_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ZoraContentCoin
CREATE TABLE "ZoraContentCoin" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "creatorAddress" TEXT NOT NULL,
    "coinAddress" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "postContent" TEXT,
    "postUrl" TEXT,
    "totalSupply" TEXT NOT NULL,
    "marketCap" DECIMAL(18,2) NOT NULL,
    "price" DECIMAL(18,8) NOT NULL,
    "volume24h" DECIMAL(18,2) NOT NULL,
    "volumeAllTime" DECIMAL(18,2) NOT NULL,
    "holderCount" INTEGER NOT NULL DEFAULT 0,
    "creatorAllocation" TEXT NOT NULL,
    "marketAllocation" TEXT NOT NULL,
    "lastSyncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ZoraContentCoin_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ZoraEarning
CREATE TABLE "ZoraEarning" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "creatorAddress" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "tradingFeesEarned" DECIMAL(18,2) NOT NULL,
    "creatorCutEarned" DECIMAL(18,2) NOT NULL,
    "vestedTokensValue" DECIMAL(18,2) NOT NULL,
    "fromCreatorCoin" DECIMAL(18,2) NOT NULL,
    "fromContentCoins" DECIMAL(18,2) NOT NULL,
    "totalEarningsUSD" DECIMAL(18,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ZoraEarning_pkey" PRIMARY KEY ("id")
);

-- CreateIndexes for Migration 2
CREATE INDEX "ZoraCreatorCoin_userId_idx" ON "ZoraCreatorCoin"("userId");
CREATE INDEX "ZoraCreatorCoin_creatorAddress_idx" ON "ZoraCreatorCoin"("creatorAddress");
CREATE UNIQUE INDEX "ZoraCreatorCoin_userId_creatorAddress_key" ON "ZoraCreatorCoin"("userId", "creatorAddress");
CREATE INDEX "ZoraContentCoin_userId_idx" ON "ZoraContentCoin"("userId");
CREATE INDEX "ZoraContentCoin_creatorAddress_idx" ON "ZoraContentCoin"("creatorAddress");
CREATE UNIQUE INDEX "ZoraContentCoin_userId_postId_key" ON "ZoraContentCoin"("userId", "postId");
CREATE INDEX "ZoraEarning_userId_idx" ON "ZoraEarning"("userId");
CREATE INDEX "ZoraEarning_date_idx" ON "ZoraEarning"("date");
CREATE UNIQUE INDEX "ZoraEarning_userId_creatorAddress_date_key" ON "ZoraEarning"("userId", "creatorAddress", "date");

-- AddForeignKeys for Migration 2
ALTER TABLE "ZoraCreatorCoin" ADD CONSTRAINT "ZoraCreatorCoin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ZoraContentCoin" ADD CONSTRAINT "ZoraContentCoin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ZoraEarning" ADD CONSTRAINT "ZoraEarning_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Migration 3: Stream Logging
-- ==============================================

-- CreateTable: StreamSession
CREATE TABLE "StreamSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "platformUrl" TEXT,
    "title" TEXT,
    "description" TEXT,
    "category" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3),
    "durationMinutes" INTEGER,
    "peakViewers" INTEGER,
    "averageViewers" INTEGER,
    "totalViews" INTEGER,
    "likes" INTEGER,
    "comments" INTEGER,
    "shares" INTEGER,
    "relatedTokenMint" TEXT,
    "relatedTokenAddress" TEXT,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StreamSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable: TokenSnapshot
CREATE TABLE "TokenSnapshot" (
    "id" TEXT NOT NULL,
    "streamSessionId" TEXT NOT NULL,
    "snapshotType" TEXT NOT NULL,
    "snapshotTime" TIMESTAMP(3) NOT NULL,
    "tokenMint" TEXT,
    "tokenAddress" TEXT,
    "marketCap" DECIMAL(18,2) NOT NULL,
    "price" DECIMAL(18,8) NOT NULL,
    "volume24h" DECIMAL(18,2) NOT NULL,
    "holderCount" INTEGER,
    "priceChange1h" DECIMAL(10,2),
    "priceChange24h" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TokenSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndexes for Migration 3
CREATE INDEX "StreamSession_userId_idx" ON "StreamSession"("userId");
CREATE INDEX "StreamSession_platform_idx" ON "StreamSession"("platform");
CREATE INDEX "StreamSession_startedAt_idx" ON "StreamSession"("startedAt");
CREATE INDEX "StreamSession_relatedTokenMint_idx" ON "StreamSession"("relatedTokenMint");
CREATE INDEX "StreamSession_relatedTokenAddress_idx" ON "StreamSession"("relatedTokenAddress");
CREATE INDEX "TokenSnapshot_streamSessionId_idx" ON "TokenSnapshot"("streamSessionId");
CREATE INDEX "TokenSnapshot_snapshotTime_idx" ON "TokenSnapshot"("snapshotTime");
CREATE INDEX "TokenSnapshot_tokenMint_idx" ON "TokenSnapshot"("tokenMint");
CREATE INDEX "TokenSnapshot_tokenAddress_idx" ON "TokenSnapshot"("tokenAddress");

-- AddForeignKeys for Migration 3
ALTER TABLE "StreamSession" ADD CONSTRAINT "StreamSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TokenSnapshot" ADD CONSTRAINT "TokenSnapshot_streamSessionId_fkey" FOREIGN KEY ("streamSessionId") REFERENCES "StreamSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Migration 4: Social Posts
-- ==============================================

-- CreateTable: SocialPost
CREATE TABLE "SocialPost" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "platformUrl" TEXT,
    "content" TEXT,
    "contentType" TEXT,
    "postedAt" TIMESTAMP(3) NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "hourOfDay" INTEGER NOT NULL,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER,
    "clicks" INTEGER,
    "engagementRate" DECIMAL(10,4),
    "totalEngagement" INTEGER NOT NULL DEFAULT 0,
    "relatedTokenMint" TEXT,
    "relatedTokenAddress" TEXT,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable: PostTokenSnapshot
CREATE TABLE "PostTokenSnapshot" (
    "id" TEXT NOT NULL,
    "socialPostId" TEXT NOT NULL,
    "snapshotType" TEXT NOT NULL,
    "snapshotTime" TIMESTAMP(3) NOT NULL,
    "tokenMint" TEXT,
    "tokenAddress" TEXT,
    "marketCap" DECIMAL(18,2) NOT NULL,
    "price" DECIMAL(18,8) NOT NULL,
    "volume24h" DECIMAL(18,2) NOT NULL,
    "holderCount" INTEGER,
    "priceChange1h" DECIMAL(10,2),
    "priceChange24h" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostTokenSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndexes for Migration 4
CREATE INDEX "SocialPost_userId_idx" ON "SocialPost"("userId");
CREATE INDEX "SocialPost_platform_idx" ON "SocialPost"("platform");
CREATE INDEX "SocialPost_postedAt_idx" ON "SocialPost"("postedAt");
CREATE INDEX "SocialPost_dayOfWeek_hourOfDay_idx" ON "SocialPost"("dayOfWeek", "hourOfDay");
CREATE INDEX "SocialPost_relatedTokenMint_idx" ON "SocialPost"("relatedTokenMint");
CREATE INDEX "SocialPost_relatedTokenAddress_idx" ON "SocialPost"("relatedTokenAddress");
CREATE INDEX "PostTokenSnapshot_socialPostId_idx" ON "PostTokenSnapshot"("socialPostId");
CREATE INDEX "PostTokenSnapshot_snapshotTime_idx" ON "PostTokenSnapshot"("snapshotTime");
CREATE INDEX "PostTokenSnapshot_tokenMint_idx" ON "PostTokenSnapshot"("tokenMint");
CREATE INDEX "PostTokenSnapshot_tokenAddress_idx" ON "PostTokenSnapshot"("tokenAddress");

-- AddForeignKeys for Migration 4
ALTER TABLE "SocialPost" ADD CONSTRAINT "SocialPost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PostTokenSnapshot" ADD CONSTRAINT "PostTokenSnapshot_socialPostId_fkey" FOREIGN KEY ("socialPostId") REFERENCES "SocialPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ==============================================
-- Migration Complete!
-- ==============================================
-- Total tables created: 16
-- - User, PlatformConnection, Product, RevenueSnapshot
-- - DailyMetric, SyncJob, Insight
-- - ZoraCreatorCoin, ZoraContentCoin, ZoraEarning
-- - StreamSession, TokenSnapshot
-- - SocialPost, PostTokenSnapshot
-- ==============================================
