// Skeleton base — blocos cinzas animados que espelham o layout real de cada tela
// Animação colibri-pulse: suave e lenta, respeitando o ritmo do usuário com TDAH

import type { ReactNode } from 'react'

interface BlockProps {
  className?: string
  style?: React.CSSProperties
  children?: ReactNode
}

function Bone({ className = '', style, children }: BlockProps) {
  return (
    <div
      className={`animate-colibri-pulse bg-surface-container rounded-lg ${className}`}
      style={style}
    >
      {children}
    </div>
  )
}

function Circle({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-colibri-pulse bg-surface-container rounded-full ${className}`} />
  )
}

function TextLine({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-colibri-pulse bg-surface-container rounded-full h-3 ${className}`} />
  )
}

// ─── Esqueleto da Home (bento grid: anel circular + cards + lista + barras) ──

export function FocoSkeleton() {
  return (
    <div className="max-w-[800px] mx-auto px-container-padding-mobile md:px-container-padding-desktop pb-32 pt-stack-gap-md">
      {/* Saudação */}
      <div className="mb-stack-gap-lg space-y-3">
        <Bone className="h-10 w-64" />
        <TextLine className="w-80" />
      </div>

      {/* Bento grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-gap-md">
        {/* Anel de progresso */}
        <Bone className="p-stack-gap-md soft-shadow flex flex-col items-center justify-center gap-3 py-10">
          <Circle className="w-44 h-44" />
          <TextLine className="w-32" />
        </Bone>

        {/* Card de sessão */}
        <Bone className="p-stack-gap-md soft-shadow flex flex-col justify-between gap-4 py-8">
          <Circle className="w-8 h-8" />
          <div className="space-y-2">
            <TextLine className="w-3/4 h-5" />
            <TextLine className="w-full" />
            <TextLine className="w-5/6" />
          </div>
          <Bone className="h-12 rounded-full" />
        </Bone>

        {/* Lista de tarefas */}
        <Bone className="md:col-span-2 p-stack-gap-md soft-shadow space-y-stack-gap-sm">
          <div className="flex justify-between items-center mb-2">
            <TextLine className="w-32 h-5" />
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-surface rounded-lg">
              <Circle className="w-6 h-6 flex-shrink-0" />
              <TextLine className={`flex-1 ${i === 2 ? 'w-3/4' : 'w-full'}`} />
            </div>
          ))}
        </Bone>

        {/* Gráfico de consistência */}
        <Bone className="p-stack-gap-md soft-shadow">
          <TextLine className="w-24 mb-4" />
          <div className="flex items-end gap-2 h-20">
            {[40, 60, 30, 80, 55, 95, 10].map((h, i) => (
              <Bone key={i} className="flex-1 rounded-t-full" style={{ height: `${h}%`, borderRadius: '9999px 9999px 0 0' }} />
            ))}
          </div>
          <TextLine className="w-3/4 mt-4" />
        </Bone>

        {/* Citação */}
        <Bone className="p-stack-gap-md soft-shadow space-y-3">
          <Circle className="w-6 h-6" />
          <TextLine className="w-full" />
          <TextLine className="w-5/6" />
          <TextLine className="w-1/3 mt-2" />
        </Bone>
      </div>
    </div>
  )
}

// ─── Esqueleto da tela Tarefas (lista de cards) ───────────────────────────────

export function TarefasSkeleton() {
  return (
    <div className="max-w-[800px] mx-auto px-container-padding-mobile py-stack-gap-md pb-32">
      <div className="mb-stack-gap-lg space-y-3">
        <Bone className="h-8 w-48" />
        <TextLine className="w-56" />
      </div>
      <div className="space-y-stack-gap-sm">
        {[1, 2, 3, 4, 5].map((i) => (
          <Bone key={i} className="p-5 soft-shadow flex items-center gap-4">
            <Circle className="w-6 h-6 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <TextLine className={i % 2 === 0 ? 'w-3/4' : 'w-full'} />
              <TextLine className="w-1/3 h-2" />
            </div>
          </Bone>
        ))}
      </div>
    </div>
  )
}

// ─── Esqueleto da tela Timer (círculo grande + controles) ────────────────────

export function TimerSkeleton() {
  return (
    <div className="max-w-[800px] mx-auto px-container-padding-mobile py-stack-gap-md pb-32 flex flex-col items-center">
      <div className="mb-stack-gap-lg text-center space-y-3 w-full">
        <Bone className="h-8 w-32 mx-auto" />
        <TextLine className="w-48 mx-auto" />
      </div>

      {/* Grande anel do timer */}
      <Circle className="w-64 h-64 mb-stack-gap-lg" />

      {/* Botões de controle */}
      <div className="flex gap-4">
        <Bone className="w-14 h-14 rounded-full" />
        <Bone className="w-20 h-14 rounded-full" />
        <Bone className="w-14 h-14 rounded-full" />
      </div>

      {/* Chips de modo */}
      <div className="flex gap-3 mt-stack-gap-lg">
        {[64, 80, 72].map((w, i) => (
          <Bone key={i} className="h-8 rounded-full" style={{ width: w }} />
        ))}
      </div>
    </div>
  )
}

// ─── Esqueleto da tela Configurações ─────────────────────────────────────────

export function ConfiguracoesSkeleton() {
  return (
    <div className="max-w-[800px] mx-auto px-container-padding-mobile pt-stack-gap-md pb-32">
      <div className="flex items-center gap-3 mb-stack-gap-lg">
        <Circle className="w-9 h-9" />
        <div className="space-y-2">
          <Bone className="h-7 w-40" />
          <TextLine className="w-32" />
        </div>
      </div>
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <div key={i}>
            <TextLine className="w-16 mb-3" />
            <Bone className="rounded-2xl p-5 soft-shadow space-y-3">
              <TextLine className="w-1/2" />
              <TextLine className="w-full h-2 rounded-full" />
            </Bone>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Esqueleto da tela Rotina ─────────────────────────────────────────────────

export function RotinaSkeleton() {
  return (
    <div className="max-w-[800px] mx-auto px-container-padding-mobile pt-stack-gap-md pb-32">
      <div className="flex items-center gap-3 mb-stack-gap-lg">
        <Bone className="w-9 h-9 rounded-full" />
        <div className="space-y-2">
          <Bone className="h-7 w-36" />
          <TextLine className="w-48" />
        </div>
      </div>
      <div className="space-y-stack-gap-sm">
        {[1, 2, 3].map(i => (
          <Bone key={i} className="rounded-2xl p-4 soft-shadow space-y-3">
            <div className="flex items-center gap-3">
              <Circle className="w-6 h-6 flex-shrink-0" />
              <TextLine className="flex-1 h-4" />
            </div>
            <div className="ml-9 space-y-3">
              <div>
                <TextLine className="w-8 h-2 mb-2" />
                <TextLine className="w-3/4" />
              </div>
              <div>
                <TextLine className="w-12 h-2 mb-2" />
                <TextLine className="w-2/3" />
              </div>
            </div>
          </Bone>
        ))}
      </div>
    </div>
  )
}

// ─── Esqueleto da tela Chat (bolhas de mensagem alternadas) ──────────────────

export function ChatSkeleton() {
  const bubbles = [
    { align: 'right', widths: ['w-48', 'w-36'] },
    { align: 'left',  widths: ['w-64', 'w-56', 'w-40'] },
    { align: 'right', widths: ['w-52'] },
    { align: 'left',  widths: ['w-60', 'w-44'] },
  ] as const

  return (
    <div className="max-w-[800px] mx-auto px-container-padding-mobile py-stack-gap-md pb-32 flex flex-col gap-stack-gap-md">
      {bubbles.map((b, i) => (
        <div key={i} className={`flex flex-col gap-1 ${b.align === 'right' ? 'items-end' : 'items-start'}`}>
          {b.widths.map((w, j) => (
            <Bone key={j} className={`h-10 ${w} ${b.align === 'right' ? 'rounded-tl-lg rounded-bl-lg rounded-br-lg rounded-tr-sm' : 'rounded-tr-lg rounded-br-lg rounded-bl-lg rounded-tl-sm'}`} style={{ animationDelay: `${(i * 0.15 + j * 0.08)}s` }} />
          ))}
        </div>
      ))}

      {/* Input de mensagem */}
      <div className="fixed bottom-20 left-0 right-0 px-container-padding-mobile max-w-[800px] mx-auto">
        <Bone className="h-14 rounded-full" />
      </div>
    </div>
  )
}
