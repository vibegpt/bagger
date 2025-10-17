import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bagger - Base & Solana Creator Coins",
  description: "Track creator coins across Base (Zora) and Solana (Pump.fun)",
  openGraph: {
    title: "Bagger - Creator Coin Analytics",
    description: "Track your bags across Base & Solana",
    images: ["/og-image.png"],
  },
};

export default function MiniAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}
