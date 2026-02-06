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

export const metadata: Metadata = {
  title: "TimeGuesser",
  description: "Guess the year of iconic photos. 5 rounds. Big score.",
  openGraph: {
    title: "TimeGuesser - Guess the Year!",
    description: "Can you guess when these iconic photos were taken? 5 rounds, max 5000 points!",
    images: [`${BASE_URL}/api/frame/image`],
  },
  other: {
    "base:app_id": "6985c5df8dcaa0daf5755f80",
    // Farcaster Frame v1 meta tags
    "fc:frame": "vNext",
    "fc:frame:image": `${BASE_URL}/api/frame/image`,
    "fc:frame:image:aspect_ratio": "1.91:1",
    "fc:frame:post_url": `${BASE_URL}/api/frame`,
    "fc:frame:button:1": "🎮 Play Now",
    "fc:frame:button:1:action": "link",
    "fc:frame:button:1:target": BASE_URL,
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
