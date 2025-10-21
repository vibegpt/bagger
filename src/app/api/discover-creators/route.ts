import { NextResponse } from "next/server";
import { getCoins } from "@zoralabs/coins-sdk";
import { base } from "viem/chains";

/**
 * GET /api/discover-creators
 * Discover top Zora creators by querying Zora SDK for highest market cap coins
 */
export async function GET() {
  try {
    console.log("[Discover] Querying Zora SDK for top creator coins...");

    const result = await getCoins({
      chain: base.id,
      limit: 50, // Get more to filter and sort
    });

    if (!result.success || !result.data) {
      return NextResponse.json(
        { error: "Failed to fetch creator coins from Zora" },
        { status: 500 }
      );
    }

    const creators = result.data.coins
      .map((token) => ({
        tokenAddress: token.address,
        creatorAddress: token.creatorAddress,
        name: token.name,
        symbol: token.symbol,
        marketCap: parseFloat(token.marketCap || "0"),
        totalSupply: token.totalSupply,
        image: token.image || token.imageUrl,
      }))
      .filter((c) => c.marketCap > 0 && c.creatorAddress); // Only include coins with market cap and creator

    // Sort by market cap descending
    creators.sort((a, b) => b.marketCap - a.marketCap);

    const top10 = creators.slice(0, 10);

    console.log(`[Discover] Found ${creators.length} creator coins with market cap`);
    console.log("[Discover] Top 10:", top10.map(c => `${c.name} ($${(c.marketCap / 1000).toFixed(1)}K) - ${c.creatorAddress}`));

    return NextResponse.json({
      success: true,
      data: top10,
      total: creators.length,
    });
  } catch (error) {
    console.error("Discover creators error:", error);
    return NextResponse.json(
      {
        error: "Failed to discover creators",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
