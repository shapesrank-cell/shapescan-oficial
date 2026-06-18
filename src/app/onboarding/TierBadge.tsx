import type { Tier } from "@/lib/ranking";

/**
 * Emblema visual de um tier: uma "gema" hexagonal faceta, colorida pela cor do
 * tier, com gloss no topo e sombra embaixo. SVG puro, sem <defs>/ids (pra poder
 * repetir vários na mesma tela sem colisão de id).
 */
const HEX = "M24 3 L41.5 13 L41.5 35 L24 45 L6.5 35 L6.5 13 Z";

export function TierBadge({
  tier,
  size = 40,
  className,
}: {
  tier: Tier;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      role="img"
      aria-label={`Emblema ${tier.nome}`}
    >
      {/* Corpo da gema */}
      <path d={HEX} fill={tier.cor} />
      {/* Faceta de topo (gloss) */}
      <path
        d="M24 3 L41.5 13 L24 24 L6.5 13 Z"
        fill={tier.corClara}
        fillOpacity="0.55"
      />
      {/* Facetas inferiores (sombra) */}
      <path
        d="M6.5 13 L24 24 L6.5 35 Z"
        fill={tier.corEscura}
        fillOpacity="0.45"
      />
      <path
        d="M41.5 13 L41.5 35 L24 24 Z"
        fill={tier.corEscura}
        fillOpacity="0.3"
      />
      <path
        d="M6.5 35 L24 24 L41.5 35 L24 45 Z"
        fill={tier.corEscura}
        fillOpacity="0.5"
      />
      {/* Linhas das facetas */}
      <path
        d="M24 3 L24 45 M6.5 13 L41.5 13 M6.5 13 L24 24 L41.5 13 M6.5 35 L24 24 L41.5 35"
        stroke="#000"
        strokeOpacity="0.12"
        strokeWidth="0.7"
        strokeLinejoin="round"
      />
      {/* Aro com rim-light */}
      <path
        d={HEX}
        fill="none"
        stroke={tier.corClara}
        strokeWidth="1.4"
        strokeOpacity="0.7"
        strokeLinejoin="round"
      />
      {/* Brilho */}
      <circle cx="16.5" cy="11.5" r="1.7" fill="#fff" fillOpacity="0.6" />
    </svg>
  );
}
