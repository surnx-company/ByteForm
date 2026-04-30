import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ByteForm — Forms people actually want to fill";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          background: "#F7F3EC",
          padding: "72px 80px",
          fontFamily: "serif",
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            background: "#6B1A2A",
          }}
        />

        {/* Wordmark */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            marginBottom: 32,
          }}
        >
          <span style={{ fontSize: 52, color: "#1C1410", letterSpacing: "-2px" }}>
            Byte
          </span>
          <span style={{ fontSize: 52, color: "#6B1A2A", letterSpacing: "-2px" }}>
            Form
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 36,
            color: "#1C1410",
            lineHeight: 1.25,
            letterSpacing: "-0.5px",
            maxWidth: 700,
            marginBottom: 40,
          }}
        >
          Forms your users actually want to fill.
        </div>

        {/* Stat pills */}
        <div style={{ display: "flex", gap: 16 }}>
          {["91% completion rate", "2 min to build", "Free to start"].map(
            (label) => (
              <div
                key={label}
                style={{
                  padding: "10px 20px",
                  borderRadius: 100,
                  border: "1.5px solid rgba(107,26,42,0.2)",
                  fontSize: 18,
                  color: "#7A6A60",
                  background: "rgba(107,26,42,0.04)",
                }}
              >
                {label}
              </div>
            )
          )}
        </div>

        {/* Bottom-right URL */}
        <div
          style={{
            position: "absolute",
            bottom: 48,
            right: 80,
            fontSize: 18,
            color: "#9A8A80",
          }}
        >
          byteform.io
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
