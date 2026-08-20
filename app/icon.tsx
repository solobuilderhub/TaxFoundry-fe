import { ImageResponse } from "next/og";

/** Favicon — same stacked-return glyph as the in-app `Logomark`, generated. */
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 3,
          padding: 7,
          background: "#09090b",
          borderRadius: 7,
        }}
      >
        {/* teal brand → brass accent → neutral, matching Logomark */}
        <div style={{ width: 18, height: 3.5, borderRadius: 2, background: "#34b6d2" }} />
        <div style={{ width: 13, height: 3.5, borderRadius: 2, background: "#ecad59" }} />
        <div style={{ width: 8, height: 3.5, borderRadius: 2, background: "#f1f5f766" }} />
      </div>
    ),
    size,
  );
}
