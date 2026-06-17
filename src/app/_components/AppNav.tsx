"use client";

/**
 * Navegação global do app (setores).
 * - Mobile: barra inferior fixa estilo app, com botão central de "Nova análise".
 * - Desktop (sm+): sidebar lateral fixa à esquerda, com logout no rodapé.
 *
 * Usa usePathname pra marcar o setor ativo. É montada pelo AppShell.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition } from "react";
import {
  Home,
  LineChart,
  Sparkles,
  User,
  Plus,
  LogOut,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { logout } from "@/app/auth/actions";

type Item = {
  href: string;
  label: string;
  icon: LucideIcon;
  // prefixo(s) que marcam o item como ativo
  match: (p: string) => boolean;
  destaque?: boolean; // botão central / CTA
};

const ITENS: Item[] = [
  {
    href: "/dashboard",
    label: "Início",
    icon: Home,
    match: (p) => p === "/dashboard",
  },
  {
    href: "/dashboard/evolucao",
    label: "Evolução",
    icon: LineChart,
    match: (p) => p.startsWith("/dashboard/evolucao"),
  },
  {
    href: "/analise/nova",
    label: "Analisar",
    icon: Plus,
    match: (p) => p.startsWith("/analise"),
    destaque: true,
  },
  {
    href: "/dashboard/coach",
    label: "Coach",
    icon: Sparkles,
    match: (p) => p.startsWith("/dashboard/coach"),
  },
  {
    href: "/perfil",
    label: "Perfil",
    icon: User,
    match: (p) => p.startsWith("/perfil") || p.startsWith("/configuracoes"),
  },
];

export function AppNav() {
  const pathname = usePathname() ?? "";
  const [saindo, startTransition] = useTransition();

  return (
    <>
      {/* ─── Sidebar (desktop) ─────────────────────────────────────── */}
      <aside className="hidden sm:flex fixed inset-y-0 left-0 z-40 w-60 flex-col gap-1 border-r border-white/[0.08] bg-[#0d0d0d] p-4">
        <Link href="/dashboard" className="flex items-center gap-2 px-2 py-3 group">
          <div className="h-9 w-9 rounded-2xl bg-orange-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <span className="text-black font-bold text-base">S</span>
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            ShapeScan
          </span>
        </Link>

        <nav className="mt-3 flex flex-col gap-1">
          {ITENS.map((item) => {
            const ativo = item.match(pathname);
            const Icone = item.icon;
            if (item.destaque) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="mt-1 mb-1 inline-flex items-center gap-2.5 h-11 px-4 rounded-xl bg-orange-400 text-black font-semibold text-sm hover:bg-orange-300 active:scale-[0.98] transition-all"
                >
                  <Icone size={18} /> Nova análise
                </Link>
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-2.5 h-11 px-4 rounded-xl text-sm font-medium transition-all ${
                  ativo
                    ? "bg-orange-400/10 text-orange-400 border border-orange-400/20"
                    : "text-white/60 hover:text-white hover:bg-white/[0.05]"
                }`}
              >
                <Icone size={18} /> {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto">
          <form action={() => startTransition(() => logout())}>
            <button
              type="submit"
              disabled={saindo}
              className="w-full inline-flex items-center gap-2.5 h-11 px-4 rounded-xl text-sm font-medium text-white/50 hover:text-red-400 hover:bg-white/[0.05] transition-all disabled:opacity-50"
            >
              <LogOut size={18} /> {saindo ? "Saindo..." : "Sair"}
            </button>
          </form>
        </div>
      </aside>

      {/* ─── Barra inferior (mobile) ───────────────────────────────── */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-40 border-t border-white/[0.08] bg-[#0d0d0d]/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-stretch justify-around px-1">
          {ITENS.map((item) => {
            const ativo = item.match(pathname);
            const Icone = item.icon;

            if (item.destaque) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center justify-end flex-1 pt-1 pb-1.5"
                  aria-label="Nova análise"
                >
                  <span className="-mt-5 mb-0.5 flex h-12 w-12 items-center justify-center rounded-full bg-orange-400 text-black shadow-lg shadow-orange-400/30 active:scale-95 transition-transform">
                    <Icone size={24} />
                  </span>
                  <span className="text-[10px] font-medium text-white/50">
                    {item.label}
                  </span>
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-2.5 transition-colors ${
                  ativo ? "text-orange-400" : "text-white/45"
                }`}
              >
                <Icone size={21} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
