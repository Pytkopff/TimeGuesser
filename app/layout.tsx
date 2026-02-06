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

export const metadata: Metadata = {
  title: "TimeGuesser",
  description: "Guess the year of iconic photos. 5 rounds. Big score.",
  openGraph: {
    title: "TimeGuesser - Guess the Year!",
    description: "Can you guess when these iconic photos were taken? 5 rounds, max 5000 points!",
    images: ["https://time-guesser-three.vercel.app/api/frame/image"],
  },
  other: {
    "base:app_id": "6985c5df8dcaa0daf5755f80",
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
