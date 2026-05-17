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
        className="text-sm font-medium px-4 py-2 rounded-full border border-white/20 text-white/60 hover:border-white/40 hover:text-white transition-all disabled:opacity-50"
      >
        {carregando ? "Saindo..." : "Sair"}
      </button>
    </form>
  );
}
