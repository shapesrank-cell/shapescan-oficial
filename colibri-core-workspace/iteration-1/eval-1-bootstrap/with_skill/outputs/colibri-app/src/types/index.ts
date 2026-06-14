// Global shared types for Colibri

export interface TimerState {
  duration: number;
  remaining: number;
  isRunning: boolean;
  sessionsCompleted: number;
  lastSessionDate: string;
}

export interface MoodEntry {
  mood: 1 | 2 | 3 | 4 | 5;
  timestamp: string;
  note?: string;
}

export interface MoodState {
  entries: MoodEntry[];
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface TasksState {
  tasks: Task[];
}

export interface ProfileState {
  name: string;
  notifications: boolean;
  sounds: boolean;
  defaultDuration: 15 | 25 | 45;
}

export type NavItem = {
  path: string;
  label: string;
  icon: React.ReactNode;
};
