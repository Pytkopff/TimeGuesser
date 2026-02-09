import { NextRequest, NextResponse } from "next/server";

// Only match actual crawler/bot user agents - NOT Warpcast WebView!
// Warpcast WebView has "Warpcast" in UA but is a real browser loading the app.
// Crawlers are bots that only want meta tags for link previews.
const BOT_USER_AGENTS = [
  "facebookexternalhit",
  "Twitterbot",
  "LinkedInBot",
  "Slackbot",
  "Discordbot",
  "TelegramBot",
  "WhatsApp",
  "Googlebot",
  "bingbot",
  "Applebot",
];

export function middleware(request: NextRequest) {
  const userAgent = request.headers.get("user-agent") || "";
  const pathname = request.nextUrl.pathname;
  
  // Only intercept root URL for bots/crawlers
  if (pathname === "/" || pathname === "") {
    const isBot = BOT_USER_AGENTS.some(agent => 
      userAgent.toLowerCase().includes(agent.toLowerCase())
    );
    
    if (isBot) {
      // Redirect bots to the Frame endpoint for proper meta tags
      const frameUrl = new URL("/api/frame", request.url);
      return NextResponse.rewrite(frameUrl);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};
