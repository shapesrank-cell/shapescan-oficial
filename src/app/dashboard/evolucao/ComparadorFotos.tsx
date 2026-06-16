"use client";

import { useState } from "react";

export type FotoCheckin = {
  id: string;
  dataLabel: string;
  fotoUrl: string;
  peso: number;
};

export function ComparadorFotos({ fotos }: { fotos: FotoCheckin[] }) {
  // fotos chega em ordem cronológica (mais antiga → mais nova)
  const [antesId, setAntesId] = useState(fotos[0].id);
  const [depoisId, setDepoisId] = useState(fotos[fotos.length - 1].id);

  const antes = fotos.find((f) => f.id === antesId) ?? fotos[0];
  const depois =
    fotos.find((f) => f.id === depoisId) ?? fotos[fotos.length - 1];

  const deltaPeso = depois.peso - antes.peso;
  const deltaTxt =
    deltaPeso === 0
      ? "Mesmo peso"
      : `${deltaPeso > 0 ? "+" : ""}${deltaPeso.toFixed(1)} kg`;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <FotoLado
          titulo="Antes"
          foto={antes}
          opcoes={fotos}
          valor={antesId}
          onChange={setAntesId}
        />
        <FotoLado
          titulo="Depois"
          foto={depois}
          opcoes={fotos}
          valor={depoisId}
          onChange={setDepoisId}
          destaque
        />
      </div>

      <div className="flex items-center justify-center">
        <span
          className={`text-sm font-semibold px-4 py-2 rounded-full border ${
            deltaPeso < 0
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
              : deltaPeso > 0
                ? "bg-orange-400/10 text-orange-400 border-orange-400/25"
                : "bg-white/[0.05] text-white/60 border-white/15"
          }`}
        >
          Variação de peso entre as fotos: {deltaTxt}
        </span>
      </div>
    </div>
  );
}

function FotoLado({
  titulo,
  foto,
  opcoes,
  valor,
  onChange,
  destaque,
}: {
  titulo: string;
  foto: FotoCheckin;
  opcoes: FotoCheckin[];
  valor: string;
  onChange: (id: string) => void;
  destaque?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span
        className={`text-[11px] uppercase tracking-wider font-bold ${
          destaque ? "text-orange-400" : "text-white/50"
        }`}
      >
        {titulo}
      </span>
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-white/[0.12] bg-black/30">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={foto.fotoUrl}
          alt={`Foto de ${foto.dataLabel}`}
          className="h-full w-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2.5">
          <span className="text-xs font-semibold text-white">
            {foto.peso.toFixed(1)} kg
          </span>
        </div>
      </div>
      <select
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-9 px-2 rounded-lg bg-white/[0.05] border border-white/[0.12] text-xs text-white focus:border-orange-400/50 focus:outline-none transition-colors"
      >
        {opcoes.map((o) => (
          <option key={o.id} value={o.id} className="bg-[#1a1a1a]">
            {o.dataLabel}
          </option>
        ))}
      </select>
    </div>
  );
}
