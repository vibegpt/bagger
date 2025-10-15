import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getWhopAuthUrl } from "@/lib/integrations/whop/oauth";

export default async function ConnectWhopPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Generate OAuth URL with user ID as state
  const authUrl = getWhopAuthUrl(userId);

  // Redirect to Whop OAuth
  redirect(authUrl);
}
