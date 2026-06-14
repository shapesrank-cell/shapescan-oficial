/**
 * PresetSelector — 3 botões de preset lado a lado (15 / 25 / 45 min).
 *
 * Regras TDAH:
 * - Botões grandes (min 48px de altura)
 * - 1 toque = muda duração instantaneamente
 * - Máximo 3 opções (baixa carga cognitiva)
 * - Feedback visual claro de qual está selecionado
 */

const PRESETS = [15, 25, 45] as const;
type Preset = (typeof PRESETS)[number];

interface PresetSelectorProps {
  /** Preset atualmente selecionado */
  current: Preset;
  /** Se o timer está rodando (desabilita troca para evitar confusão) */
  isRunning: boolean;
  /** Callback ao selecionar preset */
  onSelect: (minutes: Preset) => void;
}

export function PresetSelector({ current, isRunning, onSelect }: PresetSelectorProps) {
  return (
    <div className="flex items-center justify-center gap-3 w-full max-w-xs mx-auto">
      {PRESETS.map((minutes) => {
        const isActive = current === minutes;

        return (
          <button
            key={minutes}
            type="button"
            onClick={() => onSelect(minutes)}
            disabled={isRunning}
            aria-label={`${minutes} minutos`}
            aria-pressed={isActive}
            className={`
              flex-1
              min-h-touch
              rounded-2xl
              font-sans font-semibold text-lg
              transition-all duration-150
              outline-none
              focus-visible:ring-2 focus-visible:ring-colibri-primary-light focus-visible:ring-offset-2 focus-visible:ring-offset-colibri-bg
              active:scale-95
              ${
                isActive
                  ? 'bg-colibri-primary text-white shadow-lg shadow-colibri-primary/25'
                  : 'bg-colibri-surface text-colibri-text-secondary hover:bg-colibri-subtle'
              }
              ${isRunning && !isActive ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {minutes}<span className="text-sm font-normal ml-0.5">min</span>
          </button>
        );
      })}
    </div>
  );
}
