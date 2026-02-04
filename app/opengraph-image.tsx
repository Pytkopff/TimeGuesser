import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f5f3ee",
          color: "#111",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            border: "6px solid #111",
            borderRadius: "32px",
            padding: "48px 64px",
            textAlign: "center",
            background: "#fff",
          }}
        >
          <div style={{ fontSize: 64, fontWeight: 900, letterSpacing: 6 }}>
            TIMEGUESSER
          </div>
          <div style={{ marginTop: 16, fontSize: 28, fontWeight: 600 }}>
            Guess the year. Score big.
          </div>
          <div
            style={{
              marginTop: 32,
              padding: "12px 28px",
              border: "4px solid #111",
              borderRadius: 18,
              fontSize: 24,
              fontWeight: 800,
              letterSpacing: 4,
              display: "block",
            }}
          >
            PLAY NOW
          </div>
        </div>
      </div>
    ),
    size
  );
}
