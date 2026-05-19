import { ImageResponse } from "next/og";

export const size = {
  width: 192,
  height: 192,
};
export const contentType = "image/png";

/**
 * Ícone do app gerado dinamicamente — identidade laranja ShapeScan.
 */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fb923c", // orange-400
          borderRadius: 40,
          color: "#0a0a0a",
          fontSize: 140,
          fontWeight: 900,
          fontFamily: "system-ui, -apple-system, sans-serif",
          letterSpacing: -8,
        }}
      >
        S
      </div>
    ),
    {
      ...size,
    }
  );
}
