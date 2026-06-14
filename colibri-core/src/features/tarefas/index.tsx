'use client'

import { useState } from 'react'
import { useApp, type Prioridade } from '@/context/AppContext'

const corPrioridade: Record<string, string> = {
  Alta: 'bg-tertiary-container text-on-tertiary-container',
  Média: 'bg-secondary-container text-on-secondary-container',
  Baixa: 'bg-surface-container text-on-surface-variant',
}

export default function TarefasPage() {
  const { state, addTask, toggleTask, removeTask } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [formText, setFormText] = useState('')
  const [formPrioridade, setFormPrioridade] = useState<Prioridade>('Média')

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formText.trim()) return

    addTask(formText, formPrioridade)
    setFormText('')
    setFormPrioridade('Média')
    setShowForm(false)
  }

  const isFull = state.todayTasks.length >= 5

  return (
    <div className="max-w-[800px] mx-auto px-container-padding-mobile py-stack-gap-md pb-32">
      <section className="mb-stack-gap-lg">
        <h1 className="font-headline text-headline-xl text-primary mb-2">Tarefas</h1>
        <p className="font-body text-body-md text-secondary">
          Uma coisa de cada vez. Você consegue.
        </p>
        {isFull && (
          <p className="font-body text-body-md text-secondary mt-2">
            Máximo de 5 tarefas atingido. Complete algumas para adicionar mais.
          </p>
        )}
      </section>

      {state.todayTasks.length === 0 && !showForm ? (
        <div className="text-center py-12">
          <p className="font-body text-body-md text-secondary mb-4">
            Nenhuma tarefa ainda. Vamos começar?
          </p>
        </div>
      ) : (
        <div className="space-y-stack-gap-sm mb-stack-gap-lg">
          {state.todayTasks.map(t => (
            <div
              key={t.id}
              className={`bento-card bg-surface-container-lowest rounded-lg p-5 soft-shadow flex items-center gap-4 transition-opacity ${
                t.feita ? 'opacity-50' : ''
              }`}
            >
              <button
                onClick={() => toggleTask(t.id)}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  t.feita
                    ? 'bg-primary border-primary'
                    : 'border-primary-container hover:bg-primary-container'
                }`}
                aria-label={t.feita ? 'Marcar como pendente' : 'Marcar como feita'}
              >
                {t.feita && (
                  <span className="material-symbols-outlined text-on-primary" style={{ fontSize: '14px' }}>
                    check
                  </span>
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p
                  className={`font-body text-body-md ${
                    t.feita ? 'line-through text-secondary' : 'text-on-surface'
                  }`}
                >
                  {t.texto}
                </p>
              </div>
              <span className={`font-body text-label-md px-3 py-1 rounded-full flex-shrink-0 ${corPrioridade[t.prioridade]}`}>
                {t.prioridade}
              </span>
              <button
                onClick={() => removeTask(t.id)}
                className="w-6 h-6 rounded-full flex items-center justify-center text-secondary hover:text-on-surface-variant transition-colors flex-shrink-0"
                aria-label="Remover tarefa"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  close
                </span>
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleAddTask} className="mb-stack-gap-lg space-y-3">
          <input
            type="text"
            value={formText}
            onChange={e => setFormText(e.target.value)}
            placeholder="O que você precisa fazer?"
            className="w-full bg-surface-container rounded-lg px-4 py-3 font-body text-body-md text-on-surface placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
            autoFocus
          />
          <div className="flex gap-3">
            <select
              value={formPrioridade}
              onChange={e => setFormPrioridade(e.target.value as Prioridade)}
              className="flex-1 bg-surface-container rounded-lg px-4 py-3 font-body text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option>Alta</option>
              <option>Média</option>
              <option>Baixa</option>
            </select>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-3 rounded-lg bg-surface-container text-secondary hover:bg-surface-container-high transition-colors font-body text-label-md"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!formText.trim()}
              className="px-4 py-3 rounded-lg bg-primary text-on-primary hover:opacity-90 disabled:opacity-50 transition-opacity font-body text-label-md font-semibold"
            >
              Adicionar
            </button>
          </div>
        </form>
      )}

      {!showForm && !isFull && (
        <button
          onClick={() => setShowForm(true)}
          className="mt-stack-gap-lg flex items-center gap-2 text-primary font-body text-label-md hover:opacity-70 transition-opacity"
        >
          <span className="material-symbols-outlined">add</span>
          Nova tarefa
        </button>
      )}
    </div>
  )
}
