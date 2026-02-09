import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Farcaster webhook endpoint - required by farcaster.json manifest.
 * Farcaster sends events here when users interact with the mini app:
 * - frame_added: user added the frame
 * - frame_removed: user removed the frame
 * - notifications_enabled: user enabled notifications
 * - notifications_disabled: user disabled notifications
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    console.log("📩 Farcaster webhook event:", JSON.stringify(body));

    // Acknowledge the event
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ success: true }, { status: 200 });
  }
}

// Also handle GET for health checks
export async function GET() {
  return NextResponse.json({ status: "ok" });
}
