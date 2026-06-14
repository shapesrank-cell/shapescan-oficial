/**
 * ProgressRing — Anel de progresso circular SVG.
 *
 * Regras TDAH:
 * - Área de toque generosa (o anel inteiro é clicável)
 * - 1 toque = iniciar/pausar (sem botão separado)
 * - Feedback visual imediato (transição CSS suave)
 * - Texto grande e legível no centro
 */

interface ProgressRingProps {
  /** Progresso de 0 a 1 */
  progress: number;
  /** Texto exibido no centro (ex: "12:34") */
  display: string;
  /** Se o timer está rodando */
  isRunning: boolean;
  /** Callback ao tocar — inicia ou pausa */
  onTap: () => void;
  /** Tamanho do anel em pixels (default: 280) */
  size?: number;
}

export function ProgressRing({
  progress,
  display,
  isRunning,
  onTap,
  size = 280,
}: ProgressRingProps) {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  // Texto auxiliar: "Toque para iniciar" / "Toque para pausar"
  const hint = isRunning ? 'Toque para pausar' : 'Toque para iniciar';

  return (
    <button
      type="button"
      onClick={onTap}
      aria-label={isRunning ? 'Pausar timer' : 'Iniciar timer'}
      className="
        relative flex items-center justify-center
        rounded-full
        min-h-touch min-w-touch
        outline-none
        focus-visible:ring-2 focus-visible:ring-colibri-primary-light focus-visible:ring-offset-2 focus-visible:ring-offset-colibri-bg
        transition-transform active:scale-95
        cursor-pointer select-none
      "
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        className="absolute inset-0 -rotate-90"
        aria-hidden="true"
      >
        {/* Trilha de fundo */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-colibri-subtle"
        />
        {/* Arco de progresso */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`
            transition-[stroke-dashoffset] duration-500 ease-linear
            ${isRunning ? 'text-colibri-primary' : 'text-colibri-primary-light'}
          `}
        />
      </svg>

      {/* Conteúdo central */}
      <div className="relative z-10 flex flex-col items-center gap-1">
        <span
          className="
            font-sans font-semibold tracking-tight
            text-colibri-text tabular-nums
          "
          style={{ fontSize: size * 0.18 }}
        >
          {display}
        </span>
        <span
          className="text-sm text-colibri-text-secondary"
          style={{ fontSize: Math.max(12, size * 0.05) }}
        >
          {hint}
        </span>
      </div>
    </button>
  );
}
