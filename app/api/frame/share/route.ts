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
  const gameUrl = `${baseUrl}`;
  const postUrl = `${baseUrl}/api/frame`;

  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta property="og:title" content="I scored ${score} pts in TimeGuesser!" />
    <meta property="og:description" content="Can you guess when these iconic photos were taken? Beat my score!" />
    <meta property="og:image" content="${imageUrl}" />
    
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="${imageUrl}" />
    <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />
    <meta property="fc:frame:button:1" content="Play TimeGuesser" />
    <meta property="fc:frame:button:1:action" content="launch_frame" />
  </head>
  <body>
    <h1>TimeGuesser Score: ${score} pts</h1>
    <p>Can you beat this score? Play now!</p>
    <a href="${gameUrl}">Play TimeGuesser</a>
  </body>
</html>`;

  return new NextResponse(html, {
    headers: { 
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
