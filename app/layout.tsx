import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE_URL = "https://time-guesser-three.vercel.app";

// Farcaster Frame v2 / Mini App embed config (JSON format, like Framedl)
const frameEmbed = JSON.stringify({
  version: "next",
  imageUrl: `${BASE_URL}/api/og/cover`,
  button: {
    title: "Play TimeGuesser",
    action: {
      type: "launch_miniapp",
      name: "TimeGuesser",
      url: BASE_URL,
      splashImageUrl: `${BASE_URL}/api/og/splash`,
      splashBackgroundColor: "#1a1a2e",
    },
  },
});

export const metadata: Metadata = {
  title: "TimeGuesser",
  description: "Guess the year of iconic photos. 5 rounds. Big score.",
  openGraph: {
    title: "TimeGuesser - Guess the Year!",
    description: "Can you guess when these iconic photos were taken? 5 rounds, max 5000 points!",
    images: [`${BASE_URL}/api/og/cover`],
  },
  other: {
    "base:app_id": "6985c5df8dcaa0daf5755f80",
    // Farcaster Frame v2 embed - JSON format with launch_miniapp action
    "fc:frame": frameEmbed,
    // Also set fc:miniapp for newer Farcaster clients
    "fc:miniapp": frameEmbed,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
