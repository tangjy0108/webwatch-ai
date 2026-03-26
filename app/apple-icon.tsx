import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "linear-gradient(160deg, #7c6ff7 0%, #60a5fa 100%)",
          borderRadius: 36,
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 140,
            height: 140,
            borderRadius: 999,
            background: "radial-gradient(circle, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0) 72%)",
            top: -20,
            right: -10,
          }}
        />
        <div
          style={{
            display: "flex",
            width: 88,
            height: 88,
            borderRadius: 24,
            background: "rgba(255,255,255,0.94)",
            color: "#4f46e5",
            fontSize: 44,
            fontWeight: 800,
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 10px 20px rgba(23, 37, 84, 0.18)",
          }}
        >
          W
        </div>
      </div>
    ),
    size,
  );
}
