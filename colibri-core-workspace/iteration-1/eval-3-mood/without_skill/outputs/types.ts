export type MoodValue = 1 | 2 | 3 | 4 | 5;

export interface MoodEntry {
  id: string;
  mood: MoodValue;
  timestamp: number; // Unix ms
  date: string; // YYYY-MM-DD for grouping
}

export interface MoodOption {
  value: MoodValue;
  emoji: string;
  label: string; // accessible label, not shown prominently
  color: string; // tailwind ring/bg color on select
}

export const MOOD_OPTIONS: MoodOption[] = [
  { value: 1, emoji: "😞", label: "Muito mal", color: "#EF4444" },
  { value: 2, emoji: "😕", label: "Mal", color: "#F97316" },
  { value: 3, emoji: "😐", label: "Neutro", color: "#EAB308" },
  { value: 4, emoji: "😊", label: "Bem", color: "#22C55E" },
  { value: 5, emoji: "🤩", label: "Muito bem", color: "#7C3AED" },
];
