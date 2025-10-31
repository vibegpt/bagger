/*
  Warnings:

  - A unique constraint covering the columns `[youtubeChannelId]` on the table `CreatorRegistry` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[instagramUsername]` on the table `CreatorRegistry` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[twitterHandle]` on the table `CreatorRegistry` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tiktokUsername]` on the table `CreatorRegistry` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `CreatorRegistry` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CreatorRegistry" ADD COLUMN     "discordHandle" TEXT,
ADD COLUMN     "instagramBusinessId" TEXT,
ADD COLUMN     "instagramUsername" TEXT,
ADD COLUMN     "telegramHandle" TEXT,
ADD COLUMN     "tiktokUsername" TEXT,
ADD COLUMN     "twitterHandle" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "verificationProof" TEXT,
ADD COLUMN     "youtubeChannelId" TEXT,
ADD COLUMN     "youtubeChannelName" TEXT;

-- AlterTable
ALTER TABLE "PlatformConnection" ADD COLUMN     "instagramBusinessId" TEXT,
ADD COLUMN     "instagramFollowers" INTEGER,
ADD COLUMN     "instagramUsername" TEXT,
ADD COLUMN     "tiktokFollowers" INTEGER,
ADD COLUMN     "tiktokUsername" TEXT,
ADD COLUMN     "youtubeChannelId" TEXT,
ADD COLUMN     "youtubeChannelName" TEXT,
ADD COLUMN     "youtubeSubscribers" INTEGER;

-- CreateTable
CREATE TABLE "ContentPerformance" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "contentUrl" TEXT,
    "thumbnailUrl" TEXT,
    "title" TEXT,
    "description" TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "views" INTEGER,
    "likes" INTEGER,
    "comments" INTEGER,
    "shares" INTEGER,
    "saves" INTEGER,
    "watchTimeMinutes" DOUBLE PRECISION,
    "averageViewDuration" DOUBLE PRECISION,
    "clickThroughRate" DOUBLE PRECISION,
    "subscribersGained" INTEGER,
    "reach" INTEGER,
    "impressions" INTEGER,
    "reelsPlays" INTEGER,
    "completionRate" DOUBLE PRECISION,
    "engagementRate" DOUBLE PRECISION,
    "totalEngagement" INTEGER,
    "relatedTokenMint" TEXT,
    "relatedTokenAddress" TEXT,
    "source" TEXT NOT NULL DEFAULT 'api',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentPerformance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentTokenSnapshot" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
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

    CONSTRAINT "ContentTokenSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Demographics" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "age13_17" DOUBLE PRECISION,
    "age18_24" DOUBLE PRECISION,
    "age25_34" DOUBLE PRECISION,
    "age35_44" DOUBLE PRECISION,
    "age45_54" DOUBLE PRECISION,
    "age55_64" DOUBLE PRECISION,
    "age65Plus" DOUBLE PRECISION,
    "genderMale" DOUBLE PRECISION,
    "genderFemale" DOUBLE PRECISION,
    "genderOther" DOUBLE PRECISION,
    "topCountries" JSONB,
    "topCities" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Demographics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrowthPrediction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "predictedFollowers" INTEGER,
    "predictedRevenue" DOUBLE PRECISION,
    "predictedTokenHolders" INTEGER,
    "predictedMarketCap" DECIMAL(18,2),
    "predictionDate" TIMESTAMP(3) NOT NULL,
    "targetDate" TIMESTAMP(3) NOT NULL,
    "confidenceScore" DOUBLE PRECISION,
    "recommendations" JSONB,
    "modelVersion" TEXT,
    "dataPointsUsed" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GrowthPrediction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CorrelationInsight" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "insightType" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "metricValue" DECIMAL(10,2),
    "metricUnit" TEXT,
    "confidenceScore" DOUBLE PRECISION,
    "sampleSize" INTEGER,
    "timeRange" TEXT,
    "relatedPlatform" TEXT,
    "relatedTokenMint" TEXT,
    "relatedTokenAddress" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "dismissed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CorrelationInsight_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContentPerformance_userId_idx" ON "ContentPerformance"("userId");

-- CreateIndex
CREATE INDEX "ContentPerformance_platform_idx" ON "ContentPerformance"("platform");

-- CreateIndex
CREATE INDEX "ContentPerformance_publishedAt_idx" ON "ContentPerformance"("publishedAt");

-- CreateIndex
CREATE INDEX "ContentPerformance_relatedTokenMint_idx" ON "ContentPerformance"("relatedTokenMint");

-- CreateIndex
CREATE INDEX "ContentPerformance_relatedTokenAddress_idx" ON "ContentPerformance"("relatedTokenAddress");

-- CreateIndex
CREATE UNIQUE INDEX "ContentPerformance_userId_platform_contentId_key" ON "ContentPerformance"("userId", "platform", "contentId");

-- CreateIndex
CREATE INDEX "ContentTokenSnapshot_contentId_idx" ON "ContentTokenSnapshot"("contentId");

-- CreateIndex
CREATE INDEX "ContentTokenSnapshot_snapshotTime_idx" ON "ContentTokenSnapshot"("snapshotTime");

-- CreateIndex
CREATE INDEX "ContentTokenSnapshot_tokenMint_idx" ON "ContentTokenSnapshot"("tokenMint");

-- CreateIndex
CREATE INDEX "ContentTokenSnapshot_tokenAddress_idx" ON "ContentTokenSnapshot"("tokenAddress");

-- CreateIndex
CREATE INDEX "Demographics_userId_idx" ON "Demographics"("userId");

-- CreateIndex
CREATE INDEX "Demographics_date_idx" ON "Demographics"("date");

-- CreateIndex
CREATE UNIQUE INDEX "Demographics_userId_platform_date_key" ON "Demographics"("userId", "platform", "date");

-- CreateIndex
CREATE INDEX "GrowthPrediction_userId_platform_idx" ON "GrowthPrediction"("userId", "platform");

-- CreateIndex
CREATE INDEX "GrowthPrediction_targetDate_idx" ON "GrowthPrediction"("targetDate");

-- CreateIndex
CREATE INDEX "CorrelationInsight_userId_idx" ON "CorrelationInsight"("userId");

-- CreateIndex
CREATE INDEX "CorrelationInsight_insightType_idx" ON "CorrelationInsight"("insightType");

-- CreateIndex
CREATE INDEX "CorrelationInsight_priority_idx" ON "CorrelationInsight"("priority");

-- CreateIndex
CREATE INDEX "CorrelationInsight_createdAt_idx" ON "CorrelationInsight"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CreatorRegistry_youtubeChannelId_key" ON "CreatorRegistry"("youtubeChannelId");

-- CreateIndex
CREATE UNIQUE INDEX "CreatorRegistry_instagramUsername_key" ON "CreatorRegistry"("instagramUsername");

-- CreateIndex
CREATE UNIQUE INDEX "CreatorRegistry_twitterHandle_key" ON "CreatorRegistry"("twitterHandle");

-- CreateIndex
CREATE UNIQUE INDEX "CreatorRegistry_tiktokUsername_key" ON "CreatorRegistry"("tiktokUsername");

-- CreateIndex
CREATE INDEX "CreatorRegistry_youtubeChannelId_idx" ON "CreatorRegistry"("youtubeChannelId");

-- CreateIndex
CREATE INDEX "CreatorRegistry_instagramUsername_idx" ON "CreatorRegistry"("instagramUsername");

-- CreateIndex
CREATE INDEX "CreatorRegistry_twitterHandle_idx" ON "CreatorRegistry"("twitterHandle");

-- CreateIndex
CREATE INDEX "PlatformConnection_platform_idx" ON "PlatformConnection"("platform");

-- AddForeignKey
ALTER TABLE "ContentPerformance" ADD CONSTRAINT "ContentPerformance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentTokenSnapshot" ADD CONSTRAINT "ContentTokenSnapshot_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "ContentPerformance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Demographics" ADD CONSTRAINT "Demographics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrowthPrediction" ADD CONSTRAINT "GrowthPrediction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CorrelationInsight" ADD CONSTRAINT "CorrelationInsight_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
