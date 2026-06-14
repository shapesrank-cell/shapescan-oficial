import { useState } from 'react';
import { Card } from '../../components/ui/Card';

interface MoodOption {
  value: 1 | 2 | 3 | 4 | 5;
  emoji: string;
  label: string;
  message: string;
}

const MOOD_OPTIONS: MoodOption[] = [
  { value: 1, emoji: '😄', label: 'Radiante', message: 'Que bom que voce ta bem!' },
  { value: 2, emoji: '🙂', label: 'Contente', message: 'Dia tranquilo, que bom!' },
  { value: 3, emoji: '😐', label: 'Neutro', message: 'Tudo bem estar no meio-termo' },
  { value: 4, emoji: '😔', label: 'Cansado', message: 'Dia puxado, ne? Ta tudo bem' },
  { value: 5, emoji: '😢', label: 'Dificil', message: 'To aqui com voce. Respira fundo' },
];

export default function MoodPage() {
  const [selectedMood, setSelectedMood] = useState<MoodOption | null>(null);

  return (
    <div className="flex flex-col items-center gap-8 p-5 pt-8">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-colibri-text">Como voce ta agora?</h2>
        <p className="text-sm text-colibri-text-secondary mt-1">
          Sem julgamento, so registro
        </p>
      </div>

      <div className="flex gap-4">
        {MOOD_OPTIONS.map((mood) => (
          <button
            key={mood.value}
            onClick={() => setSelectedMood(mood)}
            className={`
              flex flex-col items-center gap-1 min-h-touch min-w-touch p-3 rounded-2xl
              transition-all duration-150
              ${selectedMood?.value === mood.value
                ? 'bg-colibri-primary/20 scale-110'
                : 'bg-colibri-surface hover:bg-colibri-subtle'
              }
            `}
          >
            <span className="text-3xl">{mood.emoji}</span>
            <span className="text-xs text-colibri-text-secondary">{mood.label}</span>
          </button>
        ))}
      </div>

      {selectedMood && (
        <Card className="w-full max-w-sm text-center">
          <p className="text-colibri-text">{selectedMood.message}</p>
        </Card>
      )}

      <Card className="w-full max-w-sm">
        <p className="text-sm text-colibri-text-secondary text-center">
          Historico dos ultimos 7 dias aparecera aqui
        </p>
      </Card>
    </div>
  );
}
