/**
 * Quick script to set up Whop connection for testing
 * Run with: npx tsx scripts/setup-whop-connection.ts
 */

import { db } from "../src/lib/db";

async function main() {
  const clerkId = process.argv[2];
  const apiKey = process.env.WHOP_API_KEY;

  if (!clerkId) {
    console.error("Usage: npx tsx scripts/setup-whop-connection.ts <clerkId>");
    console.error("Get your clerkId from Clerk dashboard after signing up");
    process.exit(1);
  }

  if (!apiKey) {
    console.error("WHOP_API_KEY not found in environment variables");
    process.exit(1);
  }

  console.log("Setting up Whop connection...");

  // Find or create user
  let user = await db.user.findUnique({
    where: { clerkId },
  });

  if (!user) {
    console.log("Creating user...");
    user = await db.user.create({
      data: {
        clerkId,
        email: "test@example.com", // Will be updated from Clerk
      },
    });
  }

  // Create platform connection
  const connection = await db.platformConnection.upsert({
    where: {
      userId_platform: {
        userId: user.id,
        platform: "whop",
      },
    },
    update: {
      accessToken: apiKey,
      syncStatus: "active",
    },
    create: {
      userId: user.id,
      platform: "whop",
      accessToken: apiKey,
      syncStatus: "active",
    },
  });

  console.log("✅ Whop connection set up successfully!");
  console.log("User ID:", user.id);
  console.log("Connection ID:", connection.id);
  console.log("\nYou can now:");
  console.log("1. Sign in with your Clerk account");
  console.log("2. Visit /settings and click 'Sync Now'");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
