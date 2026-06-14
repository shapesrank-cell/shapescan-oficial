// Colibri design tokens and constants

export const COLORS = {
  bg: '#121214',
  surface: '#1A1A1E',
  subtle: '#232328',
  primary: '#7C3AED',
  primaryLight: '#A78BFA',
  success: '#34D399',
  warn: '#FBBF24',
  text: '#F4F4F5',
  textSecondary: '#A1A1AA',
  textMuted: '#52525B',
} as const;

export const TIMER_PRESETS = [15, 25, 45] as const;

export const MOOD_LABELS = {
  1: 'Radiante',
  2: 'Contente',
  3: 'Neutro',
  4: 'Cansado',
  5: 'Dificil',
} as const;

export const NAV_ITEMS = [
  { path: '/', label: 'Timer' },
  { path: '/mood', label: 'Humor' },
  { path: '/tasks', label: 'Tarefas' },
  { path: '/chat', label: 'Chat' },
  { path: '/profile', label: 'Perfil' },
] as const;
