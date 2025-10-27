-- CreateTable
CREATE TABLE "WeeklyReport" (
    "id" TEXT NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "reportDate" DATE NOT NULL,
    "zoraCreators" INTEGER NOT NULL,
    "zoraTraders" INTEGER NOT NULL,
    "zoraTradingVolume" DECIMAL(18,2) NOT NULL,
    "zoraCreatorEarnings" DECIMAL(18,2) NOT NULL,
    "zoraDailyCoins" INTEGER NOT NULL,
    "zoraGraduationRate" DECIMAL(5,2) NOT NULL,
    "zoraWhaleIncrease" DECIMAL(10,2) NOT NULL,
    "zoraAvgEarnings" DECIMAL(10,2) NOT NULL,
    "pumpDailyLaunches" INTEGER NOT NULL,
    "pumpGraduationRate" DECIMAL(5,2) NOT NULL,
    "pumpDailyGraduations" INTEGER NOT NULL,
    "pumpDailyUsers" INTEGER NOT NULL,
    "pumpProfitableUsers" DECIMAL(5,2) NOT NULL,
    "pumpAvgProfit" DECIMAL(10,2) NOT NULL,
    "arenaTVL" DECIMAL(18,2),
    "arenaCreators" INTEGER,
    "arenaTicketHolders" INTEGER,
    "arenaDailyUsers" INTEGER,
    "arenaTradingVolume" DECIMAL(18,2),
    "arenaGraduationRate" DECIMAL(5,2),
    "arenaAvgEarnings" DECIMAL(10,2),
    "arenaWhaleIncrease" DECIMAL(10,2),
    "zoraDataSource" TEXT NOT NULL,
    "pumpDataSource" TEXT NOT NULL,
    "arenaDataSource" TEXT,
    "twitterThread" JSONB,
    "insights" JSONB,
    "visualizations" JSONB,
    "posted" BOOLEAN NOT NULL DEFAULT false,
    "postedAt" TIMESTAMP(3),
    "twitterThreadUrl" TEXT,
    "threadViews" INTEGER,
    "threadLikes" INTEGER,
    "threadRetweets" INTEGER,
    "threadReplies" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeeklyReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TokenMetrics" (
    "id" TEXT NOT NULL,
    "mintAddress" VARCHAR(44) NOT NULL,
    "name" TEXT,
    "symbol" TEXT,
    "imageUrl" TEXT,
    "creatorWallet" VARCHAR(44),
    "createdAt" TIMESTAMP(3) NOT NULL,
    "marketCapUsd" DECIMAL(15,2) NOT NULL,
    "liquidityUsd" DECIMAL(15,2) NOT NULL,
    "volume24hUsd" DECIMAL(15,2) NOT NULL,
    "volume7dUsd" DECIMAL(15,2),
    "holderCount" INTEGER NOT NULL,
    "uniqueTraders24h" INTEGER,
    "uniqueTraders7d" INTEGER,
    "tokenAgeHours" INTEGER NOT NULL,
    "distinctTradingHours24h" INTEGER,
    "priceChange24h" DECIMAL(10,4),
    "liquidityChange24h" DECIMAL(10,4),
    "liquidityDrainDetected" BOOLEAN NOT NULL DEFAULT false,
    "priceCrashDetected" BOOLEAN NOT NULL DEFAULT false,
    "washTradingSuspected" BOOLEAN NOT NULL DEFAULT false,
    "creatorVerified" BOOLEAN NOT NULL DEFAULT false,
    "graduatedToRaydium" BOOLEAN NOT NULL DEFAULT false,
    "lastUpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TokenMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TokenMetricSnapshot" (
    "id" SERIAL NOT NULL,
    "mintAddress" VARCHAR(44) NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "marketCapUsd" DECIMAL(15,2) NOT NULL,
    "liquidityUsd" DECIMAL(15,2) NOT NULL,
    "priceUsd" DECIMAL(15,8) NOT NULL,
    "holderCount" INTEGER NOT NULL,

    CONSTRAINT "TokenMetricSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreatorRegistry" (
    "id" TEXT NOT NULL,
    "walletAddress" VARCHAR(44) NOT NULL,
    "username" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verificationMethod" TEXT,
    "socialLinks" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreatorRegistry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WeeklyReport_weekNumber_idx" ON "WeeklyReport"("weekNumber");

-- CreateIndex
CREATE INDEX "WeeklyReport_reportDate_idx" ON "WeeklyReport"("reportDate");

-- CreateIndex
CREATE INDEX "WeeklyReport_posted_idx" ON "WeeklyReport"("posted");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyReport_weekNumber_reportDate_key" ON "WeeklyReport"("weekNumber", "reportDate");

-- CreateIndex
CREATE UNIQUE INDEX "TokenMetrics_mintAddress_key" ON "TokenMetrics"("mintAddress");

-- CreateIndex
CREATE INDEX "TokenMetrics_marketCapUsd_idx" ON "TokenMetrics"("marketCapUsd");

-- CreateIndex
CREATE INDEX "TokenMetrics_tokenAgeHours_idx" ON "TokenMetrics"("tokenAgeHours");

-- CreateIndex
CREATE INDEX "TokenMetrics_creatorWallet_idx" ON "TokenMetrics"("creatorWallet");

-- CreateIndex
CREATE INDEX "TokenMetrics_lastUpdatedAt_idx" ON "TokenMetrics"("lastUpdatedAt");

-- CreateIndex
CREATE INDEX "TokenMetricSnapshot_mintAddress_timestamp_idx" ON "TokenMetricSnapshot"("mintAddress", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "CreatorRegistry_walletAddress_key" ON "CreatorRegistry"("walletAddress");

-- CreateIndex
CREATE INDEX "CreatorRegistry_verified_idx" ON "CreatorRegistry"("verified");

-- AddForeignKey
ALTER TABLE "TokenMetricSnapshot" ADD CONSTRAINT "TokenMetricSnapshot_mintAddress_fkey" FOREIGN KEY ("mintAddress") REFERENCES "TokenMetrics"("mintAddress") ON DELETE CASCADE ON UPDATE CASCADE;
