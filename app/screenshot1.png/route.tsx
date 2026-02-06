import { ImageResponse } from "next/og";

export const runtime = "edge";

// Screenshot: 1284 x 2778px (portrait phone)
export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1284,
          height: 2778,
          display: "flex",
          flexDirection: "column",
          background: "#f5f3ee",
          padding: 60,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingBottom: 40,
            borderBottom: "2px solid #e5e5e5",
          }}
        >
          <div
            style={{
              padding: "16px 32px",
              border: "3px solid #18181b",
              borderRadius: 50,
              fontSize: 28,
              fontWeight: 900,
              letterSpacing: 4,
            }}
          >
            TIMEGUESSER
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            <div
              style={{
                padding: "16px 24px",
                border: "2px solid #18181b",
                borderRadius: 50,
                fontSize: 24,
                fontWeight: 600,
              }}
            >
              R3/5
            </div>
            <div
              style={{
                padding: "16px 24px",
                border: "2px solid #d4d4d4",
                borderRadius: 50,
                fontSize: 24,
                fontWeight: 600,
                background: "white",
              }}
            >
              2450 pts
            </div>
          </div>
        </div>

        {/* Photo area */}
        <div
          style={{
            marginTop: 50,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 1100,
              height: 900,
              background: "linear-gradient(135deg, #374151 0%, #1f2937 100%)",
              borderRadius: 40,
              border: "4px solid #18181b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#9ca3af",
              fontSize: 36,
            }}
          >
            📸 Historic Photo
          </div>
        </div>

        {/* Guess section */}
        <div
          style={{
            marginTop: 60,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: "white",
            borderRadius: 50,
            border: "4px solid #18181b",
            padding: 50,
          }}
        >
          <div
            style={{
              fontSize: 28,
              fontWeight: 600,
              letterSpacing: 6,
              color: "#71717a",
            }}
          >
            YOUR GUESS
          </div>
          <div
            style={{
              marginTop: 30,
              padding: "30px 80px",
              border: "4px solid #18181b",
              borderRadius: 30,
              fontSize: 100,
              fontWeight: 900,
              background: "#fafafa",
            }}
          >
            1969
          </div>

          {/* Slider representation */}
          <div
            style={{
              marginTop: 50,
              display: "flex",
              alignItems: "center",
              gap: 30,
              width: "100%",
            }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                border: "4px solid #18181b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 40,
                fontWeight: 900,
              }}
            >
              -
            </div>
            <div
              style={{
                flex: 1,
                height: 20,
                background: "#e5e5e5",
                borderRadius: 10,
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: "55%",
                  top: -15,
                  width: 50,
                  height: 50,
                  background: "#18181b",
                  borderRadius: 25,
                }}
              />
            </div>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                border: "4px solid #18181b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 40,
                fontWeight: 900,
              }}
            >
              +
            </div>
          </div>

          <div
            style={{
              marginTop: 20,
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
              padding: "0 120px",
              fontSize: 24,
              color: "#71717a",
              letterSpacing: 4,
            }}
          >
            <span>1900</span>
            <span>2026</span>
          </div>

          <div
            style={{
              marginTop: 40,
              fontSize: 28,
              letterSpacing: 4,
              color: "#52525b",
            }}
          >
            WHAT YEAR WAS THIS PHOTO TAKEN?
          </div>

          {/* Submit button */}
          <div
            style={{
              marginTop: 50,
              width: "100%",
              padding: "40px 0",
              background: "#18181b",
              borderRadius: 30,
              color: "white",
              fontSize: 36,
              fontWeight: 700,
              letterSpacing: 6,
              textAlign: "center",
              display: "flex",
              justifyContent: "center",
            }}
          >
            SUBMIT
          </div>
        </div>

        {/* Bottom branding */}
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 20,
            paddingTop: 40,
          }}
        >
          <div
            style={{
              fontSize: 24,
              color: "#a1a1aa",
              letterSpacing: 2,
            }}
          >
            PLAY ON BASE • MINT YOUR SCORE
          </div>
        </div>
      </div>
    ),
    {
      width: 1284,
      height: 2778,
    }
  );
}
