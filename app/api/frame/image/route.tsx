import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "main";
  const score = searchParams.get("score");
  const player = searchParams.get("player");

  // Main frame image
  if (type === "main") {
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
          {/* Logo/Title */}
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
              🕰️ Guess the Year of Iconic Photos
            </span>
            <span
              style={{
                fontSize: "24px",
                color: "#cbd5e0",
              }}
            >
              5 Rounds • Max 5000 Points • On-Chain Leaderboard
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

  // Leaderboard frame image
  if (type === "leaderboard") {
    // TODO: Fetch actual leaderboard data
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
          {/* Title */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginBottom: "32px",
            }}
          >
            <span style={{ fontSize: "48px" }}>🏆</span>
            <span
              style={{
                fontSize: "48px",
                fontWeight: 900,
                color: "#ffffff",
                letterSpacing: "0.1em",
              }}
            >
              LEADERBOARD
            </span>
          </div>

          {/* Subtitle */}
          <div
            style={{
              display: "flex",
              fontSize: "24px",
              color: "#a0aec0",
              marginBottom: "32px",
            }}
          >
            TimeGuesser • Top Scores
          </div>

          {/* CTA */}
          <div
            style={{
              display: "flex",
              marginTop: "24px",
              padding: "16px 48px",
              background: "#fbbf24",
              borderRadius: "16px",
              fontSize: "24px",
              fontWeight: 800,
              color: "#1a1a2e",
              textTransform: "uppercase",
            }}
          >
            Can you beat them?
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 628,
      }
    );
  }

  // Score share frame image
  if (type === "score" && score) {
    const displayPlayer = player 
      ? `${player.slice(0, 6)}...${player.slice(-4)}`
      : "Player";
    
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
              border: "3px solid #e5e5e5",
              borderRadius: "40px",
              padding: "8px 24px",
              marginBottom: "24px",
            }}
          >
            <span
              style={{
                fontSize: "32px",
                fontWeight: 900,
                color: "#ffffff",
                letterSpacing: "0.15em",
              }}
            >
              TimeGuesser
            </span>
          </div>

          {/* Player */}
          <div
            style={{
              display: "flex",
              fontSize: "24px",
              color: "#a0aec0",
              marginBottom: "16px",
            }}
          >
            {displayPlayer} just played!
          </div>

          {/* Score */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              background: "rgba(255,255,255,0.1)",
              borderRadius: "24px",
              padding: "32px 64px",
              border: "2px solid rgba(255,255,255,0.2)",
            }}
          >
            <span
              style={{
                fontSize: "72px",
                fontWeight: 900,
                color: "#fbbf24",
              }}
            >
              {score} pts
            </span>
            <span
              style={{
                fontSize: "24px",
                color: "#cbd5e0",
                marginTop: "8px",
              }}
            >
              out of 5000
            </span>
          </div>

          {/* CTA */}
          <div
            style={{
              display: "flex",
              marginTop: "32px",
              padding: "16px 48px",
              background: "#ffffff",
              borderRadius: "16px",
              fontSize: "24px",
              fontWeight: 800,
              color: "#1a1a2e",
            }}
          >
            🎮 Can you beat this score?
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 628,
      }
    );
  }

  // Fallback
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "1200px",
          height: "628px",
          background: "#1a1a2e",
          fontSize: "48px",
          color: "#ffffff",
        }}
      >
        TimeGuesser
      </div>
    ),
    {
      width: 1200,
      height: 628,
    }
  );
}
