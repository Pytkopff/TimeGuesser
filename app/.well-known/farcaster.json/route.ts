import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://time-guesser-three.vercel.app";

export async function GET() {
  const manifest = {
    accountAssociation: {
      header:
        "eyJmaWQiOjU0MzYzNiwidHlwZSI6ImF1dGgiLCJrZXkiOiIweGM0ZkZEOTg1QUM3MTdhZjBDYjY5OTMzRmVhRWUzNmFCZjFkRTg3OTgifQ",
      payload:
        "eyJkb21haW4iOiJ0aW1lLWd1ZXNzZXItdGhyZWUudmVyY2VsLmFwcCJ9",
      signature:
        "9adXrb/FVLIaXEYnWp5K6nPkri2Q9I8//GG4P/q01k8k/ZSlqFZ2cg2R6Nef4aCLO3ZpoxLgSS6gvW6KydwTIRs=",
    },
    miniapp: {
      version: "1",
      name: "TimeGuesser",
      iconUrl: `${BASE_URL}/api/og/icon`,
      homeUrl: BASE_URL,
      imageUrl: `${BASE_URL}/api/og/cover`,
      buttonTitle: "Play TimeGuesser",
      splashImageUrl: `${BASE_URL}/api/og/splash`,
      splashBackgroundColor: "#1a1a2e",
      webhookUrl: `${BASE_URL}/api/webhook`,
      primaryCategory: "games",
      tags: ["trivia", "photos", "history", "guessing", "onchain"],
      subtitle: "Guess when photos were taken",
      description:
        "Look at iconic photos and guess the year. 5 rounds, mint your score onchain, compete globally!",
      tagline: "How well do you know history?",
      heroImageUrl: `${BASE_URL}/api/og/cover`,
      screenshotUrls: [
        `${BASE_URL}/screenshot1.png`,
      ],
      ogTitle: "TimeGuesser",
      ogDescription:
        "Guess when iconic photos were taken. Play 5 rounds, mint your score onchain, compete globally.",
      ogImageUrl: `${BASE_URL}/api/og/cover`,
    },
    // Builder Code from base.dev — tracks usage & qualifies for leaderboard
    builderCode: "bc_azilda67",
  };

  return NextResponse.json(manifest, {
    headers: {
      "Cache-Control": "public, max-age=3600",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
