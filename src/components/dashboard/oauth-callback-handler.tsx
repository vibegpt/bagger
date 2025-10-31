"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";

/**
 * Client component that handles OAuth callback messages
 * Shows success/error toasts based on query parameters
 * Cleans up URL after showing the message
 */
export function OAuthCallbackHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const connected = searchParams.get("connected");
    const channel = searchParams.get("channel");
    const error = searchParams.get("error");

    // Handle successful connection
    if (connected === "youtube" && channel) {
      toast.success(`Successfully connected to ${decodeURIComponent(channel)}!`, {
        description: "Your YouTube videos will now be synced automatically.",
        duration: 5000,
      });

      // Clean up URL
      const url = new URL(window.location.href);
      url.searchParams.delete("connected");
      url.searchParams.delete("channel");
      router.replace(url.pathname);
    }

    // Handle errors
    if (error) {
      let errorMessage = "Failed to connect platform";
      let errorDescription = "Please try again or contact support.";

      switch (error) {
        case "youtube_access_denied":
          errorMessage = "YouTube connection cancelled";
          errorDescription = "You need to grant access to connect your YouTube account.";
          break;
        case "youtube_missing_parameters":
          errorMessage = "Invalid OAuth callback";
          errorDescription = "Missing required parameters. Please try again.";
          break;
        case "youtube_connection_failed":
          errorMessage = "YouTube connection failed";
          errorDescription = "Unable to complete connection. Please try again.";
          break;
        case "youtube_no_channel":
          errorMessage = "No YouTube channel found";
          errorDescription = "Please create a YouTube channel first, then try connecting again.";
          break;
        default:
          errorMessage = `Connection error: ${error}`;
          break;
      }

      toast.error(errorMessage, {
        description: errorDescription,
        duration: 7000,
      });

      // Clean up URL
      const url = new URL(window.location.href);
      url.searchParams.delete("error");
      router.replace(url.pathname);
    }
  }, [searchParams, router]);

  return null; // This component only handles side effects
}
