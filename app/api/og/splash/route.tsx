import { ImageResponse } from "next/og";

export const runtime = "edge";

// Generate splash screen image for the Farcaster manifest (200x200)
export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "200px",
          height: "200px",
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <span style={{ fontSize: "36px", fontWeight: 900, color: "#ffffff", letterSpacing: "0.05em" }}>
          TG
        </span>
        <span style={{ fontSize: "12px", color: "#a0aec0", marginTop: "8px", letterSpacing: "0.15em" }}>
          TimeGuesser
        </span>
      </div>
    ),
    {
      width: 200,
      height: 200,
    }
  );
}
