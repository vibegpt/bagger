import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { zoraClient } from "@/lib/integrations/zora/client";
import type { Address } from "viem";

/**
 * GET /api/zora/content-coins?address=0x...
 * Get all content coins (posts) for a creator
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get("address");

    if (!address) {
      return NextResponse.json(
        { error: "Creator address is required" },
        { status: 400 }
      );
    }

    // Fetch content coins
    const contentCoins = await zoraClient.getCreatorContentCoins(address as Address);

    return NextResponse.json({
      success: true,
      data: contentCoins,
      count: contentCoins.length,
    });
  } catch (error) {
    console.error("Content coins fetch error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch content coins",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
