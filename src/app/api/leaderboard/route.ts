import { NextRequest, NextResponse } from "next/server";
import { zoraClient } from "@/lib/integrations/zora/client";
import { pumpFunClient } from "@/lib/integrations/pumpfun/client";
import type { Address } from "viem";

/**
 * GET /api/leaderboard?platform=zora|pumpfun&limit=10
 * Get top creators ranked by total market cap
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const platform = searchParams.get("platform") || "zora";
    const limit = parseInt(searchParams.get("limit") || "10");

    // Curated list of known creators to track
    // TODO: Replace with database query or blockchain indexer for auto-discovery
    // For now, using known addresses from the demo/testing
    const KNOWN_ZORA_CREATORS = [
      "0x1234567890123456789012345678901234567890", // Demo address from homepage
    ];

    const KNOWN_PUMPFUN_CREATORS = [
      "DpQFyPoV44bXpw7qmACqX7ghC8hxxmFD5HDA1CthBZX8", // Demo address from homepage
    ];

    if (platform === "zora") {
      // Fetch stats for all known Zora creators in parallel
      const statsPromises = KNOWN_ZORA_CREATORS.map(async (address) => {
        try {
          const stats = await zoraClient.getCreatorStats(address as Address);
          const totalMarketCap =
            (stats.creatorCoin?.marketCap || 0) +
            stats.performance.totalContentCoinsValue;

          return {
            address,
            name: stats.creatorCoin?.name,
            imageUrl: stats.creatorCoin?.imageUrl,
            totalMarketCap,
            totalVolume:
              (stats.creatorCoin?.volumeAllTime || 0) +
              stats.contentCoins.reduce((sum, c) => sum + c.volumeAllTime, 0),
            totalHolders: stats.creatorCoin?.holderCount || 0,
            platform: "zora" as const,
          };
        } catch (error) {
          console.error(`Failed to fetch stats for ${address}:`, error);
          return null;
        }
      });

      const results = await Promise.all(statsPromises);
      const validResults = results.filter((r) => r !== null);

      // Sort by market cap and add ranking
      const ranked = validResults
        .sort((a, b) => b!.totalMarketCap - a!.totalMarketCap)
        .slice(0, limit)
        .map((entry, index) => ({
          ...entry,
          rank: index + 1,
        }));

      return NextResponse.json({
        success: true,
        data: ranked,
      });
    } else if (platform === "pumpfun") {
      // Fetch stats for all known Pump.fun creators in parallel
      const statsPromises = KNOWN_PUMPFUN_CREATORS.map(async (address) => {
        try {
          const stats = await pumpFunClient.getCreatorStats(address);

          return {
            address,
            name: stats.performance.topToken?.name,
            imageUrl: stats.performance.topToken?.imageUri,
            totalMarketCap: stats.totalMarketCap,
            totalVolume: stats.totalVolume,
            totalHolders: stats.tokens.reduce((sum, t) => sum + t.holderCount, 0),
            successRate: stats.performance.successRate,
            tokensCreated: stats.totalTokensCreated,
            platform: "pumpfun" as const,
          };
        } catch (error) {
          console.error(`Failed to fetch stats for ${address}:`, error);
          return null;
        }
      });

      const results = await Promise.all(statsPromises);
      const validResults = results.filter((r) => r !== null);

      // Sort by market cap and add ranking
      const ranked = validResults
        .sort((a, b) => b!.totalMarketCap - a!.totalMarketCap)
        .slice(0, limit)
        .map((entry, index) => ({
          ...entry,
          rank: index + 1,
        }));

      return NextResponse.json({
        success: true,
        data: ranked,
      });
    } else {
      return NextResponse.json(
        { error: "Invalid platform. Use 'zora' or 'pumpfun'" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Leaderboard fetch error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch leaderboard",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
