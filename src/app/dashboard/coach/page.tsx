import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CoachChat, type MensagemUI } from "./CoachChat";

export const metadata: Metadata = {
  title: "Coach IA",
  description:
    "Converse com o Coach IA do ShapeScan sobre seu treino, dieta e evolução.",
};

export default async function CoachPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Carrega a conversa salva (ordem cronológica) e verifica se já há análise.
  const [{ data: mensagens }, { data: analise }, { data: perfil }] =
    await Promise.all([
      supabase
        .from("coach_messages")
        .select("id, papel, conteudo, criado_em")
        .eq("user_id", user.id)
        .order("criado_em", { ascending: true }),
      supabase
        .from("analyses")
        .select("id")
        .eq("user_id", user.id)
        .order("criado_em", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase.from("profiles").select("nome").eq("id", user.id).single(),
    ]);

  const iniciais: MensagemUI[] = (mensagens ?? []).map((m) => ({
    id: m.id,
    papel: m.papel as MensagemUI["papel"],
    conteudo: m.conteudo,
  }));

  const primeiroNome = perfil?.nome?.trim().split(/\s+/)[0] ?? null;

  return (
    <CoachChat
      iniciais={iniciais}
      temAnalise={Boolean(analise)}
      primeiroNome={primeiroNome}
    />
  );
}
