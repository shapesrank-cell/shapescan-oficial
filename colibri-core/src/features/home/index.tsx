import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSettings, useHabitos } from '@/context/AppContext'

const CIRCUNFERENCIA = 2 * Math.PI * 45 // 282.7

export default function HomePage() {
  const navigate = useNavigate()
  const { settings } = useSettings()
  const { habitos, toggleHabito } = useHabitos()

  const [expandido, setExpandido] = useState(false)

  const saudacao = settings.nome.trim() ? `Olá, ${settings.nome.trim()}.` : 'Olá, gentileza.'

  const feitos    = habitos.filter(h => h.feito).length
  const total     = habitos.length
  const progresso = total > 0 ? Math.round((feitos / total) * 100) : 0
  const offset    = CIRCUNFERENCIA - (progresso / 100) * CIRCUNFERENCIA

  return (
    <main className="max-w-[800px] mx-auto px-container-padding-mobile md:px-container-padding-desktop pb-32 pt-stack-gap-md">

      {/* Saudação */}
      <section className="mb-stack-gap-lg">
        <h1 className="font-headline text-headline-xl text-primary mb-2">
          {saudacao}
        </h1>
        <p className="font-body text-body-lg text-secondary">
          Respira fundo. Seu dia se constrói em pequenos passos.
        </p>
      </section>

      {/* Bento grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-gap-md">

        {/* ── Progresso circular — Rotina ── */}
        <div className="bg-surface-container-lowest rounded-lg p-stack-gap-md soft-shadow flex flex-col items-center">

          {/* Anel + percentual */}
          <button
            onClick={() => setExpandido(e => !e)}
            className="flex flex-col items-center w-full active:scale-95 transition-transform duration-200"
            aria-label={expandido ? 'Fechar hábitos' : 'Ver hábitos'}
          >
            <div className="relative w-44 h-44 mb-stack-gap-sm">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  className="text-surface-container"
                  cx="50" cy="50" r="45"
                  fill="transparent" stroke="currentColor" strokeWidth="8"
                />
                <circle
                  className="text-primary-container"
                  cx="50" cy="50" r="45"
                  fill="transparent" stroke="currentColor" strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={CIRCUNFERENCIA}
                  strokeDashoffset={offset}
                  style={{
                    transform: 'rotate(-90deg)',
                    transformOrigin: '50% 50%',
                    transition: 'stroke-dashoffset 0.8s ease-in-out',
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-headline text-headline-lg text-primary">{progresso}%</span>
                <span className="font-body text-label-md text-secondary">Rotina</span>
              </div>
            </div>
            <p className="font-body text-body-md text-on-surface-variant">
              {feitos} de {total} hábito{total !== 1 ? 's' : ''} feito{feitos !== 1 ? 's' : ''} hoje
            </p>
            <span
              className="material-symbols-outlined text-secondary mt-2 transition-transform duration-300"
              style={{ fontSize: 18, transform: expandido ? 'rotate(180deg)' : 'rotate(0deg)' }}
            >
              expand_more
            </span>
          </button>

          {/* Lista de hábitos (expande/contrai) */}
          {expandido && (
            <div className="w-full mt-4 space-y-2">
              <div className="flex justify-between items-center mb-1">
                <span className="font-body text-xs text-secondary opacity-50 uppercase tracking-widest">
                  Seus hábitos
                </span>
                <button
                  onClick={() => navigate('/rotina')}
                  className="font-body text-xs text-primary hover:opacity-70 transition-opacity flex items-center gap-1"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>tune</span>
                  Gerenciar
                </button>
              </div>

              {habitos.map(h => (
                <div
                  key={h.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-surface hover:bg-surface-container-low transition-colors"
                >
                  <button
                    onClick={() => toggleHabito(h.id)}
                    className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all duration-200 ${
                      h.feito
                        ? 'bg-primary border-primary'
                        : 'border-primary-container hover:border-primary'
                    }`}
                    aria-label={h.feito ? `Desmarcar ${h.texto}` : `Marcar ${h.texto}`}
                  >
                    {h.feito && (
                      <span className="material-symbols-outlined text-on-primary" style={{ fontSize: 14 }}>
                        check
                      </span>
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <span
                      className={`block font-body text-sm transition-all ${
                        h.feito ? 'line-through text-secondary opacity-50' : 'text-on-surface'
                      }`}
                    >
                      {h.texto}
                    </span>
                    {h.meta && (
                      <span className="block font-body text-xs text-secondary opacity-60 truncate">
                        {h.meta}
                      </span>
                    )}
                  </div>

                  {h.nota && (
                    <span className="material-symbols-outlined text-tertiary flex-shrink-0" style={{ fontSize: 14 }}>
                      edit_note
                    </span>
                  )}
                </div>
              ))}

              <button
                onClick={() => navigate('/rotina')}
                className="w-full mt-2 py-2 rounded-xl border border-dashed border-primary-container text-primary font-body text-xs hover:bg-primary-container/30 transition-colors flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>settings</span>
                Configurar hábitos
              </button>
            </div>
          )}
        </div>

        {/* ── Iniciar sessão ── */}
        <div className="bento-card bg-primary-container rounded-lg p-stack-gap-md flex flex-col justify-between items-start soft-shadow">
          <div>
            <span className="material-symbols-outlined text-primary mb-stack-gap-sm" style={{ fontSize: '32px' }}>
              center_focus_strong
            </span>
            <h3 className="font-headline text-headline-lg-mobile text-on-primary-fixed mb-2">
              Pronto para focar?
            </h3>
            <p className="font-body text-body-md text-on-primary-fixed-variant opacity-80">
              Inicie uma sessão de baixa estimulação para limpar sua lista de tarefas.
            </p>
          </div>
          <button
            onClick={() => navigate('/timer')}
            className="mt-6 w-full py-4 bg-primary text-on-primary rounded-full font-body text-label-md hover:opacity-90 active:scale-95 transition-all duration-200"
          >
            Iniciar sessão de foco
          </button>
        </div>

        {/* ── Tarefas em foco ── */}
        <div className="md:col-span-2 bg-surface-container-lowest rounded-lg p-stack-gap-md soft-shadow">
          <div className="flex justify-between items-center mb-stack-gap-md">
            <h2 className="font-headline text-headline-lg-mobile text-primary">Foco atual</h2>
            <span
              className="material-symbols-outlined text-secondary cursor-pointer hover:opacity-70"
              onClick={() => navigate('/tarefas')}
            >
              more_horiz
            </span>
          </div>
          <div className="space-y-stack-gap-sm">
            {['Revisão do planejamento semanal', 'Pausa para hidratação', 'Organizar área de trabalho digital'].map((task, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-surface hover:bg-surface-container-low transition-colors group cursor-pointer">
                <button className="w-6 h-6 rounded-full border-2 border-primary-container flex items-center justify-center group-hover:bg-primary-container transition-all">
                  <span className="material-symbols-outlined text-transparent group-hover:text-primary" style={{ fontSize: '14px' }}>check</span>
                </button>
                <p className="flex-1 font-body text-body-md text-on-surface">{task}</p>
                <span className="material-symbols-outlined text-outline-variant">drag_indicator</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate('/tarefas')}
            className="mt-stack-gap-md flex items-center gap-2 text-primary font-body text-label-md hover:opacity-70 transition-opacity"
          >
            <span className="material-symbols-outlined">add</span>
            Adicionar tarefa
          </button>
        </div>

        {/* ── Consistência ── */}
        <div className="bento-card bg-surface-container-lowest rounded-lg p-stack-gap-md soft-shadow">
          <h3 className="font-body text-label-md text-secondary uppercase tracking-widest mb-4">Consistência</h3>
          <div className="flex items-end gap-2 h-20">
            {[40, 60, 30, 80, 55, 95, 10].map((h, i) => (
              <div
                key={i}
                className={`flex-1 ${i === 5 ? 'bg-primary' : i === 6 ? 'bg-surface-container-high' : 'bg-primary-container'}`}
                style={{ height: `${h}%`, borderRadius: '9999px 9999px 0 0' }}
              />
            ))}
          </div>
          <p className="mt-4 font-body text-body-md text-on-surface">
            Seu foco está 12% acima do de ontem.
          </p>
        </div>

        {/* ── Citação ── */}
        <div className="bento-card bg-surface-container-lowest rounded-lg p-stack-gap-md soft-shadow relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-tertiary-container/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          <span className="material-symbols-outlined text-tertiary mb-4">spa</span>
          <p className="italic font-body text-body-md text-tertiary leading-relaxed relative z-10">
            "A simplicidade é a sofisticação máxima."
          </p>
          <p className="mt-2 font-body text-label-md text-on-tertiary-container relative z-10">
            — Leonardo da Vinci
          </p>
        </div>

      </div>
    </main>
  )
}
