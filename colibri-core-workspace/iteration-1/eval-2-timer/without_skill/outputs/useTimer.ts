import { useState, useRef, useCallback, useEffect } from 'react';
import { TimerState, TimerPreset, CELEBRATION_MESSAGES } from './types';

export function useTimer() {
  const [selectedPreset, setSelectedPreset] = useState<TimerPreset | null>(null);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [celebrationMessage, setCelebrationMessage] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const pickCelebration = useCallback(() => {
    const msg = CELEBRATION_MESSAGES[Math.floor(Math.random() * CELEBRATION_MESSAGES.length)];
    setCelebrationMessage(msg);
  }, []);

  const selectPreset = useCallback((preset: TimerPreset) => {
    clearTimer();
    const secs = preset.minutes * 60;
    setSelectedPreset(preset);
    setTotalSeconds(secs);
    setRemainingSeconds(secs);
    setTimerState('idle');
    setCelebrationMessage('');
  }, [clearTimer]);

  const start = useCallback(() => {
    if (remainingSeconds <= 0) return;
    setTimerState('running');
  }, [remainingSeconds]);

  const pause = useCallback(() => {
    setTimerState('paused');
  }, []);

  const toggleStartPause = useCallback(() => {
    if (timerState === 'running') {
      pause();
    } else if (timerState === 'idle' || timerState === 'paused') {
      start();
    }
  }, [timerState, start, pause]);

  const reset = useCallback(() => {
    clearTimer();
    if (selectedPreset) {
      const secs = selectedPreset.minutes * 60;
      setTotalSeconds(secs);
      setRemainingSeconds(secs);
    }
    setTimerState('idle');
    setCelebrationMessage('');
  }, [clearTimer, selectedPreset]);

  const backToPresets = useCallback(() => {
    clearTimer();
    setSelectedPreset(null);
    setTotalSeconds(0);
    setRemainingSeconds(0);
    setTimerState('idle');
    setCelebrationMessage('');
  }, [clearTimer]);

  // Timer tick effect
  useEffect(() => {
    if (timerState === 'running') {
      intervalRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearTimer();
            setTimerState('completed');
            pickCelebration();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearTimer();
    }

    return clearTimer;
  }, [timerState, clearTimer, pickCelebration]);

  const progress = totalSeconds > 0 ? (totalSeconds - remainingSeconds) / totalSeconds : 0;

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return {
    selectedPreset,
    timerState,
    progress,
    display,
    celebrationMessage,
    selectPreset,
    toggleStartPause,
    reset,
    backToPresets,
  };
}
