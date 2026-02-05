import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "512px",
          height: "512px",
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
          borderRadius: "128px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ fontSize: "200px" }}>🕰️</span>
          <span
            style={{
              fontSize: "48px",
              fontWeight: 900,
              color: "#ffffff",
              letterSpacing: "0.1em",
              marginTop: "-20px",
            }}
          >
            TG
          </span>
        </div>
      </div>
    ),
    {
      width: 512,
      height: 512,
    }
  );
}
