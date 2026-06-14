import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type Dispatch,
  type ReactNode,
} from 'react';

// ── Tipos ────────────────────────────────────────────────────

export interface TimerState {
  duration: number;           // duração escolhida em segundos
  remaining: number;          // tempo restante em segundos
  isRunning: boolean;
  sessionsCompleted: number;  // total de sessões concluídas hoje
  lastSessionDate: string;    // ISO date para resetar contador diário
  showCelebration: boolean;   // exibe mensagem de celebração
}

export type TimerAction =
  | { type: 'START' }
  | { type: 'PAUSE' }
  | { type: 'TICK'; payload: number }
  | { type: 'SET_DURATION'; payload: number }
  | { type: 'RESET' }
  | { type: 'DISMISS_CELEBRATION' }
  | { type: 'HYDRATE'; payload: TimerState };

// ── Constantes ───────────────────────────────────────────────

const STORAGE_KEY = 'colibri-timer';
const DEFAULT_DURATION = 25 * 60; // 25 minutos

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

const initialState: TimerState = {
  duration: DEFAULT_DURATION,
  remaining: DEFAULT_DURATION,
  isRunning: false,
  sessionsCompleted: 0,
  lastSessionDate: todayISO(),
  showCelebration: false,
};

// ── Reducer ──────────────────────────────────────────────────

function timerReducer(state: TimerState, action: TimerAction): TimerState {
  switch (action.type) {
    case 'START':
      return { ...state, isRunning: true };

    case 'PAUSE':
      return { ...state, isRunning: false };

    case 'TICK': {
      const newRemaining = Math.max(0, state.remaining - action.payload);

      // Timer completou!
      if (newRemaining === 0 && state.remaining > 0) {
        const today = todayISO();
        const sessions = state.lastSessionDate === today
          ? state.sessionsCompleted + 1
          : 1;

        return {
          ...state,
          remaining: 0,
          isRunning: false,
          sessionsCompleted: sessions,
          lastSessionDate: today,
          showCelebration: true,
        };
      }

      return { ...state, remaining: newRemaining };
    }

    case 'SET_DURATION':
      // Mudar preset reseta o timer (1 toque, sem confirmação)
      return {
        ...state,
        duration: action.payload,
        remaining: action.payload,
        isRunning: false,
        showCelebration: false,
      };

    case 'RESET':
      return {
        ...state,
        remaining: state.duration,
        isRunning: false,
        showCelebration: false,
      };

    case 'DISMISS_CELEBRATION':
      return {
        ...state,
        remaining: state.duration,
        showCelebration: false,
      };

    case 'HYDRATE':
      return {
        ...action.payload,
        // Nunca restaurar como "rodando" — o intervalo não sobrevive refresh
        isRunning: false,
        showCelebration: false,
      };

    default:
      return state;
  }
}

// ── Context ──────────────────────────────────────────────────

interface TimerContextValue {
  state: TimerState;
  dispatch: Dispatch<TimerAction>;
}

const TimerContext = createContext<TimerContextValue | null>(null);

export function useTimerContext(): TimerContextValue {
  const ctx = useContext(TimerContext);
  if (!ctx) {
    throw new Error('useTimerContext deve ser usado dentro de <TimerProvider>');
  }
  return ctx;
}

// ── Provider ─────────────────────────────────────────────────

interface TimerProviderProps {
  children: ReactNode;
}

export function TimerProvider({ children }: TimerProviderProps) {
  const [state, dispatch] = useReducer(timerReducer, initialState);

  // ── Hidratar do localStorage na montagem ───────────────────
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as TimerState;
        // Resetar sessões se é um novo dia
        if (parsed.lastSessionDate !== todayISO()) {
          parsed.sessionsCompleted = 0;
          parsed.lastSessionDate = todayISO();
        }
        dispatch({ type: 'HYDRATE', payload: parsed });
      }
    } catch {
      // localStorage corrompido — usa estado padrão, sem stress
    }
  }, []);

  // ── Persistir no localStorage (async, não bloqueia UI) ─────
  useEffect(() => {
    const id = requestIdleCallback(() => {
      try {
        const toStore: TimerState = {
          ...state,
          isRunning: false,       // nunca persistir como rodando
          showCelebration: false,  // nunca persistir celebração
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
      } catch {
        // Sem espaço no storage — falha silenciosamente
      }
    });
    return () => cancelIdleCallback(id);
  }, [state]);

  return (
    <TimerContext.Provider value={{ state, dispatch }}>
      {children}
    </TimerContext.Provider>
  );
}
