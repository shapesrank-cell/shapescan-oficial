import React, { useState } from "react";
import { MOOD_OPTIONS } from "./types";
import type { MoodValue } from "./types";

// Warm, non-judgmental confirmation messages
const CONFIRMATIONS: Record<MoodValue, string[]> = {
  1: ["Registrado. Dias difíceis existem.", "Anotado. Vai passar.", "Tudo bem sentir assim."],
  2: ["Registrado. Um passo de cada vez.", "Anotado. Sem pressa.", "Ok, registrado."],
  3: ["Registrado. Neutro tá ótimo.", "Anotado. Dia tranquilo.", "Registrado."],
  4: ["Boa! Registrado.", "Que bom! Anotado.", "Registrado!"],
  5: ["Incrível! Registrado.", "Anotado com carinho!", "Show!"],
};

function pickRandom(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

interface MoodPickerProps {
  todayMood: MoodValue | null;
  onSelect: (mood: MoodValue) => void;
}

export default function MoodPicker({ todayMood, onSelect }: MoodPickerProps) {
  const [selected, setSelected] = useState<MoodValue | null>(todayMood);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [animating, setAnimating] = useState<MoodValue | null>(null);

  const handleSelect = (mood: MoodValue) => {
    // Haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }

    setAnimating(mood);
    setSelected(mood);
    setConfirmation(pickRandom(CONFIRMATIONS[mood]));
    onSelect(mood);

    // Reset animation state
    setTimeout(() => setAnimating(null), 600);

    // Clear confirmation after a few seconds
    setTimeout(() => setConfirmation(null), 3000);
  };

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Heading — gentle, no pressure */}
      <p className="text-white/60 text-sm font-medium tracking-wide">
        {selected ? "Seu humor hoje" : "Como você tá agora?"}
      </p>

      {/* Emoji row */}
      <div className="flex items-center justify-center gap-3">
        {MOOD_OPTIONS.map((option) => {
          const isSelected = selected === option.value;
          const isAnimating = animating === option.value;

          return (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              aria-label={option.label}
              className={`
                relative flex items-center justify-center
                w-14 h-14 rounded-2xl text-3xl
                transition-all duration-300 ease-out
                active:scale-90
                ${isSelected
                  ? "scale-110 bg-white/10 shadow-lg"
                  : "bg-white/[0.04] hover:bg-white/[0.08] hover:scale-105"
                }
                ${isAnimating ? "animate-bounce-once" : ""}
                ${!isSelected && selected ? "opacity-40" : "opacity-100"}
              `}
              style={
                isSelected
                  ? { boxShadow: `0 0 20px ${option.color}30, 0 0 40px ${option.color}15` }
                  : undefined
              }
            >
              <span className="select-none" role="img" aria-hidden="true">
                {option.emoji}
              </span>

              {/* Selection ring */}
              {isSelected && (
                <span
                  className="absolute inset-0 rounded-2xl border-2 animate-fade-in"
                  style={{ borderColor: option.color }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Confirmation message — warm, ephemeral */}
      <div className="h-6 flex items-center justify-center">
        {confirmation && (
          <p className="text-white/50 text-sm animate-fade-in-up">
            {confirmation}
          </p>
        )}
      </div>
    </div>
  );
}
