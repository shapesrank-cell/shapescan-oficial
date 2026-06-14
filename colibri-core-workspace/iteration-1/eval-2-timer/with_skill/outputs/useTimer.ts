import { useCallback, useEffect, useRef } from 'react';
import { useTimerContext } from './TimerContext';

/**
 * useTimer — Hook de controle do Pomodoro com correção de drift.
 *
 * Em vez de contar ticks de setInterval (que derivam com o tempo),
 * compara timestamps reais para manter precisão mesmo em abas
 * background ou dispositivos lentos.
 */
export function useTimer() {
  const { state, dispatch } = useTimerContext();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastTickRef = useRef<number>(Date.now());

  // ── Tick com correção de drift ──────────────────────────────
  const tick = useCallback(() => {
    const now = Date.now();
    const elapsed = Math.round((now - lastTickRef.current) / 1000);
    lastTickRef.current = now;

    if (elapsed > 0) {
      dispatch({ type: 'TICK', payload: elapsed });
    }
  }, [dispatch]);

  // ── Iniciar / Pausar ───────────────────────────────────────
  const toggle = useCallback(() => {
    if (state.isRunning) {
      dispatch({ type: 'PAUSE' });
    } else {
      lastTickRef.current = Date.now();
      dispatch({ type: 'START' });
    }
  }, [state.isRunning, dispatch]);

  // ── Selecionar preset ──────────────────────────────────────
  const selectPreset = useCallback(
    (minutes: 15 | 25 | 45) => {
      dispatch({ type: 'SET_DURATION', payload: minutes * 60 });
    },
    [dispatch],
  );

  // ── Resetar timer ──────────────────────────────────────────
  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, [dispatch]);

  // ── Dispensar celebração ───────────────────────────────────
  const dismissCelebration = useCallback(() => {
    dispatch({ type: 'DISMISS_CELEBRATION' });
  }, [dispatch]);

  // ── Intervalo controlado por isRunning ─────────────────────
  useEffect(() => {
    if (state.isRunning) {
      lastTickRef.current = Date.now();
      intervalRef.current = setInterval(tick, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [state.isRunning, tick]);

  // ── Vibração + notificação ao completar ────────────────────
  useEffect(() => {
    if (state.showCelebration) {
      // Vibração suave (se suportado)
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100, 50, 200]);
      }

      // Notification API (se já tem permissão)
      if (Notification.permission === 'granted') {
        new Notification('Colibri 🎉', {
          body: 'Sessão completa! Você tá voando!',
          icon: '/colibri-icon.png',
        });
      }
    }
  }, [state.showCelebration]);

  // ── Valores derivados ──────────────────────────────────────
  const progress = state.duration > 0
    ? (state.duration - state.remaining) / state.duration
    : 0;

  const minutes = Math.floor(state.remaining / 60);
  const seconds = state.remaining % 60;
  const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return {
    // Estado
    duration: state.duration,
    remaining: state.remaining,
    isRunning: state.isRunning,
    sessionsCompleted: state.sessionsCompleted,
    showCelebration: state.showCelebration,

    // Derivados
    progress,
    display,
    currentPreset: (state.duration / 60) as 15 | 25 | 45,

    // Ações (todas 1 toque)
    toggle,
    selectPreset,
    reset,
    dismissCelebration,
  };
}
