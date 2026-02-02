import { NextRequest, NextResponse } from "next/server";

const getBaseUrl = (request: NextRequest) => {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
};

const buildFrameHtml = (baseUrl: string) => {
  const imageUrl = `${baseUrl}/opengraph-image`;
  const postUrl = `${baseUrl}/api/frame`;

  return `<!doctype html>
<html>
  <head>
    <meta property="og:title" content="TimeGuesser" />
    <meta property="og:description" content="Guess the year of iconic photos. 5 rounds. Big score." />
    <meta property="og:image" content="${imageUrl}" />
    <meta name="fc:frame" content="vNext" />
    <meta name="fc:frame:image" content="${imageUrl}" />
    <meta name="fc:frame:post_url" content="${postUrl}" />
    <meta name="fc:frame:button:1" content="Play TimeGuesser" />
  </head>
  <body>
    <p>TimeGuesser Frame</p>
  </body>
</html>`;
};

export async function GET(request: NextRequest) {
  const baseUrl = getBaseUrl(request);
  return new NextResponse(buildFrameHtml(baseUrl), {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export async function POST(request: NextRequest) {
  const baseUrl = getBaseUrl(request);
  return new NextResponse(buildFrameHtml(baseUrl), {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
