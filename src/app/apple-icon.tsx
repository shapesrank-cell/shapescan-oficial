import { ImageResponse } from "next/og";

// iOS espera 180x180 — o sistema arredonda automaticamente
export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

/**
 * Ícone do app quando instalado em iPhone / iPad.
 * Mesma identidade visual: gradiente + letra S.
 *
 * Diferente do Android: o iOS NÃO aplica máscara automática, então o
 * ícone deve preencher 100% do quadrado (sem padding interno).
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
          background:
            "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)",
          color: "white",
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
