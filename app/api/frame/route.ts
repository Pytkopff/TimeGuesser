import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const getBaseUrl = (request: NextRequest) => {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
};

// Build Farcaster Frame v2 / Mini App embed JSON (same format as Framedl)
const buildFrameEmbed = (baseUrl: string, title = "Play TimeGuesser") => {
  return JSON.stringify({
    version: "next",
    imageUrl: `${baseUrl}/api/og/cover`,
    button: {
      title,
      action: {
        type: "launch_miniapp",
        name: "TimeGuesser",
        url: baseUrl,
        splashImageUrl: `${baseUrl}/api/og/splash`,
        splashBackgroundColor: "#1a1a2e",
      },
    },
  });
};

// Main frame - displayed when sharing the game
const buildMainFrameHtml = (baseUrl: string) => {
  const imageUrl = `${baseUrl}/api/og/cover`;
  const frameEmbed = buildFrameEmbed(baseUrl);
  // Escape for HTML attribute
  const frameEmbedAttr = frameEmbed.replace(/"/g, "&quot;");

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta property="og:title" content="TimeGuesser - Guess the Year!" />
    <meta property="og:description" content="Can you guess when these iconic photos were taken? 5 rounds, max 5000 points!" />
    <meta property="og:image" content="${imageUrl}" />
    
    <meta name="fc:frame" content="${frameEmbedAttr}" />
    <meta name="fc:miniapp" content="${frameEmbedAttr}" />
  </head>
  <body>
    <h1>TimeGuesser</h1>
    <p>Guess the year of iconic photos. 5 rounds. Max 5000 points.</p>
    <a href="${baseUrl}">Play Now</a>
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
    console.log("📥 Frame POST:", { body });
    
    // Always return the main frame for any POST
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
