import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const getBaseUrl = (request: NextRequest) => {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
};

// Main frame - displayed when sharing the game
const buildMainFrameHtml = (baseUrl: string) => {
  // Add timestamp for cache busting
  const cacheBuster = Date.now();
  const imageUrl = `${baseUrl}/api/frame/image?v=${cacheBuster}`;
  const gameUrl = `${baseUrl}`;

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta property="og:title" content="TimeGuesser - Guess the Year!" />
    <meta property="og:description" content="Can you guess when these iconic photos were taken? 5 rounds, max 5000 points!" />
    <meta property="og:image" content="${imageUrl}" />
    
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="${imageUrl}" />
    <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />
    <meta property="fc:frame:button:1" content="Play TimeGuesser" />
    <meta property="fc:frame:button:1:action" content="launch_frame" />
  </head>
  <body>
    <h1>TimeGuesser</h1>
    <p>Guess the year of iconic photos. 5 rounds. Max 5000 points.</p>
    <a href="${gameUrl}">Play Now</a>
  </body>
</html>`;
};

// Frame with leaderboard preview
const buildLeaderboardFrameHtml = (baseUrl: string, topScores: any[]) => {
  const imageUrl = `${baseUrl}/api/frame/image?type=leaderboard`;
  const postUrl = `${baseUrl}/api/frame`;
  const gameUrl = `${baseUrl}`;

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta property="og:title" content="TimeGuesser Leaderboard" />
    <meta property="og:description" content="Top players in TimeGuesser. Can you beat them?" />
    <meta property="og:image" content="${imageUrl}" />
    
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="${imageUrl}" />
    <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />
    <meta property="fc:frame:post_url" content="${postUrl}" />
    <meta property="fc:frame:button:1" content="🎮 Play Now" />
    <meta property="fc:frame:button:1:action" content="link" />
    <meta property="fc:frame:button:1:target" content="${gameUrl}" />
    <meta property="fc:frame:button:2" content="🔄 Refresh" />
    <meta property="fc:frame:button:2:action" content="post" />
  </head>
  <body>
    <h1>TimeGuesser Leaderboard</h1>
  </body>
</html>`;
};

export async function GET(request: NextRequest) {
  const baseUrl = getBaseUrl(request);
  return new NextResponse(buildMainFrameHtml(baseUrl), {
    headers: { 
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
    },
  });
}

export async function POST(request: NextRequest) {
  const baseUrl = getBaseUrl(request);
  
  try {
    const body = await request.json().catch(() => ({}));
    const buttonIndex = body?.untrustedData?.buttonIndex;
    
    console.log("📥 Frame POST:", { buttonIndex, body });
    
    // Button 2 = Show leaderboard
    if (buttonIndex === 2) {
      // Fetch top scores for leaderboard
      let topScores: any[] = [];
      try {
        const res = await fetch(`${baseUrl}/api/leaderboard?type=top_score&limit=5`);
        const data = await res.json();
        topScores = data.leaderboard || [];
      } catch (e) {
        console.error("Failed to fetch leaderboard:", e);
      }
      
      return new NextResponse(buildLeaderboardFrameHtml(baseUrl, topScores), {
        headers: { 
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store, max-age=0",
        },
      });
    }
    
    // Default: show main frame
    return new NextResponse(buildMainFrameHtml(baseUrl), {
      headers: { 
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (err) {
    console.error("Frame POST error:", err);
    return new NextResponse(buildMainFrameHtml(baseUrl), {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }
}
