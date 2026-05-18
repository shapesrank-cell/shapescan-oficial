/**
 * POST /api/analyze
 *
 * Recebe os dados do formulário de onboarding e retorna a análise de biotipo
 * gerada pela IA (Gemini).
 */
import { NextResponse } from "next/server";
import { gerarAnaliseBiotipo, type DadosUsuario } from "@/lib/gemini";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<DadosUsuario>;

    // Validação mínima dos campos obrigatórios.
    const camposObrigatorios: (keyof DadosUsuario)[] = [
      "nome",
      "sexo",
      "idade",
      "peso",
      "altura",
      "nivelAtividade",
      "objetivo",
      // "foto" é OPCIONAL — não está aqui de propósito
    ];
    for (const campo of camposObrigatorios) {
      if (
        body[campo] === undefined ||
        body[campo] === null ||
        body[campo] === ""
      ) {
        return NextResponse.json(
          { erro: `Campo obrigatório faltando: ${campo}` },
          { status: 400 }
        );
      }
    }

    const dados = body as DadosUsuario;

    // Busca a chave de API do banco (admin pode trocar sem precisar de novo deploy)
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
      // Se falhar (ex: SUPABASE_SERVICE_ROLE_KEY não configurada), usa env var
    }

    const analise = await gerarAnaliseBiotipo(dados, apiKeyDoBanco);

    return NextResponse.json({ analise });
  } catch (err) {
    console.error("[/api/analyze] erro:", err);
    const mensagem = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json(
      { erro: `Falha ao gerar análise: ${mensagem}` },
      { status: 500 }
    );
  }
}
