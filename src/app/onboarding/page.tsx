import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingForm } from "./OnboardingForm";

/**
 * Página de onboarding.
 *
 * Guarda server-side: se o usuário JÁ completou o perfil, não faz sentido
 * mostrar o questionário de novo — manda direto pro dashboard.
 * Só renderiza o formulário pra quem ainda não preencheu os dados.
 */
export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/onboarding");

  const { data: perfil } = await supabase
    .from("profiles")
    .select("perfil_completo")
    .eq("id", user.id)
    .single();

  if (perfil?.perfil_completo) {
    redirect("/dashboard");
  }

  return <OnboardingForm />;
}
