import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next";
import { Web3Provider } from "@/components/providers/web3-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bagger | Analytics for Web3 Creators",
  description: "Web3 analytics for creators. Track coins, connect streams, and see how your content powers your brand.",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: "Bagger | Analytics for Web3 Creators",
    description: "Web3 analytics for creators. Track coins, connect streams, and see how your content powers your brand.",
    url: "https://bagger.tools",
    siteName: "Bagger",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Bagger - Analytics for Web3 Creators",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bagger | Analytics for Web3 Creators",
    description: "Web3 analytics for creators. Track coins, connect streams, and see how your content powers your brand.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <Web3Provider>
            {children}
            <Toaster position="top-right" />
          </Web3Provider>
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
