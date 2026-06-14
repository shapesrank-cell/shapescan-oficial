import { useEffect, useRef, useCallback, useState, useMemo } from 'react'
import { useApp, useSettings, type TimerMode } from '@/context/AppContext'

// ─── Constantes de UI ─────────────────────────────────────────────────────────

const MODOS: {
  key: TimerMode
  label: string
  minutos: string
  descricao: string
  contexto: string
  dica: string
}[] = [
  {
    key: 'leve',
    label: 'Leve',
    minutos: '15',
    descricao: 'Dia difícil',
    contexto: 'Para quando a energia está baixa',
    dica: 'Faça uma coisa só. Pode ser pequena.',
  },
  {
    key: 'foco',
    label: 'Foco',
    minutos: '25',
    descricao: 'Padrão',
    contexto: 'O clássico Pomodoro Colibri',
    dica: 'Escolha uma tarefa e mergulhe nela.',
  },
  {
    key: 'intenso',
    label: 'Intenso',
    minutos: '45',
    descricao: 'Fluxo profundo',
    contexto: 'Quando você sentir o hiperfoco chegando',
    dica: 'Silencie notificações. Este é seu momento.',
  },
]

const DICAS_RUNNING: Record<TimerMode, string> = {
  leve: 'Gentileza consigo. Qualquer progresso conta.',
  foco: 'Respire e foque em uma tarefa só.',
  intenso: 'Você está no fluxo. Confie no processo.',
}

const MENSAGENS_CONCLUSAO = [
  'Você conseguiu!',
  'Mais uma. Orgulho.',
  'Seu cérebro agradece.',
  'Consistência é poder.',
]

const MARCOS_SESSAO: Record<number, string> = {
  3: 'Trinca completa!',
  5: 'Cinco sessões! Você está voando.',
  7: 'Sete sessões. Lendário.',
}

const COLIBRI_PURPLE = '#7F77DD'
const RING_RADIUS = 44
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS
const INTRO_KEY = 'colibri:timerIntro'

// ─── Audio ────────────────────────────────────────────────────────────────────

function playRelaxingChord() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const now = ctx.currentTime

    const frequencies = [261.63, 329.63, 392.00, 523.25]

    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.value = freq

      const peakGain = 0.07 / (i + 1)

      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(peakGain, now + 0.2)
      gain.gain.setValueAtTime(peakGain, now + 0.9)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 3)
    })
  } catch {
    // Sem permissão de áudio — silêncio
  }
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function TimerContainer() {
  const { state, setTimer, changeMode, resetTimer, incrementSessions, DURACOES } = useApp()
  const { settings } = useSettings()
  const { activeTimer } = state

  const segundosRef = useRef(activeTimer.segundosRestantes)
  const modeRef     = useRef(activeTimer.mode)
  segundosRef.current = activeTimer.segundosRestantes
  modeRef.current     = activeTimer.mode

  // ─── Welcome card state ───────────────────────────────────────────────────
  const [showIntro, setShowIntro] = useState(() => {
    try { return !localStorage.getItem(INTRO_KEY) } catch { return false }
  })
  const [introVisible, setIntroVisible] = useState(showIntro)

  const dismissIntro = useCallback(() => {
    setIntroVisible(false)
    setTimeout(() => {
      setShowIntro(false)
      try { localStorage.setItem(INTRO_KEY, 'true') } catch { /* noop */ }
    }, 250)
  }, [])

  // ─── Mensagem de conclusão (randomizada por sessão) ───────────────────────
  const mensagemConclusao = useMemo(
    () => MENSAGENS_CONCLUSAO[Math.floor(Math.random() * MENSAGENS_CONCLUSAO.length)],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeTimer.status === 'completed']
  )

  // ─── Recém-completado (pra dica pós-sessão) ──────────────────────────────
  const [recemCompletou, setRecemCompletou] = useState(false)

  // ─── Countdown ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (activeTimer.status !== 'running') return

    const interval = setInterval(() => {
      const novosTempo = segundosRef.current - 1

      if (novosTempo <= 0) {
        clearInterval(interval)
        setTimer({
          status: 'completed',
          segundosRestantes: DURACOES[modeRef.current],
        })
      } else {
        setTimer({ segundosRestantes: novosTempo })
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [activeTimer.status, DURACOES, setTimer])

  // ─── Conclusão: som + increment + volta pra idle ──────────────────────────
  useEffect(() => {
    if (activeTimer.status !== 'completed') return

    if (settings.somAtivo) playRelaxingChord()

    if (activeTimer.mode === 'foco') {
      incrementSessions()
    }

    // Auto-dispensa intro ao completar primeira sessão
    if (showIntro) dismissIntro()

    setRecemCompletou(true)

    const timeout = setTimeout(() => {
      setTimer({ status: 'paused' })
      setTimeout(() => setRecemCompletou(false), 5000)
    }, 3500)
    return () => clearTimeout(timeout)
  }, [activeTimer.status, activeTimer.mode, incrementSessions, setTimer, showIntro, dismissIntro, settings.somAtivo])

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handlePlayPause = useCallback(() => {
    if (activeTimer.status === 'running') {
      setTimer({ status: 'paused' })
    } else {
      setTimer({ status: 'running' })
      if (showIntro) dismissIntro()
    }
  }, [activeTimer.status, setTimer, showIntro, dismissIntro])

  const handleReset = useCallback(() => {
    resetTimer()
    setRecemCompletou(false)
  }, [resetTimer])

  const handleModeChange = useCallback((mode: TimerMode) => {
    changeMode(mode)
    setRecemCompletou(false)
  }, [changeMode])

  // ─── Cálculos visuais ────────────────────────────────────────────────────

  const totalSegundos = DURACOES[activeTimer.mode]
  const progresso = 1 - activeTimer.segundosRestantes / totalSegundos
  const strokeDashoffset = RING_CIRCUMFERENCE * (1 - progresso)

  const mins = Math.floor(activeTimer.segundosRestantes / 60)
  const secs = activeTimer.segundosRestantes % 60
  const timeDisplay = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`

  const isRunning  = activeTimer.status === 'running'
  const isComplete = activeTimer.status === 'completed'
  const isIdle     = activeTimer.status === 'idle'

  const activeModo = MODOS.find(m => m.key === activeTimer.mode)!

  // Texto central abaixo do timer
  const centerSubtext = isComplete
    ? 'Sessão completa'
    : isRunning
      ? activeModo.dica
      : activeModo.dica

  // Texto inferior contextual
  const bottomHint = isComplete
    ? mensagemConclusao
    : isRunning
      ? DICAS_RUNNING[activeTimer.mode]
      : recemCompletou
        ? 'Que tal uma pausa? Ou inicie outra sessão.'
        : activeTimer.status === 'paused'
          ? 'Pausado. Continue quando estiver pronto.'
          : 'Escolha sua sessão e pressione iniciar.'

  // Marco de sessões
  const marcoAtual = MARCOS_SESSAO[activeTimer.sessoes]

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-sm mx-auto select-none">

      {/* ── Welcome card (primeiro uso) ── */}
      {showIntro && (
        <div
          className="w-full rounded-2xl p-5 transition-all duration-250 overflow-hidden"
          style={{
            background: 'rgba(127, 119, 221, 0.06)',
            border: '1.5px solid rgba(127, 119, 221, 0.15)',
            opacity: introVisible ? 1 : 0,
            maxHeight: introVisible ? 200 : 0,
            padding: introVisible ? undefined : '0 20px',
          }}
        >
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined mt-0.5" style={{ color: COLIBRI_PURPLE, fontSize: 22 }}>
              waving_hand
            </span>
            <div className="flex-1">
              <p className="font-headline text-sm font-semibold" style={{ color: COLIBRI_PURPLE }}>
                Sua primeira sessão
              </p>
              <p className="font-body text-xs text-secondary mt-1 leading-relaxed opacity-80">
                Escolha um ritmo que combina com o seu momento. Depois, pressione o botão roxo para começar. Sem regras, sem pressão.
              </p>
              <button
                onClick={dismissIntro}
                className="font-body text-xs font-medium mt-3 transition-opacity hover:opacity-100 opacity-70"
                style={{ color: COLIBRI_PURPLE }}
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Seletor de modo ── */}
      <div className="flex flex-col items-center gap-2 w-full">
        <div className="flex gap-3 w-full">
          {MODOS.map(({ key, label, minutos, descricao }) => {
            const ativo = activeTimer.mode === key
            return (
              <button
                key={key}
                onClick={() => handleModeChange(key)}
                className={`
                  flex-1 flex flex-col items-center py-3 px-2 rounded-2xl
                  transition-all duration-200 active:scale-95
                  ${ativo
                    ? 'shadow-sm'
                    : 'bg-surface-container hover:bg-surface-container-high'
                  }
                `}
                style={ativo ? {
                  background: 'rgba(127, 119, 221, 0.12)',
                  border: '1.5px solid rgba(127, 119, 221, 0.35)',
                } : { border: '1.5px solid transparent' }}
                aria-pressed={ativo}
                aria-label={`Modo ${label}: ${minutos} minutos`}
              >
                <span
                  className="font-headline text-sm font-semibold tracking-wide"
                  style={{ color: ativo ? COLIBRI_PURPLE : undefined }}
                >
                  {label}
                </span>
                <span
                  className="font-body text-xs mt-0.5"
                  style={{ color: ativo ? COLIBRI_PURPLE : undefined, opacity: ativo ? 0.7 : 0.5 }}
                >
                  {minutos} min
                </span>
                <span
                  className="font-body text-[10px] mt-0.5 opacity-50"
                  style={{ color: ativo ? COLIBRI_PURPLE : undefined }}
                >
                  {descricao}
                </span>
              </button>
            )
          })}
        </div>

        {/* Contexto do modo ativo */}
        <p
          className="font-body text-xs text-center text-secondary opacity-50 mt-1 transition-opacity duration-200"
          key={activeTimer.mode}
        >
          {activeModo.contexto}
        </p>
      </div>

      {/* ── Anel circular ── */}
      <div className="relative" style={{ width: 256, height: 256 }}>
        {/* Glow roxo quando rodando */}
        {isRunning && (
          <div
            className="absolute inset-0 rounded-full blur-3xl opacity-20 animate-colibri-pulse pointer-events-none"
            style={{ background: COLIBRI_PURPLE }}
          />
        )}

        <svg
          width="256"
          height="256"
          viewBox="0 0 100 100"
          style={{ transform: 'rotate(-90deg)' }}
          aria-hidden="true"
        >
          {/* Trilha de fundo */}
          <circle
            cx="50" cy="50" r={RING_RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
            className="text-surface-container"
          />

          {/* Arco de progresso */}
          <circle
            cx="50" cy="50" r={RING_RADIUS}
            fill="none"
            stroke={isComplete ? '#A8D5A2' : COLIBRI_PURPLE}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={isIdle ? 0 : strokeDashoffset}
            className={isIdle ? 'animate-ring-breathe' : ''}
            style={{
              transition: isRunning
                ? 'stroke-dashoffset 0.9s linear, stroke 0.4s ease'
                : 'stroke-dashoffset 0.4s ease, stroke 0.4s ease',
              opacity: isComplete ? 1 : isRunning ? 1 : undefined,
            }}
          />
        </svg>

        {/* Conteúdo central */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {isComplete ? (
            <span
              className="font-headline leading-none animate-scale-in"
              style={{ fontSize: 52, fontWeight: 600, color: '#5C9B56' }}
            >
              ✓
            </span>
          ) : (
            <span
              className="font-headline tabular-nums leading-none transition-all duration-300"
              style={{
                fontSize: 52,
                fontWeight: 600,
                color: COLIBRI_PURPLE,
                letterSpacing: '-0.03em',
              }}
            >
              {timeDisplay}
            </span>
          )}

          <span
            className="font-body text-secondary text-center mt-2 text-xs leading-snug transition-all duration-300 px-2"
            style={{ maxWidth: 160 }}
          >
            {centerSubtext}
          </span>

          {/* Contador de sessões / marco / celebração */}
          {isComplete && marcoAtual ? (
            <span className="font-body text-[11px] mt-2 font-medium animate-scale-in" style={{ color: '#5C9B56' }}>
              {marcoAtual}
            </span>
          ) : isComplete && activeTimer.sessoes > 0 ? (
            <span className="font-body text-[11px] mt-2 opacity-60" style={{ color: '#5C9B56' }}>
              {activeTimer.sessoes}ª sessão de foco hoje
            </span>
          ) : activeTimer.sessoes > 0 && !isComplete ? (
            <span className="font-body text-[11px] mt-2 opacity-50" style={{ color: COLIBRI_PURPLE }}>
              {activeTimer.sessoes} {activeTimer.sessoes === 1 ? 'sessão' : 'sessões'} hoje
            </span>
          ) : null}
        </div>
      </div>

      {/* ── Controles com labels ── */}
      <div className="flex items-end gap-6">
        {/* Reset */}
        <button
          onClick={handleReset}
          disabled={isComplete}
          aria-label="Reiniciar timer"
          className="
            w-14 py-2 rounded-2xl flex flex-col items-center justify-center gap-1
            bg-surface-container hover:bg-surface-container-high
            text-on-surface-variant transition-all duration-200 active:scale-90
            disabled:opacity-40 disabled:cursor-not-allowed
          "
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>replay</span>
          <span className="font-body text-[10px] opacity-60">Reiniciar</span>
        </button>

        {/* Play / Pause — botão principal */}
        <button
          onClick={handlePlayPause}
          aria-label={isRunning ? 'Pausar' : 'Iniciar'}
          disabled={isComplete}
          className="
            w-20 py-3 rounded-3xl flex flex-col items-center justify-center gap-1
            transition-all duration-200 active:scale-90
            disabled:opacity-60 disabled:cursor-not-allowed
          "
          style={{
            background: `linear-gradient(135deg, ${COLIBRI_PURPLE}, #9B95E8)`,
            boxShadow: isRunning
              ? `0 0 0 4px rgba(127, 119, 221, 0.2), 0 8px 24px rgba(127, 119, 221, 0.3)`
              : `0 4px 16px rgba(127, 119, 221, 0.25)`,
          }}
        >
          <span
            className="material-symbols-outlined text-white"
            style={{ fontSize: 36 }}
          >
            {isRunning ? 'pause' : 'play_arrow'}
          </span>
          <span className="text-white text-[10px] opacity-80 font-body">
            {isRunning ? 'Pausar' : 'Iniciar'}
          </span>
        </button>

        {/* Parar */}
        <button
          onClick={handleReset}
          disabled={isComplete}
          aria-label="Parar sessão"
          className="
            w-14 py-2 rounded-2xl flex flex-col items-center justify-center gap-1
            bg-surface-container hover:bg-surface-container-high
            text-on-surface-variant transition-all duration-200 active:scale-90
            disabled:opacity-40 disabled:cursor-not-allowed
          "
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>stop</span>
          <span className="font-body text-[10px] opacity-60">Parar</span>
        </button>
      </div>

      {/* ── Dica contextual ── */}
      <p className="font-body text-body-md text-center text-secondary opacity-70 max-w-[260px] leading-relaxed">
        {bottomHint}
      </p>
    </div>
  )
}
