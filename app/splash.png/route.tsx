import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "1200px",
          height: "1200px",
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        }}
      >
        <span style={{ fontSize: "300px", marginBottom: "40px" }}>🕰️</span>
        <span
          style={{
            fontSize: "120px",
            fontWeight: 900,
            color: "#ffffff",
            letterSpacing: "0.15em",
          }}
        >
          TimeGuesser
        </span>
        <span
          style={{
            fontSize: "48px",
            color: "#a0aec0",
            marginTop: "20px",
            letterSpacing: "0.3em",
          }}
        >
          LOADING...
        </span>
      </div>
    ),
    {
      width: 1200,
      height: 1200,
    }
  );
}
