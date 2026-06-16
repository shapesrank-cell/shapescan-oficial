import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { NovoCheckinForm } from "./NovoCheckinForm";

export default async function NovoCheckinPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Pré-preenche o peso com o último check-in (ou o peso do perfil) pra agilizar
  const { data: ultimoCheckin } = await supabase
    .from("checkins")
    .select("peso, cintura, quadril, braco, peito, coxa")
    .eq("user_id", user.id)
    .order("criado_em", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: perfil } = await supabase
    .from("profiles")
    .select("peso")
    .eq("id", user.id)
    .single();

  const valoresIniciais = {
    peso: ultimoCheckin?.peso ?? perfil?.peso ?? null,
    cintura: ultimoCheckin?.cintura ?? null,
    quadril: ultimoCheckin?.quadril ?? null,
    braco: ultimoCheckin?.braco ?? null,
    peito: ultimoCheckin?.peito ?? null,
    coxa: ultimoCheckin?.coxa ?? null,
  };

  return (
    <div className="flex flex-1 flex-col px-4 py-8 sm:py-12 bg-[#111111] animate-[fadeIn_0.4s_ease-out]">
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
        <header className="flex items-center gap-3">
          <Link
            href="/dashboard/evolucao"
            className="inline-flex items-center justify-center h-9 w-9 rounded-full border border-white/20 text-white/70 hover:border-white/40 hover:text-white transition-all"
          >
            <ArrowLeft size={16} />
          </Link>
          <div className="flex flex-col">
            <h1 className="text-2xl sm:text-3xl font-[family-name:var(--font-bebas)] tracking-wide text-white">
              Novo check-in
            </h1>
            <p className="text-sm text-white/50">
              Registre seu peso, medidas e uma foto de progresso.
            </p>
          </div>
        </header>

        <NovoCheckinForm valoresIniciais={valoresIniciais} />
      </div>
    </div>
  );
}
