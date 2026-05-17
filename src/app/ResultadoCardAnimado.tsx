'use client'

import { useEffect, useState } from 'react'
import { Dumbbell } from 'lucide-react'

const CENARIOS = [
  { biotipo: "Mesomorfo",     imc: "22.4", objetivo: "Hipertrofia",    progresso: 94, tempo: "1 min 43 seg" },
  { biotipo: "Ectomorfo",     imc: "18.9", objetivo: "Ganho de massa", progresso: 89, tempo: "2 min 11 seg" },
  { biotipo: "Endomorfo",     imc: "28.1", objetivo: "Emagrecimento",  progresso: 97, tempo: "1 min 58 seg" },
  { biotipo: "Biotipo misto", imc: "24.7", objetivo: "Definição",      progresso: 91, tempo: "2 min 05 seg" },
]

export default function ResultadoCardAnimado() {
  const [idx, setIdx] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIdx(i => (i + 1) % CENARIOS.length)
        setVisible(true)
      }, 350)
    }, 3200)
    return () => clearInterval(timer)
  }, [])

  const c = CENARIOS[idx]

  return (
    <div
      className={`w-full p-5 rounded-2xl bg-white/[0.18] backdrop-blur-2xl border border-white/30 shadow-2xl transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-orange-400/20 border border-orange-400/30 flex items-center justify-center shrink-0">
          <Dumbbell size={18} className="text-orange-400" />
        </div>
        <div>
          <p className="text-white text-sm font-bold leading-none">Análise concluída</p>
          <p className="text-white/50 text-xs mt-1">em {c.tempo}</p>
        </div>
      </div>

      {/* Dados */}
      <div className="space-y-3">
        <div>
          <p className="text-white/60 text-[11px] uppercase tracking-wider mb-1">Biotipo identificado</p>
          <p className="text-white font-black text-xl">{c.biotipo}</p>
        </div>

        <div className="flex gap-6">
          <div>
            <p className="text-white/60 text-[11px] uppercase tracking-wider mb-1">IMC</p>
            <p className="text-white font-black text-lg">{c.imc}</p>
          </div>
          <div>
            <p className="text-white/60 text-[11px] uppercase tracking-wider mb-1">Objetivo</p>
            <p className="text-white font-black text-lg">{c.objetivo}</p>
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="pt-3 border-t border-white/10">
          <div className="flex items-center justify-between mb-2">
            <p className="text-orange-400 text-sm font-bold">Plano pronto</p>
            <span className="text-orange-400 text-sm font-bold">{c.progresso}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-500 to-orange-300 transition-all duration-500"
              style={{ width: `${c.progresso}%` }}
            />
          </div>
        </div>
      </div>

      {/* Dots indicadores */}
      <div className="flex justify-center gap-1.5 mt-4">
        {CENARIOS.map((_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all duration-300 ${
              i === idx ? 'w-4 bg-orange-400' : 'w-1 bg-white/20'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
