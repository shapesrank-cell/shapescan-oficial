/**
 * POST /api/coach
 *
 * Chat do Coach IA (streaming de texto):
 * - Exige autenticação (401 se não logado)
 * - Rate limit: 30 mensagens/hora por usuário (429 se excedeu)
 * - Valida a mensagem (1 a MAX_TAMANHO_MENSAGEM caracteres)
 * - Monta o contexto (perfil + última análise + check-ins) e o histórico recente
 * - Faz STREAM da resposta do Gemini token a token (text/plain)
 * - Ao final, persiste a mensagem do usuário + a resposta da IA (só em caso de sucesso)
 *
 * O corpo da resposta é texto puro em streaming. Em caso de falha da IA antes
 * de qualquer token, devolvemos uma mensagem de desculpas (e não persistimos nada).
 */
import { NextResponse } from "next/server";
import { responderCoach } from "@/lib/gemini";
import type { AnaliseBiotipo } from "@/lib/gemini";
import {
  limitarHistorico,
  MAX_TAMANHO_MENSAGEM,
  type MensagemCoach,
} from "@/lib/coach";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit } from "@/lib/rateLimit";
import { logError } from "@/lib/errorLog";

const RATE_LIMIT_COACH_HORA = 30;

export async function POST(request: Request) {
  // 1. AUTH
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { erro: "Você precisa estar logado pra falar com o coach." },
      { status: 401 }
    );
  }

  // 2. RATE LIMIT (cada mensagem = 1 chamada de IA = custo)
  const limite = await checkRateLimit({
    identifier: user.id,
    action: "coach.message",
    limit: RATE_LIMIT_COACH_HORA,
    windowMinutes: 60,
  });
  if (!limite.allowed) {
    return NextResponse.json(
      {
        erro: `Você atingiu o limite de ${RATE_LIMIT_COACH_HORA} mensagens por hora. Tente novamente mais tarde.`,
      },
      { status: 429 }
    );
  }

  // 3. PARSE + VALIDAÇÃO
  let body: { mensagem?: unknown };
  try {
    body = (await request.json()) as { mensagem?: unknown };
  } catch {
    return NextResponse.json({ erro: "JSON inválido." }, { status: 400 });
  }

  const mensagem =
    typeof body.mensagem === "string" ? body.mensagem.trim() : "";
  if (!mensagem) {
    return NextResponse.json(
      { erro: "Escreva uma mensagem pro coach." },
      { status: 400 }
    );
  }
  if (mensagem.length > MAX_TAMANHO_MENSAGEM) {
    return NextResponse.json(
      { erro: `Mensagem muito longa (máx. ${MAX_TAMANHO_MENSAGEM} caracteres).` },
      { status: 400 }
    );
  }

  // 4. CONTEXTO: perfil + última análise + check-ins + histórico recente
  const [
    { data: perfil },
    { data: ultimaAnalise },
    { data: checkins },
    { data: historicoDb },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("nome, sexo, idade, peso, altura, nivel_atividade, objetivo")
      .eq("id", user.id)
      .single(),
    supabase
      .from("analyses")
      .select("resultado")
      .eq("user_id", user.id)
      .order("criado_em", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("checkins")
      .select(
        "peso, cintura, quadril, braco, peito, coxa, ombros, panturrilha, antebraco, pescoco, criado_em"
      )
      .eq("user_id", user.id)
      .order("criado_em", { ascending: true }),
    supabase
      .from("coach_messages")
      .select("papel, conteudo, criado_em")
      .eq("user_id", user.id)
      .order("criado_em", { ascending: false })
      .limit(40),
  ]);

  // Histórico salvo em ordem cronológica (o .limit pegou os 40 mais recentes desc)
  const historicoSalvo: MensagemCoach[] = (historicoDb ?? [])
    .slice()
    .reverse()
    .map((m) => ({ papel: m.papel as MensagemCoach["papel"], conteudo: m.conteudo }));

  // Histórico que vai pro modelo = salvo + a nova mensagem do usuário, limitado.
  const historicoParaIA = limitarHistorico([
    ...historicoSalvo,
    { papel: "user", conteudo: mensagem },
  ]);

  const analise =
    (ultimaAnalise?.resultado as AnaliseBiotipo | null | undefined) ?? null;

  const contexto = {
    nome: perfil?.nome ?? null,
    sexo: perfil?.sexo ?? null,
    idade: perfil?.idade ?? null,
    peso: perfil?.peso ?? null,
    altura: perfil?.altura ?? null,
    nivelAtividade: perfil?.nivel_atividade ?? null,
    objetivo: perfil?.objetivo ?? null,
    analise,
    checkins: (checkins ?? []).map((c) => ({
      data: c.criado_em,
      peso: c.peso,
      cintura: c.cintura,
      quadril: c.quadril,
      braco: c.braco,
      peito: c.peito,
      coxa: c.coxa,
      ombros: c.ombros,
      panturrilha: c.panturrilha,
      antebraco: c.antebraco,
      pescoco: c.pescoco,
    })),
  };

  // 5. API KEY (banco tem prioridade sobre env)
  let apiKeyDoBanco: string | undefined;
  try {
    const admin = createAdminClient();
    const { data: setting } = await admin
      .from("app_settings")
      .select("value")
      .eq("key", "gemini_api_key")
      .single();
    if (setting?.value && setting.value.length > 4) {
      apiKeyDoBanco = setting.value;
    }
  } catch {
    // usa env como fallback
  }

  // 6. STREAM da resposta
  const encoder = new TextEncoder();
  const adminDb = createAdminClient();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let resposta = "";
      try {
        const geminiStream = await responderCoach(
          contexto,
          historicoParaIA,
          apiKeyDoBanco
        );
        for await (const chunk of geminiStream) {
          const texto = chunk.text;
          if (texto) {
            resposta += texto;
            controller.enqueue(encoder.encode(texto));
          }
        }
      } catch (err) {
        const e = err as Error;
        await logError({
          origem: "/api/coach",
          mensagem: `Falha no stream do coach: ${e.message}`,
          stack: e.stack,
          userId: user.id,
          userEmail: user.email,
          metadata: { etapa: "gemini_stream" },
        });
        if (!resposta) {
          // Nada foi gerado: manda uma mensagem amigável e NÃO persiste.
          controller.enqueue(
            encoder.encode(
              "Desculpe, tive um problema pra responder agora. Tente de novo em alguns segundos."
            )
          );
        }
      }

      // Persiste a conversa só se a IA realmente respondeu algo.
      if (resposta.trim()) {
        try {
          // Dois inserts sequenciais garantem criado_em do user < assistente.
          await adminDb.from("coach_messages").insert({
            user_id: user.id,
            papel: "user",
            conteudo: mensagem,
          });
          await adminDb.from("coach_messages").insert({
            user_id: user.id,
            papel: "assistente",
            conteudo: resposta.slice(0, 4000),
          });
        } catch (err) {
          const e = err as Error;
          await logError({
            origem: "/api/coach",
            mensagem: `Falha ao salvar mensagens do coach: ${e.message}`,
            stack: e.stack,
            userId: user.id,
            userEmail: user.email,
            metadata: { etapa: "db_insert" },
          });
        }
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
