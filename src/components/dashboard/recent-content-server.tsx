import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { RecentContent } from "./recent-content";

/**
 * Server component that fetches user's recent content
 * from ContentPerformance table and passes to client component
 */
export async function RecentContentServer() {
  try {
    // Get current user from Clerk
    const clerkUser = await currentUser();

    if (!clerkUser) {
      // User not authenticated - show empty state
      return <RecentContent content={[]} />;
    }

    // Find user in database
    const user = await db.user.findUnique({
      where: { clerkId: clerkUser.id },
    });

    if (!user) {
      // User not in database yet - show empty state
      return <RecentContent content={[]} />;
    }

    // Fetch recent content (last 12 items)
    const content = await db.contentPerformance.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        publishedAt: 'desc',
      },
      take: 12,
      select: {
        id: true,
        platform: true,
        contentId: true,
        contentType: true,
        title: true,
        description: true,
        thumbnailUrl: true,
        contentUrl: true,
        views: true,
        likes: true,
        comments: true,
        publishedAt: true,
      },
    });

    console.log(`Fetched ${content.length} content items for user ${user.id}`);

    return <RecentContent content={content} />;
  } catch (error) {
    console.error("Error fetching recent content:", error);
    // Show empty state on error
    return <RecentContent content={[]} />;
  }
}
