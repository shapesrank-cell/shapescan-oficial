import { useState, useEffect } from 'react';

export function usePersistedState<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    const id = requestIdleCallback(() => {
      localStorage.setItem(key, JSON.stringify(state));
    });
    return () => cancelIdleCallback(id);
  }, [key, state]);

  return [state, setState] as const;
}
