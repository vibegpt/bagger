import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { exchangeCodeForTokens } from "@/lib/integrations/whop/oauth";
import { syncWhopData } from "@/lib/integrations/whop/sync";
import { db } from "@/lib/db";

export default async function WhopCallbackPage({
  searchParams,
}: {
  searchParams: { code?: string; state?: string };
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const code = searchParams.code;
  const state = searchParams.state;

  if (!code || !state || state !== userId) {
    redirect("/dashboard?error=invalid_oauth");
  }

  try {
    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code);

    // Find or create user in database
    const user = await db.user.upsert({
      where: { clerkId: userId },
      update: {},
      create: {
        clerkId: userId,
        email: "", // Will be updated from Clerk webhook
      },
    });

    // Save platform connection
    await db.platformConnection.upsert({
      where: {
        userId_platform: {
          userId: user.id,
          platform: "whop",
        },
      },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpiresAt: new Date(Date.now() + tokens.expires_in * 1000),
        syncStatus: "active",
        lastSyncedAt: new Date(),
      },
      create: {
        userId: user.id,
        platform: "whop",
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpiresAt: new Date(Date.now() + tokens.expires_in * 1000),
        syncStatus: "active",
      },
    });

    // Trigger initial data sync
    await syncWhopData(user.id, tokens.access_token);

    redirect("/dashboard?success=whop_connected");
  } catch (error) {
    console.error("Whop OAuth error:", error);
    redirect("/dashboard?error=oauth_failed");
  }
}
