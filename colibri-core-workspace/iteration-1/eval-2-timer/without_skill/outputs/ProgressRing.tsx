import React from 'react';
import { TimerState } from './types';

interface ProgressRingProps {
  progress: number; // 0 to 1
  display: string;
  timerState: TimerState;
  onTap: () => void;
}

const SIZE = 260;
const STROKE_WIDTH = 10;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ProgressRing({ progress, display, timerState, onTap }: ProgressRingProps) {
  const offset = CIRCUMFERENCE - progress * CIRCUMFERENCE;

  const ringColor = timerState === 'completed' ? '#22c55e' : '#7C3AED';
  const glowColor = timerState === 'completed' ? 'rgba(34,197,94,0.3)' : 'rgba(124,58,237,0.25)';

  const tapHint = (() => {
    switch (timerState) {
      case 'idle':
        return 'Toque para iniciar';
      case 'running':
        return 'Toque para pausar';
      case 'paused':
        return 'Toque para continuar';
      case 'completed':
        return '';
    }
  })();

  return (
    <button
      onClick={onTap}
      disabled={timerState === 'completed'}
      className="relative flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#121214] rounded-full transition-transform active:scale-95 disabled:active:scale-100"
      style={{ width: SIZE, height: SIZE }}
      aria-label={tapHint || 'Timer completo'}
    >
      {/* Glow effect */}
      <div
        className="absolute inset-0 rounded-full blur-xl transition-opacity duration-500"
        style={{
          backgroundColor: glowColor,
          opacity: timerState === 'running' ? 1 : 0.4,
        }}
      />

      <svg
        width={SIZE}
        height={SIZE}
        className="absolute inset-0 -rotate-90"
        viewBox={`0 0 ${SIZE} ${SIZE}`}
      >
        {/* Background track */}
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={STROKE_WIDTH}
        />
        {/* Progress arc */}
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={ringColor}
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-linear"
        />
      </svg>

      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center gap-1">
        <span
          className="font-mono text-5xl font-bold tracking-tight text-white tabular-nums"
          aria-live="polite"
        >
          {display}
        </span>
        {tapHint && (
          <span className="text-sm text-white/40 transition-opacity">
            {tapHint}
          </span>
        )}
      </div>
    </button>
  );
}
