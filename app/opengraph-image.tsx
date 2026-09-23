import { ImageResponse } from "next/og";

export const alt = "Sayan Das — models that listen, packets that arrive";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/* The social preview card, drawn in code. */
export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#eceae4",
          color: "#111113",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 22, letterSpacing: 2, color: "#75726b", fontFamily: "monospace" }}>
          <div style={{ width: 14, height: 14, background: "#c8f03c" }} />
          M.TECH CSE STUDENT · IIIT DELHI
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 150, fontWeight: 600, letterSpacing: -8, lineHeight: 1 }}>Sayan Das</div>
          <div style={{ fontSize: 44, marginTop: 28, color: "#111113", letterSpacing: -1 }}>Models that listen. Packets that arrive.</div>
        </div>
        <div style={{ display: "flex", height: 10, width: "100%", background: "#111113" }}>
          <div style={{ width: "38%", height: 10, background: "#c8f03c" }} />
        </div>
      </div>
    ),
    size,
  );
}
