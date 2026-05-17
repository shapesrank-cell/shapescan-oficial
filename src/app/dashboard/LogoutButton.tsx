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
        className="text-sm font-medium px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-50 transition-all disabled:opacity-50"
      >
        {carregando ? "Saindo..." : "Sair"}
      </button>
    </form>
  );
}
