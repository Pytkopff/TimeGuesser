import { ImageResponse } from "next/og";

export const runtime = "edge";

// Generate a 200x200 square icon for the Farcaster manifest
export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "200px",
          height: "200px",
          background: "linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)",
          borderRadius: "40px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <span style={{ fontSize: "48px", fontWeight: 900, color: "#ffffff", letterSpacing: "0.05em" }}>
          TG
        </span>
      </div>
    ),
    {
      width: 200,
      height: 200,
    }
  );
}
