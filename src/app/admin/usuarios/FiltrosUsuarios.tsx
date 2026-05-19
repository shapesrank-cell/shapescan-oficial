"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Search, X } from "lucide-react";

export function FiltrosUsuarios() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pendingTransition, startTransition] = useTransition();

  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const role = searchParams.get("role") ?? "";
  const status = searchParams.get("status") ?? "";
  const sort = searchParams.get("sort") ?? "recent";

  // Debounce da busca (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (q) params.set("q", q);
      else params.delete("q");
      params.delete("page"); // reset paginação ao buscar
      startTransition(() => {
        router.replace(`/admin/usuarios?${params.toString()}`);
      });
    }, 300);
    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    startTransition(() => {
      router.replace(`/admin/usuarios?${params.toString()}`);
    });
  }

  function limparTudo() {
    setQ("");
    startTransition(() => {
      router.replace("/admin/usuarios");
    });
  }

  const temFiltros = q || role || status || sort !== "recent";

  return (
    <div className="flex flex-col gap-3">
      {/* Linha 1: busca */}
      <div className="relative">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
        />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nome ou email..."
          className="w-full h-11 pl-10 pr-10 rounded-xl bg-white/[0.04] border border-white/[0.10] text-white placeholder:text-white/30 focus:outline-none focus:border-orange-400/50 transition-colors"
        />
        {q && (
          <button
            type="button"
            onClick={() => setQ("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Linha 2: filtros */}
      <div className="flex flex-wrap items-center gap-2">
        <FilterSelect
          label="Role"
          value={role}
          onChange={(v) => updateParam("role", v)}
          options={[
            { value: "", label: "Todos" },
            { value: "user", label: "Usuário" },
            { value: "workspace_admin", label: "Admin Workspace" },
            { value: "super_admin", label: "Super Admin" },
          ]}
        />
        <FilterSelect
          label="Status"
          value={status}
          onChange={(v) => updateParam("status", v)}
          options={[
            { value: "", label: "Todos" },
            { value: "active", label: "Ativo" },
            { value: "suspended", label: "Suspenso" },
          ]}
        />
        <FilterSelect
          label="Ordenar"
          value={sort}
          onChange={(v) => updateParam("sort", v)}
          options={[
            { value: "recent", label: "Mais recente" },
            { value: "old", label: "Mais antigo" },
            { value: "alpha", label: "A-Z" },
          ]}
        />

        {temFiltros && (
          <button
            type="button"
            onClick={limparTudo}
            className="ml-auto text-xs text-white/40 hover:text-white flex items-center gap-1 px-3 py-1.5 rounded-full hover:bg-white/[0.04]"
          >
            <X size={12} /> Limpar
          </button>
        )}

        {pendingTransition && (
          <span className="text-xs text-white/30 animate-pulse">
            Atualizando...
          </span>
        )}
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="inline-flex items-center gap-2 text-xs text-white/40 px-3 py-1.5 rounded-full border border-white/[0.10] bg-white/[0.03] hover:border-white/20 transition-colors cursor-pointer">
      <span>{label}:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-white font-medium outline-none cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-[#1a1a1a]">
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
