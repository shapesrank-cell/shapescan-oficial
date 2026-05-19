import { ImageResponse } from "next/og";

// iOS espera 180x180 — o sistema arredonda automaticamente
export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

/**
 * Ícone do app quando instalado em iPhone / iPad.
 * Identidade laranja ShapeScan.
 *
 * iOS NÃO aplica máscara automática, então o ícone deve preencher
 * 100% do quadrado (sem padding interno).
 */
export default function AppleIcon() {
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
          color: "#0a0a0a",
          fontSize: 130,
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
