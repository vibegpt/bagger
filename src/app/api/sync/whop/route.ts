import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { syncWhopData } from "@/lib/integrations/whop/sync";

export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user and platform connection
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      include: {
        platformConnections: {
          where: {
            platform: "whop",
            syncStatus: "active",
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const whopConnection = user.platformConnections[0];

    if (!whopConnection || !whopConnection.accessToken) {
      return NextResponse.json(
        { error: "Whop account not connected" },
        { status: 400 }
      );
    }

    // Create sync job
    const syncJob = await db.syncJob.create({
      data: {
        userId: user.id,
        platform: "whop",
        status: "running",
        startedAt: new Date(),
      },
    });

    try {
      // Perform sync
      const result = await syncWhopData(user.id, whopConnection.accessToken);

      // Update sync job as completed
      await db.syncJob.update({
        where: { id: syncJob.id },
        data: {
          status: "completed",
          completedAt: new Date(),
          recordsSynced: result.productsSynced,
        },
      });

      // Update platform connection last synced
      await db.platformConnection.update({
        where: { id: whopConnection.id },
        data: {
          lastSyncedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        productsSynced: result.productsSynced,
        message: "Sync completed successfully",
      });
    } catch (syncError) {
      // Update sync job as failed
      await db.syncJob.update({
        where: { id: syncJob.id },
        data: {
          status: "failed",
          completedAt: new Date(),
          errorMessage: syncError instanceof Error ? syncError.message : "Unknown error",
        },
      });

      throw syncError;
    }
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json(
      {
        error: "Sync failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
