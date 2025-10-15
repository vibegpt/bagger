import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { zoraClient } from "@/lib/integrations/zora/client";
import type { Address } from "viem";

/**
 * GET /api/zora/earnings?address=0x...
 * Get creator earnings from Zora (trading fees + creator cut)
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

    // Fetch earnings data
    const earnings = await zoraClient.getCreatorEarnings(address as Address);

    return NextResponse.json({
      success: true,
      data: earnings,
    });
  } catch (error) {
    console.error("Earnings fetch error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch earnings",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
