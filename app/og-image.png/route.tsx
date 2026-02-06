import { ImageResponse } from "next/og";

export const runtime = "edge";

// OG Image: 1200 x 630px (1.91:1 ratio)
export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
          position: "relative",
        }}
      >
        {/* Main content */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
          }}
        >
          <div
            style={{
              fontSize: 100,
              fontWeight: 900,
              color: "#f5f3ee",
              letterSpacing: -2,
            }}
          >
            TimeGuesser
          </div>
          <div
            style={{
              width: 70,
              height: 70,
              borderRadius: 35,
              background: "#fbbf24",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 42,
              fontWeight: 900,
              color: "#1a1a2e",
            }}
          >
            ?
          </div>
        </div>
        
        {/* Tagline */}
        <div
          style={{
            fontSize: 32,
            color: "#a0a0a0",
            marginTop: 20,
            letterSpacing: 3,
          }}
        >
          GUESS THE YEAR • WIN POINTS • MINT ONCHAIN
        </div>
        
        {/* Category badge */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            display: "flex",
            gap: 20,
          }}
        >
          <div
            style={{
              padding: "12px 24px",
              border: "2px solid #fbbf24",
              borderRadius: 30,
              color: "#fbbf24",
              fontSize: 18,
              fontWeight: 700,
            }}
          >
            🎮 TRIVIA GAME
          </div>
          <div
            style={{
              padding: "12px 24px",
              border: "2px solid #f5f3ee",
              borderRadius: 30,
              color: "#f5f3ee",
              fontSize: 18,
              fontWeight: 700,
            }}
          >
            ⛓️ BASE NETWORK
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
