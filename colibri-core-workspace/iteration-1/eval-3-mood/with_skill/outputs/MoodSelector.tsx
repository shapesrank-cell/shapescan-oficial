import { useState, useEffect } from 'react';
import { useMood, type MoodValue } from './MoodContext';

// --- Mood config ---

interface MoodOption {
  value: MoodValue;
  emoji: string;
  label: string;
  color: string;       // Tailwind bg class for the selected ring/glow
  message: string;     // Acolhimento message shown after selection
}

const MOOD_OPTIONS: MoodOption[] = [
  {
    value: 1,
    emoji: '\u{1F929}', // star-struck / radiante
    label: 'Radiante',
    color: 'bg-colibri-success',
    message: 'Que bom que voce ta bem!',
  },
  {
    value: 2,
    emoji: '\u{1F60A}', // smiling / contente
    label: 'Contente',
    color: 'bg-[#86EFAC]',
    message: 'Dia tranquilo, que bom!',
  },
  {
    value: 3,
    emoji: '\u{1F610}', // neutral
    label: 'Neutro',
    color: 'bg-colibri-warn',
    message: 'Tudo bem estar no meio-termo',
  },
  {
    value: 4,
    emoji: '\u{1F62E}\u{200D}\u{1F4A8}', // face exhaling / cansado
    label: 'Cansado',
    color: 'bg-[#FB923C]',
    message: 'Dia puxado, ne? Ta tudo bem',
  },
  {
    value: 5,
    emoji: '\u{1F622}', // crying / dificil
    label: 'Dificil',
    color: 'bg-[#F87171]',
    message: 'To aqui com voce. Respira fundo',
  },
];

// --- Component ---

export function MoodSelector() {
  const { registerMood, todayEntry } = useMood();
  const [justSelected, setJustSelected] = useState<MoodValue | null>(null);
  const [showMessage, setShowMessage] = useState(false);

  // If user already registered today, show that as default
  const activeValue = justSelected ?? todayEntry?.mood ?? null;
  const activeOption = MOOD_OPTIONS.find((o) => o.value === activeValue);

  function handleSelect(option: MoodOption) {
    registerMood(option.value);
    setJustSelected(option.value);
    setShowMessage(true);
  }

  // Clear the feedback message after 3 seconds
  useEffect(() => {
    if (!showMessage) return;
    const timer = setTimeout(() => setShowMessage(false), 3000);
    return () => clearTimeout(timer);
  }, [showMessage, justSelected]);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Question — gentle, never demanding */}
      <p className="text-lg font-medium text-colibri-text">
        Como voce ta agora?
      </p>

      {/* Emoji row — 5 items, generous touch targets */}
      <div className="flex items-center justify-center gap-3">
        {MOOD_OPTIONS.map((option) => {
          const isActive = activeValue === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option)}
              aria-label={option.label}
              className={[
                // Base: generous touch target (min 48x48), rounded, transition
                'min-h-touch min-w-touch flex items-center justify-center',
                'rounded-2xl text-3xl transition-all duration-150 select-none',
                // Active: scale up + colored ring
                isActive
                  ? 'scale-125 ring-3 ring-offset-2 ring-offset-colibri-bg ' +
                    option.color.replace('bg-', 'ring-')
                  : 'hover:scale-110 active:scale-95',
                // Pulse animation on just-selected
                isActive && justSelected === option.value && showMessage
                  ? 'animate-pulse'
                  : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {option.emoji}
            </button>
          );
        })}
      </div>

      {/* Feedback message — acolhimento, never judgment */}
      <div
        className={[
          'h-8 flex items-center justify-center transition-opacity duration-300',
          showMessage && activeOption ? 'opacity-100' : 'opacity-0',
        ].join(' ')}
        aria-live="polite"
      >
        {activeOption && (
          <p className="text-base text-colibri-text-secondary text-center">
            {activeOption.message}
          </p>
        )}
      </div>

      {/* Subtle label below for today's status */}
      {todayEntry && !showMessage && (
        <p className="text-sm text-colibri-text-muted">
          Humor de hoje registrado{' '}
          <span role="img" aria-hidden="true">
            {MOOD_OPTIONS.find((o) => o.value === todayEntry.mood)?.emoji}
          </span>
        </p>
      )}
    </div>
  );
}
