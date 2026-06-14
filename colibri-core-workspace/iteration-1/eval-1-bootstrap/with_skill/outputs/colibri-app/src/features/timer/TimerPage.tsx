import { useState } from 'react';
import { ProgressRing } from '../../components/ui/ProgressRing';
import { Card } from '../../components/ui/Card';
import { TIMER_PRESETS } from '../../lib/constants';

const PRESET_LABELS: Record<number, string> = {
  15: '15 min',
  25: '25 min',
  45: '45 min',
};

export default function TimerPage() {
  const [duration, setDuration] = useState(25);
  const [remaining, setRemaining] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  const progress = 1 - remaining / (duration * 60);
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  const handleToggle = () => {
    if (!isRunning) {
      setIsRunning(true);
      // Timer logic will be implemented in TimerContext
      const interval = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setIsRunning(false);
    }
  };

  const handlePreset = (preset: number) => {
    if (isRunning) return;
    setDuration(preset);
    setRemaining(preset * 60);
  };

  return (
    <div className="flex flex-col items-center gap-8 p-5 pt-8">
      <p className="text-colibri-text-secondary text-sm">
        {isRunning ? 'Focando... Voce ta indo bem!' : 'Quando quiser, comece uma sessao'}
      </p>

      <ProgressRing progress={progress} size={220} strokeWidth={10} onClick={handleToggle}>
        <div className="flex flex-col items-center">
          <span className="text-4xl font-semibold text-colibri-text tabular-nums">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
          <span className="text-xs text-colibri-text-muted mt-1">
            {isRunning ? 'toque para pausar' : 'toque para iniciar'}
          </span>
        </div>
      </ProgressRing>

      <div className="flex gap-3">
        {TIMER_PRESETS.map((preset) => (
          <button
            key={preset}
            onClick={() => handlePreset(preset)}
            className={`
              min-h-touch px-5 py-3 rounded-2xl font-medium text-sm transition-colors
              ${duration === preset
                ? 'bg-colibri-primary text-white'
                : 'bg-colibri-surface text-colibri-text-secondary hover:bg-colibri-subtle'
              }
            `}
          >
            {PRESET_LABELS[preset]}
          </button>
        ))}
      </div>

      <Card className="w-full max-w-sm text-center">
        <p className="text-colibri-text-secondary text-sm">
          Sessoes hoje
        </p>
        <p className="text-2xl font-semibold text-colibri-text mt-1">0</p>
      </Card>
    </div>
  );
}
