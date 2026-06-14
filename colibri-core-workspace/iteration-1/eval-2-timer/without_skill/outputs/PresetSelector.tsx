import React from 'react';
import { TimerPreset, PRESETS } from './types';

interface PresetSelectorProps {
  onSelect: (preset: TimerPreset) => void;
}

export function PresetSelector({ onSelect }: PresetSelectorProps) {
  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm mx-auto">
      <h2 className="text-xl font-semibold text-white/80">
        Quanto tempo de foco?
      </h2>
      <div className="flex flex-col gap-3 w-full">
        {PRESETS.map((preset) => (
          <button
            key={preset.minutes}
            onClick={() => onSelect(preset)}
            className="flex items-center justify-between w-full px-6 py-5 rounded-2xl bg-white/[0.06] border border-white/[0.08] hover:border-purple-500/40 hover:bg-white/[0.1] active:scale-[0.97] transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl" role="img" aria-hidden="true">
                {preset.emoji}
              </span>
              <span className="text-lg font-medium text-white">
                {preset.label}
              </span>
            </div>
            <span className="text-lg font-mono text-purple-400 tabular-nums">
              {preset.minutes} min
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
