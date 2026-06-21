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
  Trophy,
  ClipboardList,
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
    href: "/dashboard/ranking",
    label: "Ranking",
    icon: Trophy,
    match: (p) => p.startsWith("/dashboard/ranking"),
  },
  {
    href: "/dashboard/plano",
    label: "Plano",
    icon: ClipboardList,
    match: (p) => p.startsWith("/dashboard/plano"),
  },
  {
    href: "/analise/nova",
    label: "Analisar",
    icon: Plus,
    match: (p) => p.startsWith("/analise"),
    destaque: true,
  },
  {
    href: "/dashboard/evolucao",
    label: "Evolução",
    icon: LineChart,
    match: (p) => p.startsWith("/dashboard/evolucao"),
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

  // Mobile: separa o botão de destaque (+) dos demais e divide o resto em
  // dois lados, pra o "+" ficar flutuando no centro EXATO da barra.
  const itensNormais = ITENS.filter((i) => !i.destaque);
  const destaque = ITENS.find((i) => i.destaque);
  const meio = Math.ceil(itensNormais.length / 2);
  const esquerda = itensNormais.slice(0, meio);
  const direita = itensNormais.slice(meio);

  return (
    <>
      {/* ─── Sidebar (desktop) ─────────────────────────────────────── */}
      <aside className="hidden sm:flex fixed inset-y-0 left-0 z-40 w-60 flex-col gap-1 border-r border-white/[0.08] bg-[#0d0d0d] p-4">
        <Link href="/dashboard" className="flex items-center gap-2 px-2 py-3 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icon-192.png"
            alt="ShapeScan"
            width={36}
            height={36}
            className="h-9 w-9 rounded-xl group-hover:scale-105 transition-transform"
          />
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
        <div className="relative flex items-stretch px-1">
          {/* Itens à esquerda do botão central */}
          <div className="flex flex-1 items-stretch justify-around">
            {esquerda.map((item) => (
              <ItemMobile
                key={item.href}
                item={item}
                ativo={item.match(pathname)}
              />
            ))}
          </div>

          {/* Espaço reservado pro botão flutuante (mesma largura dele) */}
          <div className="w-14 shrink-0" aria-hidden />

          {/* Itens à direita do botão central */}
          <div className="flex flex-1 items-stretch justify-around">
            {direita.map((item) => (
              <ItemMobile
                key={item.href}
                item={item}
                ativo={item.match(pathname)}
              />
            ))}
          </div>

          {/* Botão de destaque (+) — flutuando no centro EXATO da barra */}
          {destaque && (
            <Link
              href={destaque.href}
              aria-label="Nova análise"
              className="absolute left-1/2 -translate-x-1/2 bottom-0 flex w-14 flex-col items-center justify-end pt-1 pb-1.5"
            >
              <span className="-mt-5 mb-0.5 flex h-12 w-12 items-center justify-center rounded-full bg-orange-400 text-black shadow-lg shadow-orange-400/30 active:scale-95 transition-transform">
                <destaque.icon size={24} />
              </span>
              <span className="text-[10px] font-medium text-white/50">
                {destaque.label}
              </span>
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}

/** Item normal da barra inferior (mobile). */
function ItemMobile({ item, ativo }: { item: Item; ativo: boolean }) {
  const Icone = item.icon;
  return (
    <Link
      href={item.href}
      className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 transition-colors ${
        ativo ? "text-orange-400" : "text-white/45"
      }`}
    >
      <Icone size={21} />
      <span className="text-[10px] font-medium">{item.label}</span>
    </Link>
  );
}
