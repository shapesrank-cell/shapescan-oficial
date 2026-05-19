"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Activity,
  ScrollText,
  Settings,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const NAV: NavGroup[] = [
  {
    label: "Visão geral",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { href: "/admin/sistema", label: "Sistema", icon: Activity },
    ],
  },
  {
    label: "Dados",
    items: [
      { href: "/admin/usuarios", label: "Usuários", icon: Users },
      { href: "/admin/analises", label: "Análises", icon: BarChart3 },
    ],
  },
  {
    label: "Operações",
    items: [
      { href: "/admin/auditoria", label: "Auditoria", icon: ScrollText },
      { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
    ],
  },
];

export function AdminSidebar({ adminNome }: { adminNome: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-30 h-10 w-10 rounded-xl bg-white/[0.08] border border-white/[0.12] flex items-center justify-center text-white/70"
        aria-label="Abrir menu"
      >
        <Menu size={18} />
      </button>

      {/* Overlay mobile */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-[fadeIn_0.2s_ease-out]"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-[#0d0d0d] border-r border-white/[0.06] z-50 lg:z-0 flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Header */}
        <div className="px-5 py-5 border-b border-white/[0.06] flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-orange-400 flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={17} className="text-black" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">
                Super Admin
              </span>
              <span className="text-[10px] text-white/30">ShapeScan</span>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="lg:hidden text-white/40 hover:text-white"
            aria-label="Fechar menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-6">
          {NAV.map((group) => (
            <div key={group.label} className="flex flex-col gap-1">
              <span className="px-3 mb-1 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                {group.label}
              </span>
              {group.items.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  onClick={() => setOpen(false)}
                />
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-white/[0.06] flex flex-col gap-2">
          <div className="text-[10px] text-white/30 uppercase tracking-widest font-bold">
            Conectado como
          </div>
          <div className="text-sm text-white/70 truncate">{adminNome}</div>
          <Link
            href="/dashboard"
            className="mt-2 text-xs px-3 py-2 rounded-lg border border-white/[0.12] text-white/50 hover:text-white hover:border-white/30 transition-all text-center"
          >
            ← Voltar pro app
          </Link>
        </div>
      </aside>
    </>
  );
}

function NavLink({ item, onClick }: { item: NavItem; onClick: () => void }) {
  const pathname = usePathname();
  const active = item.exact
    ? pathname === item.href
    : pathname.startsWith(item.href);

  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
        active
          ? "bg-orange-400/10 text-orange-400 border border-orange-400/20"
          : "text-white/60 hover:text-white hover:bg-white/[0.04] border border-transparent"
      }`}
    >
      <Icon size={15} />
      {item.label}
    </Link>
  );
}
