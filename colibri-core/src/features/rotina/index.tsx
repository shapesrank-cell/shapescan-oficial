import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHabitos, type Habito } from '@/context/AppContext'

// Sugestões TDAH-friendly organizadas por categoria
const SUGESTOES = [
  { categoria: 'Corpo',   texto: 'Hidratação',           meta: '2L de água por dia' },
  { categoria: 'Corpo',   texto: 'Tomar remédio',        meta: 'No horário certo' },
  { categoria: 'Corpo',   texto: 'Alongamento',          meta: '5 minutos ao acordar' },
  { categoria: 'Corpo',   texto: 'Caminhada',            meta: '15 minutos ao ar livre' },
  { categoria: 'Mente',   texto: 'Gratidão',             meta: '3 coisas boas do dia' },
  { categoria: 'Mente',   texto: 'Meditação',            meta: '5 minutos de respiração' },
  { categoria: 'Mente',   texto: 'Diário',               meta: 'Uma entrada por dia' },
  { categoria: 'Mente',   texto: 'Leitura',              meta: '10 minutos antes de dormir' },
  { categoria: 'Rotina',  texto: 'Planejar o dia',       meta: '3 prioridades do dia' },
  { categoria: 'Rotina',  texto: 'Revisar tarefas',      meta: 'Ao final do expediente' },
  { categoria: 'Rotina',  texto: 'Pausa ativa',          meta: 'A cada 1h de foco' },
  { categoria: 'Rotina',  texto: 'Sem celular de manhã', meta: 'Primeiros 30 min do dia' },
  { categoria: 'Saúde',   texto: 'Dormir no horário',    meta: 'Antes das 23h' },
  { categoria: 'Saúde',   texto: 'Vitaminas',            meta: 'Com o café da manhã' },
  { categoria: 'Saúde',   texto: 'Checar agenda',        meta: 'Início do dia' },
  { categoria: 'Saúde',   texto: 'Jantar leve',          meta: 'Antes das 20h' },
]

const CATEGORIAS = ['Corpo', 'Mente', 'Rotina', 'Saúde'] as const

// ── Card de hábito individual ────────────────────────────────────────────────

interface HabitoCardProps {
  habito:   Habito
  onUpdate: (id: string, fields: Partial<Omit<Habito, 'id' | 'feito'>>) => void
  onRemove: (id: string) => void
  onToggle: (id: string) => void
}

function HabitoCard({ habito, onUpdate, onRemove, onToggle }: HabitoCardProps) {
  const [texto, setTexto] = useState(habito.texto)
  const [meta,  setMeta]  = useState(habito.meta  ?? '')
  const [nota,  setNota]  = useState(habito.nota  ?? '')
  const [confirmDelete, setConfirmDelete] = useState(false)

  function salvarTexto() {
    const t = texto.trim()
    if (t && t !== habito.texto) onUpdate(habito.id, { texto: t })
    else setTexto(habito.texto)
  }

  function salvarMeta() {
    onUpdate(habito.id, { meta: meta.trim() || undefined })
  }

  function salvarNota() {
    onUpdate(habito.id, { nota: nota.trim() || undefined })
  }

  return (
    <div className={`rounded-2xl p-4 soft-shadow transition-all duration-200 ${
      habito.feito ? 'bg-surface-container-low' : 'bg-surface-container-lowest'
    }`}>

      {/* Linha principal: checkbox + nome + lixeira */}
      <div className="flex items-start gap-3">
        <button
          onClick={() => onToggle(habito.id)}
          className={`mt-0.5 w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all duration-200 ${
            habito.feito
              ? 'bg-primary border-primary'
              : 'border-primary-container hover:border-primary'
          }`}
          aria-label={habito.feito ? `Desmarcar ${habito.texto}` : `Marcar ${habito.texto}`}
        >
          {habito.feito && (
            <span className="material-symbols-outlined text-on-primary" style={{ fontSize: 14 }}>check</span>
          )}
        </button>

        <input
          type="text"
          value={texto}
          onChange={e => setTexto(e.target.value)}
          onBlur={salvarTexto}
          onKeyDown={e => e.key === 'Enter' && (e.currentTarget.blur())}
          className={`flex-1 font-body text-sm font-medium bg-transparent outline-none transition-all ${
            habito.feito ? 'line-through text-secondary opacity-60' : 'text-on-surface'
          }`}
          aria-label="Nome do hábito"
        />

        {/* Delete */}
        {confirmDelete ? (
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => onRemove(habito.id)}
              className="font-body text-xs text-error hover:opacity-80 transition-opacity"
            >
              Remover
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="font-body text-xs text-secondary hover:opacity-80 transition-opacity"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="text-outline-variant hover:text-error transition-colors flex-shrink-0"
            aria-label={`Remover ${habito.texto}`}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete_outline</span>
          </button>
        )}
      </div>

      {/* Campos extras */}
      <div className="ml-9 mt-3 space-y-3">

        {/* Meta */}
        <div>
          <label className="flex items-center gap-1 font-body text-xs text-secondary uppercase tracking-widest mb-1">
            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>flag</span>
            Meta
          </label>
          <input
            type="text"
            value={meta}
            onChange={e => setMeta(e.target.value)}
            onBlur={salvarMeta}
            onKeyDown={e => e.key === 'Enter' && e.currentTarget.blur()}
            placeholder="Ex: 2L de água por dia"
            className="w-full font-body text-sm text-on-surface-variant bg-transparent outline-none border-b border-outline-variant/30 pb-1 placeholder:text-outline-variant/50 focus:border-primary transition-colors"
          />
        </div>

        {/* Nota do dia */}
        <div>
          <label className="flex items-center gap-1 font-body text-xs text-secondary uppercase tracking-widest mb-1">
            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>edit_note</span>
            Nota de hoje
          </label>
          <input
            type="text"
            value={nota}
            onChange={e => setNota(e.target.value)}
            onBlur={salvarNota}
            onKeyDown={e => e.key === 'Enter' && e.currentTarget.blur()}
            placeholder="Como foi? (opcional)"
            className="w-full font-body text-sm text-on-surface-variant bg-transparent outline-none border-b border-outline-variant/30 pb-1 placeholder:text-outline-variant/50 focus:border-tertiary transition-colors"
          />
        </div>
      </div>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function RotinaPage() {
  const navigate = useNavigate()
  const { habitos, toggleHabito, updateHabito, addHabito, removeHabito } = useHabitos()

  const [adicionando,    setAdicionando]    = useState(false)
  const [novoTexto,      setNovoTexto]      = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState<string | null>(null)

  const total  = habitos.length
  const feitos = habitos.filter(h => h.feito).length
  const maximo = total >= 5

  const sugestoesFiltradas = categoriaFiltro
    ? SUGESTOES.filter(s => s.categoria === categoriaFiltro)
    : SUGESTOES

  // Filtra sugestões que o usuário já tem
  const textoHabitos = habitos.map(h => h.texto.toLowerCase())
  const sugestoesDisponiveis = sugestoesFiltradas.filter(
    s => !textoHabitos.includes(s.texto.toLowerCase())
  )

  function adicionarCustom() {
    if (!maximo && novoTexto.trim()) {
      addHabito(novoTexto.trim())
      setNovoTexto('')
      setAdicionando(false)
    }
  }

  function adicionarSugestao(texto: string, meta: string) {
    if (!maximo) {
      addHabito(texto, meta)
    }
  }

  return (
    <main className="max-w-[800px] mx-auto px-container-padding-mobile md:px-container-padding-desktop pt-stack-gap-md pb-32">

      {/* Header */}
      <div className="flex items-center gap-3 mb-stack-gap-lg">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors active:scale-95"
          aria-label="Voltar"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h1 className="font-headline text-headline-lg text-primary">Minha Rotina</h1>
          <p className="font-body text-body-sm text-secondary">
            {feitos} de {total} concluído{feitos !== 1 ? 's' : ''} hoje · máx. 5 hábitos
          </p>
        </div>
      </div>

      {/* Dica de primeiro uso — aparece quando tem menos de 3 hábitos */}
      {total < 3 && (
        <div className="mb-stack-gap-md p-4 rounded-2xl bg-tertiary-container/20 border border-tertiary-container/40">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-tertiary flex-shrink-0" style={{ fontSize: 20 }}>
              waving_hand
            </span>
            <div>
              <p className="font-body text-sm text-on-surface font-medium mb-1">
                Comece pequeno — isso é TDAH-friendly.
              </p>
              <p className="font-body text-xs text-secondary leading-relaxed">
                Escolha 1 a 3 hábitos que já fazem parte da sua vida.
                Pequenos passos repetidos criam rotinas reais.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Lista de hábitos */}
      <div className="space-y-stack-gap-sm mb-stack-gap-lg">
        {habitos.map(h => (
          <HabitoCard
            key={h.id}
            habito={h}
            onUpdate={updateHabito}
            onRemove={removeHabito}
            onToggle={toggleHabito}
          />
        ))}

        {habitos.length === 0 && (
          <div className="text-center py-10 text-secondary">
            <span className="material-symbols-outlined block mb-2" style={{ fontSize: 40 }}>
              self_improvement
            </span>
            <p className="font-body text-body-md">Nenhum hábito ainda.</p>
            <p className="font-body text-body-sm opacity-70">Use as sugestões abaixo para começar.</p>
          </div>
        )}
      </div>

      {/* Adicionar hábito */}
      {!maximo ? (
        <div className="mb-stack-gap-lg">
          {adicionando ? (
            <div className="bg-surface-container-lowest rounded-2xl p-4 soft-shadow">
              <p className="font-body text-xs text-secondary uppercase tracking-widest mb-3">
                Nome do novo hábito
              </p>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={novoTexto}
                  onChange={e => setNovoTexto(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && adicionarCustom()}
                  placeholder="Ex: Tomar vitamina D"
                  autoFocus
                  className="flex-1 bg-surface rounded-xl px-4 py-2.5 font-body text-sm text-on-surface outline-none border border-outline-variant/30 focus:border-primary transition-colors"
                />
                <button
                  onClick={adicionarCustom}
                  disabled={!novoTexto.trim()}
                  className="px-4 py-2.5 bg-primary text-on-primary rounded-xl font-body text-sm disabled:opacity-40 hover:opacity-90 active:scale-95 transition-all"
                >
                  Adicionar
                </button>
              </div>

              {/* Sugestões */}
              <div>
                <p className="font-body text-xs text-secondary uppercase tracking-widest mb-3">
                  Sugestões para começar
                </p>

                {/* Filtro por categoria */}
                <div className="flex gap-2 mb-3 flex-wrap">
                  <button
                    onClick={() => setCategoriaFiltro(null)}
                    className={`px-3 py-1 rounded-full font-body text-xs transition-colors ${
                      categoriaFiltro === null
                        ? 'bg-primary text-on-primary'
                        : 'bg-surface-container text-secondary hover:bg-surface-container-low'
                    }`}
                  >
                    Todas
                  </button>
                  {CATEGORIAS.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCategoriaFiltro(c => c === cat ? null : cat)}
                      className={`px-3 py-1 rounded-full font-body text-xs transition-colors ${
                        categoriaFiltro === cat
                          ? 'bg-primary text-on-primary'
                          : 'bg-surface-container text-secondary hover:bg-surface-container-low'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Grid de sugestões */}
                {sugestoesDisponiveis.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {sugestoesDisponiveis.map(s => (
                      <button
                        key={s.texto}
                        onClick={() => adicionarSugestao(s.texto, s.meta)}
                        className="text-left p-3 rounded-xl bg-surface hover:bg-surface-container-low transition-colors border border-outline-variant/20 hover:border-primary/30 group"
                      >
                        <span className="block font-body text-sm text-on-surface group-hover:text-primary transition-colors">
                          {s.texto}
                        </span>
                        <span className="block font-body text-xs text-secondary opacity-70 mt-0.5">
                          {s.meta}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="font-body text-sm text-secondary text-center py-4">
                    Todas as sugestões dessa categoria já estão na sua lista.
                  </p>
                )}
              </div>

              <button
                onClick={() => { setAdicionando(false); setNovoTexto('') }}
                className="mt-4 w-full py-2 font-body text-sm text-secondary hover:text-on-surface transition-colors"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAdicionando(true)}
              className="w-full py-3 rounded-2xl border-2 border-dashed border-primary-container text-primary font-body text-sm hover:bg-primary-container/20 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
              Adicionar hábito
            </button>
          )}
        </div>
      ) : (
        <div className="mb-stack-gap-lg p-4 rounded-2xl bg-surface-container text-center">
          <span className="material-symbols-outlined text-primary mb-1 block" style={{ fontSize: 24 }}>
            check_circle
          </span>
          <p className="font-body text-sm text-on-surface font-medium">5 hábitos configurados</p>
          <p className="font-body text-xs text-secondary mt-1">
            Limite atingido — foco é tudo no TDAH. Remove um para adicionar outro.
          </p>
        </div>
      )}

    </main>
  )
}
