import { ImageResponse } from "next/og";

export const runtime = "edge";

// Generate 1200x628 cover image for Farcaster frame embed
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
          height: "628px",
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "4px solid #e5e5e5",
            borderRadius: "50px",
            padding: "12px 32px",
            marginBottom: "24px",
          }}
        >
          <span
            style={{
              fontSize: "48px",
              fontWeight: 900,
              color: "#ffffff",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            TimeGuesser
          </span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            display: "flex",
            fontSize: "28px",
            color: "#a0aec0",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            marginBottom: "48px",
          }}
        >
          Historic Photo Trivia
        </div>

        {/* Main tagline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <span
            style={{
              fontSize: "36px",
              fontWeight: 700,
              color: "#ffffff",
            }}
          >
            Guess the Year of Iconic Photos
          </span>
          <span
            style={{
              fontSize: "24px",
              color: "#cbd5e0",
            }}
          >
            5 Rounds - Max 5000 Points - On-Chain Leaderboard
          </span>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: "32px",
            fontSize: "20px",
            color: "#718096",
            letterSpacing: "0.1em",
          }}
        >
          Built on Base
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 628,
    }
  );
}
