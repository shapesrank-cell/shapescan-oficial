import { ImageResponse } from "next/og";

export const alt = "ShapeScan — Descubra seu biotipo com IA";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

/**
 * Open Graph image dinâmica — aparece quando compartilha link no
 * WhatsApp, Instagram, Twitter, LinkedIn etc.
 */
export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "80px 100px",
          background: "#111111",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
        }}
      >
        {/* Glow laranja */}
        <div
          style={{
            position: "absolute",
            top: "20%",
            right: "10%",
            width: 400,
            height: 400,
            background: "radial-gradient(circle, rgba(251, 146, 60, 0.3) 0%, transparent 70%)",
            filter: "blur(40px)",
            borderRadius: "50%",
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              background: "#fb923c",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#0a0a0a",
              fontSize: 60,
              fontWeight: 900,
              letterSpacing: -4,
            }}
          >
            S
          </div>
          <span
            style={{
              fontSize: 36,
              fontWeight: 700,
              color: "white",
              letterSpacing: -1,
            }}
          >
            ShapeScan
          </span>
        </div>

        {/* Título */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            color: "white",
            fontSize: 110,
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: -4,
            textTransform: "uppercase",
          }}
        >
          <span>Seu corpo</span>
          <span style={{ color: "#fb923c" }}>tem um plano.</span>
        </div>

        {/* Subtítulo */}
        <p
          style={{
            color: "#a1a1aa",
            fontSize: 28,
            marginTop: 30,
            maxWidth: 800,
          }}
        >
          Biotipo, dieta e treino 100% personalizados por IA — em 2 minutos.
        </p>

        {/* Badge inferior */}
        <div
          style={{
            position: "absolute",
            bottom: 60,
            right: 100,
            padding: "12px 24px",
            background: "rgba(251, 146, 60, 0.15)",
            border: "2px solid rgba(251, 146, 60, 0.4)",
            borderRadius: 999,
            color: "#fb923c",
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: 1,
            textTransform: "uppercase",
          }}
        >
          100% gratuito
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
