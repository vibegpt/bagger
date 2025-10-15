"use client";

import { redirect } from "next/navigation";
import { useEffect } from "react";

/**
 * Main dashboard redirects to /crypto
 * This is now a Web3-only creator coins analytics platform
 */
export default function DashboardPage() {
  useEffect(() => {
    redirect("/crypto");
  }, []);

  return null;
}
