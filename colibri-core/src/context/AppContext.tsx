import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
  type ReactNode,
} from 'react'

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type EnergyLevel = 1 | 2 | 3 | 4 | 5
export type Prioridade   = 'Alta' | 'Média' | 'Baixa'
export type TimerStatus  = 'idle' | 'running' | 'paused' | 'completed'
export type TimerMode    = 'leve' | 'foco' | 'intenso'

export interface Task {
  id: string
  texto: string
  feita: boolean
  prioridade: Prioridade
  criadaEm: string
}

export interface ActiveTimer {
  status: TimerStatus
  mode: TimerMode
  /** Segundos restantes no ciclo atual */
  segundosRestantes: number
  /** Quantas sessões de foco foram concluídas hoje */
  sessoes: number
}

export interface Settings {
  /** Nome do usuário exibido no avatar */
  nome: string
  /** Liga/desliga o acorde de conclusão do timer */
  somAtivo: boolean
  /** Duração em segundos de cada modo (personalizável) */
  duracoes: Record<TimerMode, number>
}

export interface Habito {
  id: string
  texto: string
  feito: boolean
  /** Objetivo permanente do hábito — persiste entre dias */
  meta?: string
  /** Nota diária — reseta junto com feito a cada novo dia */
  nota?: string
}

export interface AppState {
  /** Nível de energia auto-reportado (1 = esgotado, 5 = ótimo) */
  userEnergy: EnergyLevel
  /** Máximo 5 tarefas por dia — TDAH precisa de foco, não de lista infinita */
  todayTasks: Task[]
  /** Estado atual do pomodoro */
  activeTimer: ActiveTimer
  /** Configurações do usuário */
  settings: Settings
  /** Hábitos diários recorrentes (máximo 5) */
  dailyHabits: Habito[]
  /** Data ISO (YYYY-MM-DD) do último reset dos hábitos — para detecção de novo dia */
  ultimoResetHabitos: string
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_DURACOES: Record<TimerMode, number> = {
  'leve':    15 * 60,
  'foco':    25 * 60,
  'intenso': 45 * 60,
}

const DEFAULT_SETTINGS: Settings = {
  nome:      '',
  somAtivo:  true,
  duracoes:  { ...DEFAULT_DURACOES },
}

const DEFAULT_HABITOS: Habito[] = [
  { id: 'h1', texto: 'Beber água',              feito: false },
  { id: 'h2', texto: 'Tomar remédio',           feito: false },
  { id: 'h3', texto: 'Alongamento de 5 min',    feito: false },
  { id: 'h4', texto: 'Planejar o dia',          feito: false },
  { id: 'h5', texto: 'Gratidão rápida',         feito: false },
]

function hojeISO(): string {
  return new Date().toISOString().split('T')[0]
}

const DEFAULT_STATE: AppState = {
  userEnergy: 3,
  todayTasks: [],
  activeTimer: {
    status:             'idle',
    mode:               'foco',
    segundosRestantes:  DEFAULT_DURACOES['foco'],
    sessoes:            0,
  },
  settings:           DEFAULT_SETTINGS,
  dailyHabits:        DEFAULT_HABITOS,
  ultimoResetHabitos: hojeISO(),
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

type AppAction =
  | { type: 'SET_ENERGY';        payload: EnergyLevel }
  | { type: 'ADD_TASK';          payload: { texto: string; prioridade: Prioridade } }
  | { type: 'TOGGLE_TASK';       payload: string }
  | { type: 'REMOVE_TASK';       payload: string }
  | { type: 'SET_TIMER';         payload: Partial<ActiveTimer> }
  | { type: 'CHANGE_MODE';       payload: TimerMode }
  | { type: 'RESET_TIMER' }
  | { type: 'INCREMENT_SESSIONS' }
  | { type: 'UPDATE_SETTINGS';   payload: Partial<Settings> }
  | { type: 'TOGGLE_HABITO';     payload: string }
  | { type: 'UPDATE_HABITO';     payload: { id: string } & Partial<Omit<Habito, 'id' | 'feito'>> }
  | { type: 'ADD_HABITO';        payload: { texto: string; meta?: string } }
  | { type: 'REMOVE_HABITO';     payload: string }

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_ENERGY':
      return { ...state, userEnergy: action.payload }

    case 'ADD_TASK': {
      if (state.todayTasks.length >= 5) return state
      const task: Task = {
        id:         crypto.randomUUID(),
        texto:      action.payload.texto.trim(),
        feita:      false,
        prioridade: action.payload.prioridade,
        criadaEm:  new Date().toISOString(),
      }
      return { ...state, todayTasks: [...state.todayTasks, task] }
    }

    case 'TOGGLE_TASK':
      return {
        ...state,
        todayTasks: state.todayTasks.map(t =>
          t.id === action.payload ? { ...t, feita: !t.feita } : t,
        ),
      }

    case 'REMOVE_TASK':
      return {
        ...state,
        todayTasks: state.todayTasks.filter(t => t.id !== action.payload),
      }

    case 'SET_TIMER':
      return {
        ...state,
        activeTimer: { ...state.activeTimer, ...action.payload },
      }

    case 'CHANGE_MODE':
      return {
        ...state,
        activeTimer: {
          ...state.activeTimer,
          mode:              action.payload,
          status:            'idle',
          segundosRestantes: state.settings.duracoes[action.payload],
        },
      }

    case 'RESET_TIMER':
      return {
        ...state,
        activeTimer: {
          ...state.activeTimer,
          status:            'idle',
          segundosRestantes: state.settings.duracoes[state.activeTimer.mode],
        },
      }

    case 'INCREMENT_SESSIONS':
      return {
        ...state,
        activeTimer: {
          ...state.activeTimer,
          sessoes: state.activeTimer.sessoes + 1,
        },
      }

    case 'UPDATE_SETTINGS': {
      const novasSettings = { ...state.settings, ...action.payload }
      const duracaoAtual = novasSettings.duracoes[state.activeTimer.mode]
      const timerIdle = state.activeTimer.status === 'idle'
      return {
        ...state,
        settings: novasSettings,
        activeTimer: timerIdle
          ? { ...state.activeTimer, segundosRestantes: duracaoAtual }
          : state.activeTimer,
      }
    }

    case 'TOGGLE_HABITO':
      return {
        ...state,
        dailyHabits: state.dailyHabits.map(h =>
          h.id === action.payload ? { ...h, feito: !h.feito } : h,
        ),
      }

    case 'UPDATE_HABITO': {
      const { id, ...fields } = action.payload
      return {
        ...state,
        dailyHabits: state.dailyHabits.map(h =>
          h.id === id ? { ...h, ...fields } : h,
        ),
      }
    }

    case 'ADD_HABITO': {
      if (state.dailyHabits.length >= 5) return state
      const habito: Habito = {
        id:    crypto.randomUUID(),
        texto: action.payload.texto.trim(),
        feito: false,
        meta:  action.payload.meta,
      }
      return { ...state, dailyHabits: [...state.dailyHabits, habito] }
    }

    case 'REMOVE_HABITO':
      return {
        ...state,
        dailyHabits: state.dailyHabits.filter(h => h.id !== action.payload),
      }

    default:
      return state
  }
}

// ─── Persistência no localStorage ─────────────────────────────────────────────

const STORAGE_KEY = 'colibri:state:v1'

function getInitialState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_STATE

    const saved = JSON.parse(raw) as Partial<AppState & { ultimoResetHabitos: string }>

    const settings: Settings = {
      ...DEFAULT_SETTINGS,
      ...saved.settings,
      duracoes: {
        ...DEFAULT_DURACOES,
        ...saved.settings?.duracoes,
      },
    }

    // Hábitos salvos ou defaults
    let dailyHabits: Habito[] = saved.dailyHabits ?? DEFAULT_HABITOS
    const hoje = hojeISO()
    const ultimoReset = saved.ultimoResetHabitos ?? ''

    // Novo dia detectado → reseta feito e nota, mantém texto e meta
    if (ultimoReset !== hoje) {
      dailyHabits = dailyHabits.map(h => ({ ...h, feito: false, nota: undefined }))
    }

    return {
      userEnergy: saved.userEnergy ?? DEFAULT_STATE.userEnergy,
      todayTasks: saved.todayTasks ?? DEFAULT_STATE.todayTasks,
      settings,
      activeTimer: {
        ...DEFAULT_STATE.activeTimer,
        ...saved.activeTimer,
        status: saved.activeTimer?.status === 'running'
          ? 'paused'
          : (saved.activeTimer?.status ?? 'idle'),
      },
      dailyHabits,
      ultimoResetHabitos: hoje,
    }
  } catch {
    return DEFAULT_STATE
  }
}

function useLocalStorageSync(state: AppState) {
  const stateRef = useRef(state)
  stateRef.current = state

  useEffect(() => {
    let active = true

    queueMicrotask(() => {
      if (!active) return
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateRef.current))
      } catch {
        // localStorage pode estar indisponível — o app continua funcionando em memória
      }
    })

    return () => { active = false }
  }, [state])
}

// ─── Context ───────────────────────────────────────────────────────────────────

interface AppContextValue {
  state:              AppState
  setEnergy:          (level: EnergyLevel) => void
  addTask:            (texto: string, prioridade?: Prioridade) => void
  toggleTask:         (id: string) => void
  removeTask:         (id: string) => void
  setTimer:           (update: Partial<ActiveTimer>) => void
  changeMode:         (mode: TimerMode) => void
  resetTimer:         () => void
  incrementSessions:  () => void
  updateSettings:     (update: Partial<Settings>) => void
  toggleHabito:       (id: string) => void
  updateHabito:       (id: string, fields: Partial<Omit<Habito, 'id' | 'feito'>>) => void
  addHabito:          (texto: string, meta?: string) => void
  removeHabito:       (id: string) => void
  DURACOES:           Record<TimerMode, number>
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, undefined, getInitialState)

  useLocalStorageSync(state)

  const value: AppContextValue = {
    state,
    DURACOES:           state.settings.duracoes,
    setEnergy:          (level)       => dispatch({ type: 'SET_ENERGY',       payload: level }),
    addTask:            (texto, prio) => dispatch({ type: 'ADD_TASK',         payload: { texto, prioridade: prio ?? 'Média' } }),
    toggleTask:         (id)          => dispatch({ type: 'TOGGLE_TASK',      payload: id }),
    removeTask:         (id)          => dispatch({ type: 'REMOVE_TASK',      payload: id }),
    setTimer:           (update)      => dispatch({ type: 'SET_TIMER',        payload: update }),
    changeMode:         (mode)        => dispatch({ type: 'CHANGE_MODE',      payload: mode }),
    resetTimer:         ()            => dispatch({ type: 'RESET_TIMER' }),
    incrementSessions:  ()            => dispatch({ type: 'INCREMENT_SESSIONS' }),
    updateSettings:     (update)      => dispatch({ type: 'UPDATE_SETTINGS',  payload: update }),
    toggleHabito:       (id)          => dispatch({ type: 'TOGGLE_HABITO',    payload: id }),
    updateHabito:       (id, fields)  => dispatch({ type: 'UPDATE_HABITO',    payload: { id, ...fields } }),
    addHabito:          (texto, meta) => dispatch({ type: 'ADD_HABITO',       payload: { texto, meta } }),
    removeHabito:       (id)          => dispatch({ type: 'REMOVE_HABITO',    payload: id }),
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp deve ser usado dentro de <AppProvider>')
  return ctx
}

export function useTimer() {
  const { state, setTimer, changeMode, resetTimer, DURACOES } = useApp()
  return { timer: state.activeTimer, setTimer, changeMode, resetTimer, DURACOES }
}

export function useTasks() {
  const { state, addTask, toggleTask, removeTask } = useApp()
  return { tasks: state.todayTasks, addTask, toggleTask, removeTask }
}

export function useSettings() {
  const { state, updateSettings } = useApp()
  return { settings: state.settings, updateSettings }
}

export function useHabitos() {
  const { state, toggleHabito, updateHabito, addHabito, removeHabito } = useApp()
  return { habitos: state.dailyHabits, toggleHabito, updateHabito, addHabito, removeHabito }
}
