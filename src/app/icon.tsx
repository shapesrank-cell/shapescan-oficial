import { ImageResponse } from "next/og";

// Tamanho do ícone (192x192 é o padrão Android para PWAs)
export const size = {
  width: 192,
  height: 192,
};
export const contentType = "image/png";

/**
 * Ícone do app gerado a partir de código — mesma identidade da logo "S"
 * com gradiente roxo/índigo, igual a tela de boas-vindas.
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
          background:
            "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)",
          borderRadius: 40,
          color: "white",
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
