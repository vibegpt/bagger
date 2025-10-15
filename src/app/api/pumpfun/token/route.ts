import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { pumpFunClient } from "@/lib/integrations/pumpfun/client";

/**
 * GET /api/pumpfun/token?mint=...
 * Get token data for a specific Pump.fun token
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const mint = searchParams.get("mint");

    if (!mint) {
      return NextResponse.json(
        { error: "Token mint address is required" },
        { status: 400 }
      );
    }

    // Fetch token data
    const token = await pumpFunClient.getToken(mint);

    if (!token) {
      return NextResponse.json(
        { error: "Token not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: token,
    });
  } catch (error) {
    console.error("Token fetch error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch token",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
