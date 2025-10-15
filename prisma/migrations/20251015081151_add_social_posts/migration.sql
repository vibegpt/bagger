-- CreateTable
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

-- CreateTable
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

-- CreateIndex
CREATE INDEX "SocialPost_userId_idx" ON "SocialPost"("userId");

-- CreateIndex
CREATE INDEX "SocialPost_platform_idx" ON "SocialPost"("platform");

-- CreateIndex
CREATE INDEX "SocialPost_postedAt_idx" ON "SocialPost"("postedAt");

-- CreateIndex
CREATE INDEX "SocialPost_dayOfWeek_hourOfDay_idx" ON "SocialPost"("dayOfWeek", "hourOfDay");

-- CreateIndex
CREATE INDEX "SocialPost_relatedTokenMint_idx" ON "SocialPost"("relatedTokenMint");

-- CreateIndex
CREATE INDEX "SocialPost_relatedTokenAddress_idx" ON "SocialPost"("relatedTokenAddress");

-- CreateIndex
CREATE INDEX "PostTokenSnapshot_socialPostId_idx" ON "PostTokenSnapshot"("socialPostId");

-- CreateIndex
CREATE INDEX "PostTokenSnapshot_snapshotTime_idx" ON "PostTokenSnapshot"("snapshotTime");

-- CreateIndex
CREATE INDEX "PostTokenSnapshot_tokenMint_idx" ON "PostTokenSnapshot"("tokenMint");

-- CreateIndex
CREATE INDEX "PostTokenSnapshot_tokenAddress_idx" ON "PostTokenSnapshot"("tokenAddress");

-- AddForeignKey
ALTER TABLE "SocialPost" ADD CONSTRAINT "SocialPost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostTokenSnapshot" ADD CONSTRAINT "PostTokenSnapshot_socialPostId_fkey" FOREIGN KEY ("socialPostId") REFERENCES "SocialPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
