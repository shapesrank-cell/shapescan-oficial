export type TimerPreset = {
  label: string;
  minutes: number;
  emoji: string;
};

export type TimerState = 'idle' | 'running' | 'paused' | 'completed';

export const PRESETS: TimerPreset[] = [
  { label: 'Rápido', minutes: 15, emoji: '⚡' },
  { label: 'Clássico', minutes: 25, emoji: '🍅' },
  { label: 'Deep Focus', minutes: 45, emoji: '🧠' },
];

export const CELEBRATION_MESSAGES = [
  'Você arrasou! 🎉',
  'Foco incrível! 💪',
  'Missão cumprida! 🏆',
  'Que dedicação! 🌟',
  'Parabéns, campeão! 🔥',
  'Mais uma vitória! ✨',
];
