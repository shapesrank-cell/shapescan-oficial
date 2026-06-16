import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AnaliseNovaClient } from "./AnaliseNovaClient";

export const dynamic = "force-dynamic";

export default async function NovaAnalisePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: perfil } = await supabase
    .from("profiles")
    .select(
      "nome, sexo, idade, peso, altura, nivel_atividade, objetivo, perfil_completo"
    )
    .eq("id", user.id)
    .single();

  // Perfil incompleto → manda fazer o onboarding primeiro
  if (!perfil?.perfil_completo) {
    redirect("/onboarding");
  }

  // Pré-preenche as preferências com a última análise (rotina muda com o tempo,
  // mas a maioria continua igual — o usuário só ajusta o que mudou).
  const { data: ultimaAnalise } = await supabase
    .from("analyses")
    .select("dados_entrada")
    .eq("user_id", user.id)
    .order("criado_em", { ascending: false })
    .limit(1)
    .maybeSingle();

  const preferenciasIniciais =
    (ultimaAnalise?.dados_entrada as { preferencias?: unknown } | null)
      ?.preferencias ?? null;

  return (
    <div className="flex flex-1 flex-col px-4 py-8 sm:py-12 bg-[#111111] animate-[fadeIn_0.4s_ease-out]">
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
        <Link
          href="/dashboard"
          className="text-sm text-white/50 hover:text-white/80 transition-colors self-start"
        >
          ← Voltar ao dashboard
        </Link>

        <div className="flex flex-col gap-1">
          <h1 className="text-3xl sm:text-5xl font-[family-name:var(--font-bebas)] tracking-wide text-white">
            <span className="text-orange-400">Nova</span> análise
          </h1>
          <p className="text-sm sm:text-base text-white/50">
            Usaremos seus dados salvos. Você pode adicionar uma foto pra refinar
            o resultado.
          </p>
        </div>

        <AnaliseNovaClient
          perfil={{
            nome: perfil.nome ?? "",
            sexo: perfil.sexo as "masculino" | "feminino" | "outro",
            idade: perfil.idade ?? 0,
            peso: perfil.peso ?? 0,
            altura: perfil.altura ?? 0,
            nivelAtividade: perfil.nivel_atividade as
              | "sedentario"
              | "leve"
              | "moderado"
              | "intenso",
            objetivo: perfil.objetivo as
              | "emagrecer"
              | "ganhar_massa"
              | "definir"
              | "saude_geral",
          }}
          preferenciasIniciais={
            preferenciasIniciais as React.ComponentProps<
              typeof AnaliseNovaClient
            >["preferenciasIniciais"]
          }
        />
      </div>
    </div>
  );
}
