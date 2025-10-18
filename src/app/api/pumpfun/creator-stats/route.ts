import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { pumpFunClient } from "@/lib/integrations/pumpfun/client";

/**
 * GET /api/pumpfun/creator-stats?creator=...
 * Get creator statistics for Pump.fun tokens
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const creator = searchParams.get("creator");

    if (!creator) {
      return NextResponse.json(
        { error: "Creator address is required" },
        { status: 400 }
      );
    }

    // Public access - no authentication required for viewing creator stats
    // This enables public creator profile pages
    const stats = await pumpFunClient.getCreatorStats(creator);

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Creator stats fetch error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch creator stats",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
