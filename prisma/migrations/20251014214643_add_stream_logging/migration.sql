-- CreateTable
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

-- CreateTable
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

-- CreateIndex
CREATE INDEX "StreamSession_userId_idx" ON "StreamSession"("userId");

-- CreateIndex
CREATE INDEX "StreamSession_platform_idx" ON "StreamSession"("platform");

-- CreateIndex
CREATE INDEX "StreamSession_startedAt_idx" ON "StreamSession"("startedAt");

-- CreateIndex
CREATE INDEX "StreamSession_relatedTokenMint_idx" ON "StreamSession"("relatedTokenMint");

-- CreateIndex
CREATE INDEX "StreamSession_relatedTokenAddress_idx" ON "StreamSession"("relatedTokenAddress");

-- CreateIndex
CREATE INDEX "TokenSnapshot_streamSessionId_idx" ON "TokenSnapshot"("streamSessionId");

-- CreateIndex
CREATE INDEX "TokenSnapshot_snapshotTime_idx" ON "TokenSnapshot"("snapshotTime");

-- CreateIndex
CREATE INDEX "TokenSnapshot_tokenMint_idx" ON "TokenSnapshot"("tokenMint");

-- CreateIndex
CREATE INDEX "TokenSnapshot_tokenAddress_idx" ON "TokenSnapshot"("tokenAddress");

-- AddForeignKey
ALTER TABLE "StreamSession" ADD CONSTRAINT "StreamSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TokenSnapshot" ADD CONSTRAINT "TokenSnapshot_streamSessionId_fkey" FOREIGN KEY ("streamSessionId") REFERENCES "StreamSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
