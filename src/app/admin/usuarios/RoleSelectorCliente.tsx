"use client";

import { useTransition, useState } from "react";
import { alterarRole } from "./actions";

type Role = "user" | "workspace_admin" | "super_admin";

const ROLE_LABELS: Record<Role, string> = {
  user: "Usuário",
  workspace_admin: "Admin Workspace",
  super_admin: "Super Admin",
};

const ROLE_CORES: Record<Role, string> = {
  user: "text-white/50 border-white/20",
  workspace_admin: "text-blue-400 border-blue-400/30",
  super_admin: "text-orange-400 border-orange-400/30",
};

export function RoleSelector({
  userId,
  roleAtual,
  ehVoceMesmo,
}: {
  userId: string;
  roleAtual: Role;
  ehVoceMesmo: boolean;
}) {
  const [role, setRole] = useState<Role>(roleAtual);
  const [salvando, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  function handleChange(novoRole: Role) {
    if (novoRole === role) return;
    setErro(null);
    startTransition(async () => {
      const r = await alterarRole(userId, novoRole);
      if (r.erro) {
        setErro(r.erro);
      } else {
        setRole(novoRole);
      }
    });
  }

  return (
    <div className="flex flex-col gap-1 items-end">
      <select
        value={role}
        onChange={(e) => handleChange(e.target.value as Role)}
        disabled={salvando || ehVoceMesmo}
        className={`text-xs font-medium px-2 py-1 rounded-lg border bg-transparent cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${ROLE_CORES[role]}`}
      >
        {Object.entries(ROLE_LABELS).map(([val, label]) => (
          <option key={val} value={val} className="bg-[#1a1a1a] text-white">
            {label}
          </option>
        ))}
      </select>
      {ehVoceMesmo && (
        <span className="text-[10px] text-white/20">você mesmo</span>
      )}
      {erro && <span className="text-[10px] text-red-400">{erro}</span>}
      {salvando && <span className="text-[10px] text-white/30">Salvando...</span>}
    </div>
  );
}
