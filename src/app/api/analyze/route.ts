/**
 * POST /api/analyze
 *
 * Recebe os dados do formulário de onboarding e retorna a análise de biotipo
 * gerada pela IA (Gemini).
 */
import { NextResponse } from "next/server";
import { gerarAnaliseBiotipo, type DadosUsuario } from "@/lib/gemini";

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
    const analise = await gerarAnaliseBiotipo(dados);

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
