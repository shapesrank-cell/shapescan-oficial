"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { X } from "lucide-react";

export function FiltrosAuditoria() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const action = searchParams.get("action") ?? "";
  const periodo = searchParams.get("periodo") ?? "";

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    startTransition(() => {
      router.replace(`/admin/auditoria?${params.toString()}`);
    });
  }

  function limparTudo() {
    startTransition(() => {
      router.replace("/admin/auditoria");
    });
  }

  const temFiltros = action || periodo;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <FilterSelect
        label="Ação"
        value={action}
        onChange={(v) => updateParam("action", v)}
        options={[
          { value: "", label: "Todas" },
          { value: "user.role_changed", label: "Role alterado" },
          { value: "user.suspended", label: "Usuário suspenso" },
          { value: "user.reactivated", label: "Usuário reativado" },
          { value: "user.deleted", label: "Usuário deletado" },
          { value: "analysis.deleted", label: "Análise deletada" },
          { value: "setting.updated", label: "Setting atualizado" },
          { value: "export.csv", label: "Exportação CSV" },
        ]}
      />
      <FilterSelect
        label="Período"
        value={periodo}
        onChange={(v) => updateParam("periodo", v)}
        options={[
          { value: "", label: "Sempre" },
          { value: "24h", label: "Últimas 24h" },
          { value: "7d", label: "Últimos 7d" },
          { value: "30d", label: "Últimos 30d" },
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

      {pending && (
        <span className="text-xs text-white/30 animate-pulse">Atualizando...</span>
      )}
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
