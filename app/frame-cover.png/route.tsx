import { ImageResponse } from "next/og";

export const runtime = "edge";

// This generates the Frame cover image
// To use your own image: delete this file and put your PNG at public/frame-cover.png
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
          background: "linear-gradient(145deg, #0a0a1a 0%, #1a1a3e 50%, #0a2040 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: "rgba(100, 150, 255, 0.1)",
          }}
        />
        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: "-50px",
            left: "-50px",
            width: "200px",
            height: "200px",
            borderRadius: "50%",
            background: "rgba(255, 200, 100, 0.1)",
          }}
        />

        {/* Logo/Title */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "3px solid rgba(255, 255, 255, 0.8)",
            borderRadius: "60px",
            padding: "16px 48px",
            marginBottom: "32px",
            background: "rgba(255, 255, 255, 0.05)",
          }}
        >
          <span
            style={{
              fontSize: "56px",
              fontWeight: 900,
              color: "#ffffff",
              letterSpacing: "0.12em",
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
            fontSize: "26px",
            color: "#8899bb",
            letterSpacing: "0.3em",
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
            gap: "20px",
          }}
        >
          <span
            style={{
              fontSize: "38px",
              fontWeight: 700,
              color: "#ffffff",
            }}
          >
            🕰️ Guess the Year of Iconic Photos
          </span>
          <span
            style={{
              fontSize: "22px",
              color: "#99aabb",
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
            bottom: "28px",
            fontSize: "18px",
            color: "#556688",
            letterSpacing: "0.15em",
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
