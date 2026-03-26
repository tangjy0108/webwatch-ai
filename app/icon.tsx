import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "linear-gradient(145deg, #f7f8ff 0%, #eff6ff 45%, #eef2ff 100%)",
          position: "relative",
          fontFamily: "sans-serif",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 28,
            borderRadius: 48,
            background: "rgba(255,255,255,0.88)",
            border: "1px solid rgba(124,111,247,0.15)",
            boxShadow: "0 24px 60px rgba(88, 88, 140, 0.12)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 56,
            right: 44,
            width: 120,
            height: 120,
            borderRadius: 999,
            background: "radial-gradient(circle, rgba(124,111,247,0.35) 0%, rgba(124,111,247,0) 72%)",
          }}
        />
        <div
          style={{
            display: "flex",
            position: "relative",
            width: "100%",
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
            gap: 28,
          }}
        >
          <div
            style={{
              display: "flex",
              width: 128,
              height: 128,
              borderRadius: 36,
              background: "linear-gradient(160deg, #7c6ff7 0%, #60a5fa 100%)",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 16px 36px rgba(124,111,247,0.3)",
            }}
          >
            <div
              style={{
                display: "flex",
                width: 70,
                height: 70,
                borderRadius: 20,
                background: "rgba(255,255,255,0.92)",
                color: "#4f46e5",
                fontSize: 36,
                fontWeight: 800,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              W
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              color: "#172554",
            }}
          >
            <div style={{ fontSize: 56, fontWeight: 800, lineHeight: 1.05 }}>WebWatch</div>
            <div style={{ fontSize: 44, fontWeight: 700, color: "#4f46e5", lineHeight: 1.05 }}>AI</div>
            <div style={{ fontSize: 20, marginTop: 12, color: "#64748b" }}>Daily AI brief</div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
