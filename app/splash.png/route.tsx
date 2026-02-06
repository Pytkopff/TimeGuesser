import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 800,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
        }}
      >
        {/* Main title */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          <div
            style={{
              fontSize: 140,
              fontWeight: 900,
              color: "#f5f3ee",
              letterSpacing: -4,
            }}
          >
            TimeGuesser
          </div>
          <div
            style={{
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
        
        {/* Subtitle */}
        <div
          style={{
            fontSize: 36,
            color: "#a0a0a0",
            marginTop: 30,
            letterSpacing: 4,
          }}
        >
          GUESS THE YEAR • 5 ROUNDS • MINT YOUR SCORE
        </div>
        
        {/* Decorative elements */}
        <div
          style={{
            display: "flex",
            gap: 40,
            marginTop: 60,
          }}
        >
          <div
            style={{
              padding: "16px 32px",
              border: "3px solid #f5f3ee",
              borderRadius: 50,
              color: "#f5f3ee",
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            🏆 LEADERBOARD
          </div>
          <div
            style={{
              padding: "16px 32px",
              border: "3px solid #fbbf24",
              borderRadius: 50,
              color: "#fbbf24",
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            ⛓️ ONCHAIN
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 800,
    }
  );
}
