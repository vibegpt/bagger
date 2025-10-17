import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { pumpFunClient } from "@/lib/integrations/pumpfun/client";

/**
 * GET /api/pumpfun/trending?limit=10
 * Get trending Pump.fun tokens
 * Public endpoint - no auth required for Mini App usage
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "10");

    // Fetch trending tokens
    const tokens = await pumpFunClient.getTrendingTokens(limit);

    return NextResponse.json({
      success: true,
      data: tokens,
      count: tokens.length,
    });
  } catch (error) {
    console.error("Trending tokens fetch error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch trending tokens",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
