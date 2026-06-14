import React from 'react';
import { useTimer } from './useTimer';
import { ProgressRing } from './ProgressRing';
import { PresetSelector } from './PresetSelector';
import { CelebrationOverlay } from './CelebrationOverlay';

export function PomodoroTimer() {
  const {
    selectedPreset,
    timerState,
    progress,
    display,
    celebrationMessage,
    selectPreset,
    toggleStartPause,
    reset,
    backToPresets,
  } = useTimer();

  return (
    <div className="min-h-screen bg-[#121214] flex flex-col items-center justify-center px-4 py-8">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Pomodoro
        </h1>
        {selectedPreset && timerState !== 'completed' && (
          <p className="text-sm text-white/40 mt-1">
            {selectedPreset.emoji} {selectedPreset.label} — {selectedPreset.minutes} min
          </p>
        )}
      </div>

      {/* Main content */}
      {!selectedPreset ? (
        <PresetSelector onSelect={selectPreset} />
      ) : timerState === 'completed' ? (
        <CelebrationOverlay
          message={celebrationMessage}
          onNewSession={reset}
          onBack={backToPresets}
        />
      ) : (
        <div className="flex flex-col items-center gap-10">
          {/* Progress ring - tap to start/pause */}
          <ProgressRing
            progress={progress}
            display={display}
            timerState={timerState}
            onTap={toggleStartPause}
          />

          {/* Action buttons */}
          <div className="flex gap-4">
            {timerState !== 'idle' && (
              <button
                onClick={reset}
                className="px-6 py-3 rounded-xl bg-white/[0.06] border border-white/[0.08] hover:bg-white/[0.1] active:scale-[0.97] transition-all duration-150 text-white/50 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
              >
                Reiniciar
              </button>
            )}
            <button
              onClick={backToPresets}
              className="px-6 py-3 rounded-xl bg-white/[0.06] border border-white/[0.08] hover:bg-white/[0.1] active:scale-[0.97] transition-all duration-150 text-white/50 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
            >
              Trocar tempo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PomodoroTimer;
