import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { zoraClient } from "@/lib/integrations/zora/client";
import type { Address } from "viem";

/**
 * GET /api/zora/stats?address=0x...
 * Get comprehensive Zora stats for a creator address
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get("address");

    if (!address) {
      return NextResponse.json(
        { error: "Creator address is required" },
        { status: 400 }
      );
    }

    // Public access - no authentication required for viewing creator stats
    // This enables public creator profile pages
    const stats = await zoraClient.getCreatorStats(address as Address);

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Zora stats error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch Zora stats",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
