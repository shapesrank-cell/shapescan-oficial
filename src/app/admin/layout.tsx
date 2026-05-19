import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSuperAdmin } from "@/lib/admin";
import { AdminSidebar } from "./AdminSidebar";

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

  if (!isSuperAdmin(user.email, perfil?.role)) redirect("/dashboard");

  const adminNome = perfil?.nome || user.email?.split("@")[0] || "Admin";

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <AdminSidebar adminNome={adminNome} />

      {/* Conteúdo principal */}
      <main className="flex-1 min-w-0 px-4 lg:px-8 py-8 lg:py-10">
        <div className="w-full max-w-6xl mx-auto pt-12 lg:pt-0">
          {children}
        </div>
      </main>
    </div>
  );
}
