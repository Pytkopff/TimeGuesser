import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 200,
  height: 200,
};

export const contentType = "image/png";

export default function MiniAppIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
          color: "#111",
          fontFamily: "Arial, sans-serif",
          border: "8px solid #111",
          borderRadius: 36,
          boxSizing: "border-box",
        }}
      >
        <div style={{ fontSize: 64, fontWeight: 900 }}>TG</div>
      </div>
    ),
    size
  );
}
