-- CreateTable
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

-- CreateTable
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

-- CreateTable
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

-- CreateIndex
CREATE INDEX "ZoraCreatorCoin_userId_idx" ON "ZoraCreatorCoin"("userId");

-- CreateIndex
CREATE INDEX "ZoraCreatorCoin_creatorAddress_idx" ON "ZoraCreatorCoin"("creatorAddress");

-- CreateIndex
CREATE UNIQUE INDEX "ZoraCreatorCoin_userId_creatorAddress_key" ON "ZoraCreatorCoin"("userId", "creatorAddress");

-- CreateIndex
CREATE INDEX "ZoraContentCoin_userId_idx" ON "ZoraContentCoin"("userId");

-- CreateIndex
CREATE INDEX "ZoraContentCoin_creatorAddress_idx" ON "ZoraContentCoin"("creatorAddress");

-- CreateIndex
CREATE UNIQUE INDEX "ZoraContentCoin_userId_postId_key" ON "ZoraContentCoin"("userId", "postId");

-- CreateIndex
CREATE INDEX "ZoraEarning_userId_idx" ON "ZoraEarning"("userId");

-- CreateIndex
CREATE INDEX "ZoraEarning_date_idx" ON "ZoraEarning"("date");

-- CreateIndex
CREATE UNIQUE INDEX "ZoraEarning_userId_creatorAddress_date_key" ON "ZoraEarning"("userId", "creatorAddress", "date");

-- AddForeignKey
ALTER TABLE "ZoraCreatorCoin" ADD CONSTRAINT "ZoraCreatorCoin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ZoraContentCoin" ADD CONSTRAINT "ZoraContentCoin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ZoraEarning" ADD CONSTRAINT "ZoraEarning_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
