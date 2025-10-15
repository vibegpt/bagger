import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { zoraClient } from "@/lib/integrations/zora/client";
import type { Address } from "viem";

/**
 * GET /api/zora/creator-coin?address=0x...
 * Get creator coin data for a specific address
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

    // Fetch creator coin data
    const creatorCoin = await zoraClient.getCreatorCoin(address as Address);

    if (!creatorCoin) {
      return NextResponse.json(
        { error: "Creator coin not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: creatorCoin,
    });
  } catch (error) {
    console.error("Creator coin fetch error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch creator coin",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
