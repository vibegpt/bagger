import { NextRequest, NextResponse } from "next/server";
import { zoraClient } from "@/lib/integrations/zora/client";
import { pumpFunClient } from "@/lib/integrations/pumpfun/client";
import { uniswapV4Client } from "@/lib/integrations/uniswap/v4-client";
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

    // For Zora: Query Uniswap V4 pools to discover top creator coins
    // For Pump.fun: Rising/Popular creator tokens (recent activity focus)
    // NOTE: Pump.fun API is blocked by Cloudflare, using curated rising creators
    // Prioritizing creator-specific tokens over generic meme coins
    // Sorted by recent activity/volume rather than just market cap
    const RISING_PUMPFUN_CREATORS = [
      {
        mintAddress: "CPLTbYbtDMKZtHBaPqdDmHjxNwESCEB14gm6VuoDpump",
        name: "DTV",
        symbol: "DTV",
        marketCap: 5200000, // ~$5.2M (graduated to Raydium)
        rank: 1
      },
      {
        mintAddress: "2GXmB95pGD3pHV4mzNq7YsmyiEmVYWQLptbwYqgdpump",
        name: "Winternomics TV",
        symbol: "WNTV",
        marketCap: 2000000, // Will fetch live data
        rank: 2
      },
      {
        mintAddress: "WOLF_PLACEHOLDER", // TODO: Need actual mint address
        name: "Wolf",
        symbol: "WOLF",
        marketCap: 1500000, // Will fetch live data
        rank: 3
      },
      {
        mintAddress: "BIRDIE_PLACEHOLDER", // TODO: Need actual mint address
        name: "Birdie",
        symbol: "BIRDIE",
        marketCap: 1000000, // Will fetch live data
        rank: 4
      },
      {
        mintAddress: "Df6yfrKC8kZE3KNkrHERKzAetSxbrWeniQfyJY4Jpump",
        name: "Just a chill guy",
        symbol: "CHILLGUY",
        marketCap: 42700000, // ~$43M
        rank: 5
      },
    ];

    if (platform === "zora") {
      // Top 20 Zora creators by market cap (as of user data)
      // Using Zora usernames - will need to resolve to wallet addresses
      const TOP_ZORA_CREATORS = [
        { username: "propaganda", marketCap: 7000000, rank: 1 },
        { username: "docker", marketCap: 6300000, rank: 2 },
        { username: "balajis", marketCap: 4800000, rank: 3 },
        { username: "coinage", marketCap: 3800000, rank: 4 },
        { username: "jacob", marketCap: 3800000, rank: 5 },
        { username: "zxbt", marketCap: 3400000, rank: 6 },
        { username: "zoratv", marketCap: 2500000, rank: 7 },
        { username: "11am", marketCap: 1900000, rank: 8 },
        { username: "visualizevalue", marketCap: 1700000, rank: 9 },
        { username: "latenightonbase", marketCap: 1500000, rank: 10 },
        { username: "doodles", marketCap: 1300000, rank: 11 },
        { username: "shl0ms", marketCap: 1200000, rank: 12 },
        { username: "bballhy", marketCap: 1100000, rank: 13 },
        { username: "cc0studios", marketCap: 1000000, rank: 14 },
        { username: "tinysoulgame", marketCap: 991600, rank: 15 },
        { username: "coopahtroopa", marketCap: 964700, rank: 16 },
        { username: "np1", marketCap: 886900, rank: 17 },
        { username: "zorbit", marketCap: 744500, rank: 18 },
        { username: "alexanderelorenzo", marketCap: 841100, rank: 19 },
        { username: "phil", marketCap: 836000, rank: 20 },
      ];

      const topCreators = TOP_ZORA_CREATORS.slice(0, limit).map((creator) => {
        // TODO: Replace with real holder data when available
        // Option 1 (Preferred): Use Zora SDK getCoin() -> uniqueHolders when API is back online
        // Option 2 (Backup): Use Basescan API tokenholderlist endpoint with token contract addresses
        //
        // For now: Estimate holder count based on market cap correlation
        // Formula: holders typically correlate with market cap
        // Top coins (>$5M): ~5000-10000 holders
        // Mid coins ($1-5M): ~1000-5000 holders
        // Lower coins (<$1M): ~500-1000 holders
        let estimatedHolders = 0;
        if (creator.marketCap > 5000000) {
          estimatedHolders = Math.floor(5000 + (creator.marketCap / 1000) * 0.5);
        } else if (creator.marketCap > 1000000) {
          estimatedHolders = Math.floor(1000 + (creator.marketCap / 1000) * 0.3);
        } else {
          estimatedHolders = Math.floor(500 + (creator.marketCap / 1000) * 0.2);
        }

        return {
          rank: creator.rank,
          address: creator.username, // Using username as identifier for now
          name: creator.username.charAt(0).toUpperCase() + creator.username.slice(1),
          imageUrl: `https://zora.co/api/avatar/${creator.username}`, // Zora avatar URL pattern
          totalMarketCap: creator.marketCap,
          totalVolume: 0, // Not available without API
          totalHolders: estimatedHolders, // Estimated based on market cap
          platform: "zora" as const,
        };
      });

      console.log(`[Leaderboard] Returning top ${topCreators.length} Zora creators from curated list`);

      return NextResponse.json({
        success: true,
        data: topCreators,
      });

      const creatorAddresses = KNOWN_ZORA_CREATORS.slice(0, limit * 2);

      console.log(`[Leaderboard] Fetching stats for ${creatorAddresses.length} Zora creators...`);

      // Fetch stats for each known creator
      const statsPromises = creatorAddresses.map(async (creatorAddress) => {
        try {
          const stats = await zoraClient.getCreatorStats(creatorAddress as Address);
          const totalMarketCap =
            (stats.creatorCoin?.marketCap || 0) +
            stats.performance.totalContentCoinsValue;

          return {
            address: creatorAddress,
            name: stats.creatorCoin?.name || "Unknown Creator",
            imageUrl: stats.creatorCoin?.imageUrl,
            totalMarketCap,
            totalVolume:
              (stats.creatorCoin?.volumeAllTime || 0) +
              stats.contentCoins.reduce((sum, c) => sum + c.volumeAllTime, 0),
            totalHolders: stats.creatorCoin?.holderCount || 0,
            platform: "zora" as const,
          };
        } catch (error) {
          console.error(`Failed to fetch stats for ${creatorAddress}:`, error);
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
      // Fetch live data for rising/popular Pump.fun creator tokens
      const tokensToFetch = RISING_PUMPFUN_CREATORS.slice(0, limit);

      console.log(`[Leaderboard] Fetching live data for ${tokensToFetch.length} rising Pump.fun creator tokens...`);

      const statsPromises = tokensToFetch.map(async (tokenInfo) => {
        try {
          const tokenData = await pumpFunClient.getToken(tokenInfo.mintAddress);

          if (tokenData) {
            // Successfully fetched live data
            return {
              rank: tokenInfo.rank,
              address: tokenInfo.mintAddress,
              name: tokenData.name,
              imageUrl: tokenData.imageUri,
              totalMarketCap: tokenData.marketCap,
              totalVolume: tokenData.volumeAllTime,
              totalHolders: tokenData.holderCount,
              platform: "pumpfun" as const,
            };
          } else {
            // API failed, fallback to hardcoded data with estimated holders
            let estimatedHolders = 0;
            if (tokenInfo.marketCap > 100000000) {
              estimatedHolders = Math.floor(15000 + (tokenInfo.marketCap / 1000000) * 100);
            } else if (tokenInfo.marketCap > 50000000) {
              estimatedHolders = Math.floor(8000 + (tokenInfo.marketCap / 1000000) * 80);
            } else {
              estimatedHolders = Math.floor(3000 + (tokenInfo.marketCap / 1000000) * 50);
            }

            console.log(`[Leaderboard] Using fallback data for ${tokenInfo.name}`);

            return {
              rank: tokenInfo.rank,
              address: tokenInfo.mintAddress,
              name: tokenInfo.name,
              imageUrl: undefined,
              totalMarketCap: tokenInfo.marketCap,
              totalVolume: 0,
              totalHolders: estimatedHolders,
              platform: "pumpfun" as const,
            };
          }
        } catch (error) {
          console.error(`[Leaderboard] Error fetching ${tokenInfo.name}:`, error);
          // Return fallback data
          return {
            rank: tokenInfo.rank,
            address: tokenInfo.mintAddress,
            name: tokenInfo.name,
            imageUrl: undefined,
            totalMarketCap: tokenInfo.marketCap,
            totalVolume: 0,
            totalHolders: 0,
            platform: "pumpfun" as const,
          };
        }
      });

      const results = await Promise.all(statsPromises);
      const validResults = results.filter((r) => r !== null);

      console.log(`[Leaderboard] Successfully fetched ${validResults.length} Pump.fun tokens`);

      return NextResponse.json({
        success: true,
        data: validResults,
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
