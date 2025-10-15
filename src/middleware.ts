import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define public routes - these are accessible without authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/privacy(.*)',
  '/terms(.*)',
]);

export default clerkMiddleware((auth, request) => {
  // Don't protect public routes
  if (isPublicRoute(request)) {
    return;
  }

  // Protect all other routes
  auth().protect();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
