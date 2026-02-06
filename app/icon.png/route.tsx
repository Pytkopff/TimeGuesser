import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 512,
          height: 512,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
          borderRadius: 96,
        }}
      >
        <div
          style={{
            fontSize: 200,
            fontWeight: 900,
            color: "#f5f3ee",
            marginTop: -20,
          }}
        >
          T
        </div>
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: "#a0a0a0",
            marginTop: -30,
            letterSpacing: 8,
          }}
        >
          GUESSER
        </div>
        <div
          style={{
            position: "absolute",
            top: 60,
            right: 70,
            width: 80,
            height: 80,
            borderRadius: 40,
            background: "#fbbf24",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 48,
            fontWeight: 900,
            color: "#1a1a2e",
          }}
        >
          ?
        </div>
      </div>
    ),
    {
      width: 512,
      height: 512,
    }
  );
}
