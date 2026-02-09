import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const getBaseUrl = (request: NextRequest) => {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
};

// Frame for sharing a specific score
export async function GET(request: NextRequest) {
  const baseUrl = getBaseUrl(request);
  const { searchParams } = new URL(request.url);
  
  const score = searchParams.get("score") || "0";
  const player = searchParams.get("player") || "";
  
  const imageUrl = `${baseUrl}/api/frame/image?type=score&score=${score}&player=${player}`;

  // Farcaster Frame v2 / Mini App embed JSON (same format as Framedl)
  const frameEmbed = JSON.stringify({
    version: "next",
    imageUrl,
    button: {
      title: "Play TimeGuesser",
      action: {
        type: "launch_miniapp",
        name: "TimeGuesser",
        url: baseUrl,
        splashImageUrl: `${baseUrl}/api/og/splash`,
        splashBackgroundColor: "#1a1a2e",
      },
    },
  });
  const frameEmbedAttr = frameEmbed.replace(/"/g, "&quot;");

  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta property="og:title" content="I scored ${score} pts in TimeGuesser!" />
    <meta property="og:description" content="Can you guess when these iconic photos were taken? Beat my score!" />
    <meta property="og:image" content="${imageUrl}" />
    
    <meta name="fc:frame" content="${frameEmbedAttr}" />
    <meta name="fc:miniapp" content="${frameEmbedAttr}" />
  </head>
  <body>
    <h1>TimeGuesser Score: ${score} pts</h1>
    <p>Can you beat this score? Play now!</p>
    <a href="${baseUrl}">Play TimeGuesser</a>
  </body>
</html>`;

  return new NextResponse(html, {
    headers: { 
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
