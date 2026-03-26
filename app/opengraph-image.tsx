import { ImageResponse } from "next/og";

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
          display: "flex",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #f8fafc 0%, #eff6ff 38%, #eef2ff 100%)",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 36,
            borderRadius: 36,
            background: "rgba(255,255,255,0.9)",
            border: "1px solid rgba(124,111,247,0.12)",
            boxShadow: "0 30px 80px rgba(30, 41, 59, 0.12)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: -80,
            right: -40,
            width: 320,
            height: 320,
            borderRadius: 999,
            background: "radial-gradient(circle, rgba(124,111,247,0.28) 0%, rgba(124,111,247,0) 72%)",
          }}
        />
        <div
          style={{
            display: "flex",
            position: "relative",
            width: "100%",
            height: "100%",
            padding: "72px 84px",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", maxWidth: 720 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
                fontSize: 26,
                color: "#4f46e5",
                fontWeight: 700,
              }}
            >
              <div
                style={{
                  display: "flex",
                  width: 64,
                  height: 64,
                  borderRadius: 18,
                  background: "linear-gradient(160deg, #7c6ff7 0%, #60a5fa 100%)",
                  color: "white",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 30,
                  fontWeight: 800,
                }}
              >
                W
              </div>
              WebWatch AI
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              <div style={{ fontSize: 82, lineHeight: 0.96, fontWeight: 800, color: "#0f172a" }}>
                Daily AI updates
              </div>
              <div style={{ fontSize: 34, lineHeight: 1.3, color: "#475569", maxWidth: 680 }}>
                Track the features that matter, skip the noisy launches, and turn AI updates into a useful daily brief.
              </div>
            </div>

            <div style={{ display: "flex", gap: 14 }}>
              {["AI brief", "Filtered updates", "Action-first"].map(label => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    padding: "12px 18px",
                    borderRadius: 999,
                    background: "#eef2ff",
                    color: "#4338ca",
                    fontSize: 22,
                    fontWeight: 600,
                  }}
                >
                  {label}
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              width: 260,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                width: 220,
                height: 220,
                borderRadius: 56,
                background: "linear-gradient(160deg, #7c6ff7 0%, #60a5fa 100%)",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 24px 56px rgba(99, 102, 241, 0.24)",
                color: "white",
                fontSize: 104,
                fontWeight: 800,
              }}
            >
              W
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
