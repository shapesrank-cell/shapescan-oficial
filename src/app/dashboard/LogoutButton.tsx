"use client";

import { useTransition } from "react";
import { logout } from "@/app/auth/actions";

export function LogoutButton() {
  const [carregando, startTransition] = useTransition();

  return (
    <form action={() => startTransition(() => logout())}>
      <button
        type="submit"
        disabled={carregando}
        className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors disabled:opacity-50"
      >
        {carregando ? "Saindo..." : "Sair"}
      </button>
    </form>
  );
}
