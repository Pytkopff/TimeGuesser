import { NextRequest, NextResponse } from "next/server";

// Farcaster and social media crawler user agents
const CRAWLER_USER_AGENTS = [
  "farcaster",
  "Farcaster",
  "Warpcast",
  "warpcast",
  "facebookexternalhit",
  "Twitterbot",
  "LinkedInBot",
  "Slackbot",
];

export function middleware(request: NextRequest) {
  const userAgent = request.headers.get("user-agent") || "";
  const pathname = request.nextUrl.pathname;
  
  // Only intercept root URL for crawlers
  if (pathname === "/" || pathname === "") {
    const isCrawler = CRAWLER_USER_AGENTS.some(agent => 
      userAgent.toLowerCase().includes(agent.toLowerCase())
    );
    
    if (isCrawler) {
      // Redirect crawlers to the Frame endpoint
      const frameUrl = new URL("/api/frame", request.url);
      return NextResponse.rewrite(frameUrl);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};
