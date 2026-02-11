import { ImageResponse } from "next/og";

export const runtime = "edge";

// Generate a 1024x1024 square icon for the Farcaster manifest
// Base docs require: PNG 1024×1024, transparent background discouraged
export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "1024px",
          height: "1024px",
          background: "linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)",
          borderRadius: "200px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <span style={{ fontSize: "240px", fontWeight: 900, color: "#ffffff", letterSpacing: "0.05em" }}>
          TG
        </span>
      </div>
    ),
    {
      width: 1024,
      height: 1024,
    }
  );
}
