import { NextRequest, NextResponse } from "next/server";
import { zoraClient } from "@/lib/integrations/zora/client";
import { pumpFunClient } from "@/lib/integrations/pumpfun/client";
import type { Address } from "viem";

/**
 * GET /api/token?address=...&platform=zora|pumpfun
 * Get basic token data by token address (public, free tier)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get("address");
    const platform = searchParams.get("platform");

    if (!address) {
      return NextResponse.json(
        { error: "Token address is required" },
        { status: 400 }
      );
    }

    // Try to detect platform if not specified
    let detectedPlatform = platform;
    if (!detectedPlatform) {
      // Ethereum/Base addresses start with 0x and are 42 chars
      // Solana addresses are base58 and typically 32-44 chars without 0x
      detectedPlatform = address.startsWith("0x") ? "zora" : "pumpfun";
    }

    if (detectedPlatform === "zora") {
      // Fetch token from Zora using getCoin
      const { getCoin } = await import("@zoralabs/coins-sdk");
      const { base } = await import("viem/chains");

      const coinResult = await getCoin({
        address: address as Address,
        chain: base.id,
      });

      const coin = coinResult.data?.zora20Token;

      if (!coin) {
        return NextResponse.json(
          { error: "Token not found on Zora" },
          { status: 404 }
        );
      }

      // Try multiple image fields and fallbacks
      const imageUrl =
        coin.image ||
        coin.imageUrl ||
        coin.metadata?.image ||
        coin.metadata?.imageUrl ||
        (coin.creatorAddress ? `https://zora.co/api/avatar/${coin.creatorAddress}` : undefined);

      return NextResponse.json({
        success: true,
        platform: "zora",
        data: {
          address: coin.address,
          creatorAddress: coin.creatorAddress, // Key field for upgrade CTA
          name: coin.name,
          symbol: coin.symbol,
          imageUrl: imageUrl,
          totalSupply: coin.totalSupply,
          marketCap: parseFloat(coin.marketCap || "0"),
          price: parseFloat(coin.tokenPrice?.priceInUsdc || "0"),
          priceChange24h: parseFloat(coin.marketCapDelta24h || "0"),
          volume24h: parseFloat(coin.volume24h || "0"),
          volumeAllTime: parseFloat(coin.totalVolume || "0"),
          holderCount: 0, // Not available in basic API
          createdAt: coin.createdAt ? new Date(coin.createdAt) : new Date(),
        },
      });
    } else if (detectedPlatform === "pumpfun") {
      // Fetch token from Pump.fun
      let token = await pumpFunClient.getToken(address);

      // If Pump.fun API fails (Cloudflare blocks), try DexScreener as fallback
      if (!token) {
        console.log(`Pump.fun API failed for ${address}, trying DexScreener fallback...`);
        const marketData = await pumpFunClient.getTokenMarketData(address);

        if (marketData) {
          // Create fallback token data with full market data from DexScreener
          return NextResponse.json({
            success: true,
            platform: "pumpfun",
            data: {
              address: address,
              creatorAddress: undefined,
              name: marketData.name,
              symbol: marketData.symbol,
              imageUrl: marketData.imageUri,
              description: "Token data from DexScreener (graduated from Pump.fun to Raydium)",
              totalSupply: "1000000000",
              marketCap: marketData.marketCap,
              price: marketData.price,
              priceChange24h: marketData.priceChange24h,
              volume24h: marketData.volume24h,
              volumeAllTime: marketData.volume24h, // Use 24h as proxy for all-time
              holderCount: 0, // Not available from DexScreener
              complete: true, // Assume graduated
              createdAt: new Date(),
            },
          });
        }

        return NextResponse.json(
          { error: "Token not found on Pump.fun or DexScreener" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        platform: "pumpfun",
        data: {
          address: token.mint,
          creatorAddress: token.creator, // Key field for upgrade CTA
          name: token.name,
          symbol: token.symbol,
          imageUrl: token.imageUri,
          description: token.description,
          totalSupply: token.totalSupply.toString(),
          marketCap: token.marketCap,
          price: token.price,
          volume24h: token.volume24h,
          volumeAllTime: token.volumeAllTime,
          holderCount: token.holderCount,
          complete: token.complete, // Bonding curve status
          createdAt: new Date(token.createdTimestamp),
          // Social links
          twitter: token.twitter,
          telegram: token.telegram,
          website: token.website,
        },
      });
    } else {
      return NextResponse.json(
        { error: "Invalid platform. Use 'zora' or 'pumpfun'" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Token fetch error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch token data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
