import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSettings } from '@/context/AppContext'
import type { TimerMode } from '@/context/AppContext'

const COLIBRI_GREEN = '#4f6356'

const LIMITES_MODO: Record<TimerMode, { min: number; max: number }> = {
  leve:    { min: 5,  max: 30  },
  foco:    { min: 10, max: 60  },
  intenso: { min: 20, max: 90  },
}

const LABELS_MODO: Record<TimerMode, string> = {
  leve:    'Leve',
  foco:    'Foco',
  intenso: 'Intenso',
}

export default function ConfiguracoesPage() {
  const navigate = useNavigate()
  const { settings, updateSettings } = useSettings()

  const [nome, setNome]   = useState(settings.nome)
  const [salvo, setSalvo] = useState(false)

  function handleSalvarNome() {
    updateSettings({ nome: nome.trim() })
    setSalvo(true)
    setTimeout(() => setSalvo(false), 2000)
  }

  function handleToggleSom() {
    updateSettings({ somAtivo: !settings.somAtivo })
  }

  function handleDuracao(modo: TimerMode, minutos: number) {
    const { min, max } = LIMITES_MODO[modo]
    const clampado = Math.max(min, Math.min(max, minutos))
    updateSettings({
      duracoes: { ...settings.duracoes, [modo]: clampado * 60 },
    })
  }

  return (
    <div className="max-w-[800px] mx-auto px-container-padding-mobile pt-stack-gap-md pb-32">

      {/* Cabeçalho */}
      <div className="flex items-center gap-3 mb-stack-gap-lg">
        <button
          onClick={() => navigate(-1)}
          aria-label="Voltar"
          className="w-9 h-9 rounded-full flex items-center justify-center bg-surface-container hover:bg-surface-container-high transition-all active:scale-95"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_back</span>
        </button>
        <div>
          <h1 className="font-headline text-headline-lg-mobile font-semibold text-primary">
            Configurações
          </h1>
          <p className="font-body text-secondary text-sm opacity-70">
            Ajuste o Colibri ao seu ritmo
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6">

        {/* ── Seção: Perfil ── */}
        <section>
          <p className="font-body text-xs font-semibold text-secondary opacity-50 uppercase tracking-widest mb-3 px-1">
            Perfil
          </p>
          <div className="bg-surface-container-lowest rounded-2xl soft-shadow p-5">
            <label className="block font-body text-sm font-medium text-on-surface mb-2">
              Como você quer ser chamado?
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={nome}
                onChange={e => setNome(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSalvarNome()}
                placeholder="Seu nome"
                maxLength={30}
                className="flex-1 bg-surface-container rounded-xl px-4 py-2.5 font-body text-sm text-on-surface placeholder:text-outline outline-none focus:ring-2 transition-all"
                style={{ focusRingColor: COLIBRI_GREEN } as React.CSSProperties}
              />
              <button
                onClick={handleSalvarNome}
                disabled={nome.trim() === settings.nome}
                className="px-4 py-2.5 rounded-xl font-body text-sm font-medium transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: COLIBRI_GREEN, color: '#fff' }}
              >
                {salvo ? '✓' : 'Salvar'}
              </button>
            </div>
            <p className="font-body text-xs text-secondary opacity-50 mt-2">
              Aparece no cabeçalho do app
            </p>
          </div>
        </section>

        {/* ── Seção: Som ── */}
        <section>
          <p className="font-body text-xs font-semibold text-secondary opacity-50 uppercase tracking-widest mb-3 px-1">
            Som
          </p>
          <div className="bg-surface-container-lowest rounded-2xl soft-shadow">
            <div className="flex items-center justify-between p-5">
              <div>
                <p className="font-body text-sm font-medium text-on-surface">
                  Acorde de conclusão
                </p>
                <p className="font-body text-xs text-secondary opacity-60 mt-0.5">
                  Toca um acorde suave quando o timer termina
                </p>
              </div>
              {/* Toggle */}
              <button
                role="switch"
                aria-checked={settings.somAtivo}
                onClick={handleToggleSom}
                className="relative w-12 h-6 rounded-full transition-all duration-300 flex-shrink-0 active:scale-95"
                style={{
                  background: settings.somAtivo ? COLIBRI_GREEN : '#c3c8c2',
                }}
              >
                <span
                  className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-300"
                  style={{ left: settings.somAtivo ? '26px' : '2px' }}
                />
              </button>
            </div>
          </div>
        </section>

        {/* ── Seção: Timer ── */}
        <section>
          <p className="font-body text-xs font-semibold text-secondary opacity-50 uppercase tracking-widest mb-3 px-1">
            Duração das sessões
          </p>
          <div className="bg-surface-container-lowest rounded-2xl soft-shadow divide-y divide-outline-variant/20">
            {(['leve', 'foco', 'intenso'] as TimerMode[]).map((modo) => {
              const minutos = Math.round(settings.duracoes[modo] / 60)
              const { min, max } = LIMITES_MODO[modo]
              const progresso = (minutos - min) / (max - min)

              return (
                <div key={modo} className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-body text-sm font-medium text-on-surface">
                      {LABELS_MODO[modo]}
                    </p>
                    <span
                      className="font-headline text-sm font-semibold tabular-nums"
                      style={{ color: COLIBRI_GREEN }}
                    >
                      {minutos} min
                    </span>
                  </div>
                  <input
                    type="range"
                    min={min}
                    max={max}
                    step={5}
                    value={minutos}
                    onChange={e => handleDuracao(modo, Number(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, ${COLIBRI_GREEN} ${progresso * 100}%, #c3c8c2 ${progresso * 100}%)`,
                    }}
                  />
                  <div className="flex justify-between mt-1">
                    <span className="font-body text-[10px] text-secondary opacity-40">{min} min</span>
                    <span className="font-body text-[10px] text-secondary opacity-40">{max} min</span>
                  </div>
                </div>
              )
            })}
          </div>
          <p className="font-body text-xs text-secondary opacity-50 mt-2 px-1">
            As mudanças aplicam na próxima sessão
          </p>
        </section>

      </div>
    </div>
  )
}
