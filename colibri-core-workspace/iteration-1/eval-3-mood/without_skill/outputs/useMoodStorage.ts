import { useState, useEffect, useCallback } from "react";
import type { MoodEntry, MoodValue } from "./types";

const STORAGE_KEY = "colibri_mood_entries";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function loadEntries(): MoodEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveEntries(entries: MoodEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // silently fail — localStorage might be full
  }
}

export function useMoodStorage() {
  const [entries, setEntries] = useState<MoodEntry[]>([]);

  // Load on mount
  useEffect(() => {
    setEntries(loadEntries());
  }, []);

  const addEntry = useCallback((mood: MoodValue) => {
    const entry: MoodEntry = {
      id: generateId(),
      mood,
      timestamp: Date.now(),
      date: todayKey(),
    };
    setEntries((prev) => {
      const updated = [entry, ...prev];
      saveEntries(updated);
      return updated;
    });
    return entry;
  }, []);

  // Today's latest mood (if any)
  const todayEntry = entries.find((e) => e.date === todayKey()) ?? null;

  // Last 7 days entries (one per day, most recent per day)
  const last7Days = useCallback((): (MoodEntry | null)[] => {
    const result: (MoodEntry | null)[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const dayEntry = entries.find((e) => e.date === key) ?? null;
      result.push(dayEntry);
    }
    return result;
  }, [entries]);

  return { entries, addEntry, todayEntry, last7Days };
}
