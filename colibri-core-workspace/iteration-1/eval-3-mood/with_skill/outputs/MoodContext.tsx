import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

// --- Types ---

export type MoodValue = 1 | 2 | 3 | 4 | 5;

export interface MoodEntry {
  mood: MoodValue;
  timestamp: string; // ISO date
}

interface MoodState {
  entries: MoodEntry[];
}

interface MoodContextValue {
  entries: MoodEntry[];
  todayEntry: MoodEntry | undefined;
  registerMood: (mood: MoodValue) => void;
  last7Days: MoodEntry[];
}

const STORAGE_KEY = 'colibri-mood';

const MoodContext = createContext<MoodContextValue | null>(null);

// --- Helpers ---

function loadState(): MoodState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as MoodState;
      if (Array.isArray(parsed.entries)) return parsed;
    }
  } catch {
    // corrupted storage — start fresh
  }
  return { entries: [] };
}

function isSameDay(a: string, b: string): boolean {
  return a.slice(0, 10) === b.slice(0, 10);
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

// --- Provider ---

export function MoodProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MoodState>(loadState);

  // Persist to localStorage asynchronously (non-blocking)
  useEffect(() => {
    const id = requestIdleCallback(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    });
    return () => cancelIdleCallback(id);
  }, [state]);

  const todayISO = new Date().toISOString();

  const todayEntry = state.entries.find((e) => isSameDay(e.timestamp, todayISO));

  const registerMood = useCallback((mood: MoodValue) => {
    const now = new Date().toISOString();
    setState((prev) => {
      // Replace if already registered today; otherwise add
      const withoutToday = prev.entries.filter((e) => !isSameDay(e.timestamp, now));
      return {
        entries: [{ mood, timestamp: now }, ...withoutToday],
      };
    });
  }, []);

  // Last 7 days: one entry per day, most recent per day wins
  const last7Days: MoodEntry[] = (() => {
    const cutoff = daysAgo(7);
    const recent = state.entries.filter((e) => new Date(e.timestamp) >= cutoff);

    // Dedupe by day — keep first (most recent due to ordering)
    const seen = new Set<string>();
    const deduped: MoodEntry[] = [];
    for (const entry of recent) {
      const day = entry.timestamp.slice(0, 10);
      if (!seen.has(day)) {
        seen.add(day);
        deduped.push(entry);
      }
    }
    return deduped.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  })();

  return (
    <MoodContext.Provider value={{ entries: state.entries, todayEntry, registerMood, last7Days }}>
      {children}
    </MoodContext.Provider>
  );
}

// --- Hook ---

export function useMood(): MoodContextValue {
  const ctx = useContext(MoodContext);
  if (!ctx) {
    throw new Error('useMood must be used inside <MoodProvider>');
  }
  return ctx;
}
