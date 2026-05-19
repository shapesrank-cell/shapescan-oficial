"use client";

import { useState, useTransition } from "react";

export function BotaoExportar({
  actionFn,
  icon,
  label,
  filename,
}: {
  actionFn: () => Promise<{ csv?: string; erro?: string }>;
  icon: React.ReactNode;
  label: string;
  filename: string;
}) {
  const [carregando, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  function handleClick() {
    setErro(null);
    startTransition(async () => {
      const r = await actionFn();
      if (r.erro) {
        setErro(r.erro);
        return;
      }
      if (!r.csv) return;
      const blob = new Blob([r.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={carregando}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.12] text-sm text-white/70 hover:text-white hover:border-white/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {icon}
        {carregando ? "Exportando..." : label}
      </button>
      {erro && <span className="text-[10px] text-red-400">{erro}</span>}
    </div>
  );
}
