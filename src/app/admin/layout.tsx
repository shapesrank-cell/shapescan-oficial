import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutDashboard, Users, Settings, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

const NAV_LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/usuarios", label: "Usuários", icon: Users },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Segunda barreira de segurança (além do proxy)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: perfil } = await supabase
    .from("profiles")
    .select("role, nome")
    .eq("id", user.id)
    .single();

  if (perfil?.role !== "super_admin") redirect("/dashboard");

  return (
    <div className="flex flex-col min-h-screen bg-[#111111]">
      {/* Top bar */}
      <header className="border-b border-white/[0.08] bg-[#0d0d0d] px-4 sm:px-6 py-3 flex items-center justify-between gap-4 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-orange-400 flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={16} className="text-black" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">
              Super Admin
            </span>
            <span className="text-[10px] text-white/30">ShapeScan</span>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-white/50 hover:text-white hover:bg-white/[0.06] transition-all"
            >
              <Icon size={13} />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}
        </nav>

        {/* User info + back to app */}
        <div className="flex items-center gap-2">
          <span className="hidden sm:block text-xs text-white/30">
            {perfil?.nome || user.email?.split("@")[0]}
          </span>
          <Link
            href="/dashboard"
            className="text-xs px-3 py-1.5 rounded-full border border-white/20 text-white/50 hover:text-white hover:border-white/40 transition-all"
          >
            ← App
          </Link>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 flex flex-col px-4 sm:px-6 py-8 w-full max-w-6xl mx-auto">
        {children}
      </main>
    </div>
  );
}
