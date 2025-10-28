import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  '/crypto(.*)',
  '/streams(.*)',
  '/posts(.*)',
  '/analytics(.*)',
  '/settings(.*)',
  '/admin(.*)',
]);

const isPublicRoute = createRouteMatcher([
  '/api/share-card(.*)',
  '/api/twitter-banner(.*)',
  '/api/pumpfun-card(.*)',
  '/api/weekly-report(.*)',
  '/api/twitter-thread(.*)',
  '/api/visualizations(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  const authData = await auth();
  if (!isPublicRoute(req) && isProtectedRoute(req)) {
    await authData.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
