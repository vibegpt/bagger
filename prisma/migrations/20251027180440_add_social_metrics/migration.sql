-- CreateTable
CREATE TABLE "SocialMetrics" (
    "id" TEXT NOT NULL,
    "mintAddress" VARCHAR(44) NOT NULL,
    "coinGeckoId" TEXT,
    "twitterFollowers" INTEGER,
    "redditSubscribers" INTEGER,
    "telegramUsers" INTEGER,
    "facebookLikes" INTEGER,
    "communityScore" DECIMAL(5,2),
    "sentimentUpPercentage" DECIMAL(5,2),
    "sentimentDownPercentage" DECIMAL(5,2),
    "twitterGrowth7d" INTEGER,
    "redditGrowth7d" INTEGER,
    "communityGrowthRate" DECIMAL(10,4),
    "lastSyncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialMetricsSnapshot" (
    "id" SERIAL NOT NULL,
    "mintAddress" VARCHAR(44) NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "twitterFollowers" INTEGER,
    "redditSubscribers" INTEGER,
    "telegramUsers" INTEGER,
    "facebookLikes" INTEGER,
    "communityScore" DECIMAL(5,2),
    "sentimentUpPercentage" DECIMAL(5,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SocialMetricsSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SocialMetrics_coinGeckoId_idx" ON "SocialMetrics"("coinGeckoId");

-- CreateIndex
CREATE INDEX "SocialMetrics_lastSyncedAt_idx" ON "SocialMetrics"("lastSyncedAt");

-- CreateIndex
CREATE UNIQUE INDEX "SocialMetrics_mintAddress_key" ON "SocialMetrics"("mintAddress");

-- CreateIndex
CREATE INDEX "SocialMetricsSnapshot_mintAddress_timestamp_idx" ON "SocialMetricsSnapshot"("mintAddress", "timestamp");

-- CreateIndex
CREATE INDEX "SocialMetricsSnapshot_timestamp_idx" ON "SocialMetricsSnapshot"("timestamp");
