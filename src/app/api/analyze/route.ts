/**
 * POST /api/analyze
 *
 * Versão hardening:
 * - Exige autenticação (401 se não logado)
 * - Rate limit: 10/hora por usuário (429 se excedeu)
 * - Valida tamanho da foto (máx 5MB base64)
 * - Valida campos numéricos contra ranges seguros
 * - Salva no banco SERVER-SIDE com provider_ia rastreado
 * - Loga erros no error_log
 * - Retorna { id, analise } pra navegação direta ao resultado
 */
import { NextResponse } from "next/server";
import { gerarAnaliseBiotipo, type DadosUsuario } from "@/lib/gemini";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit } from "@/lib/rateLimit";
import { logError } from "@/lib/errorLog";
import { sanitizarPreferencias } from "@/lib/preferencias";

// Limites
const MAX_FOTO_BASE64 = 5 * 1024 * 1024; // 5MB base64 ≈ 3.75MB binário
const RATE_LIMIT_ANALISES_HORA = 10;
const RATE_LIMIT_ANALISES_DIA = 30;
const MIMES_FOTO = ["image/jpeg", "image/png", "image/webp"];

// Tipo provider IA (preparado pra Claude futuro)
type ProviderIA = "gemini" | "claude";

export async function POST(request: Request) {
  // 1. AUTH: precisa estar logado
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { erro: "Você precisa estar logado pra gerar uma análise." },
      { status: 401 }
    );
  }

  // 2. RATE LIMIT (por hora e por dia)
  const limitHora = await checkRateLimit({
    identifier: user.id,
    action: "analyze",
    limit: RATE_LIMIT_ANALISES_HORA,
    windowMinutes: 60,
  });
  if (!limitHora.allowed) {
    return NextResponse.json(
      {
        erro: `Limite de ${RATE_LIMIT_ANALISES_HORA} análises por hora atingido. Tente novamente em 1 hora.`,
      },
      { status: 429 }
    );
  }

  const limitDia = await checkRateLimit({
    identifier: user.id,
    action: "analyze.day",
    limit: RATE_LIMIT_ANALISES_DIA,
    windowMinutes: 60 * 24,
  });
  if (!limitDia.allowed) {
    return NextResponse.json(
      {
        erro: `Limite diário de ${RATE_LIMIT_ANALISES_DIA} análises atingido. Tente novamente amanhã.`,
      },
      { status: 429 }
    );
  }

  // 3. PARSE + VALIDAÇÃO
  let body: Partial<DadosUsuario>;
  try {
    body = (await request.json()) as Partial<DadosUsuario>;
  } catch {
    return NextResponse.json(
      { erro: "JSON inválido no body da requisição." },
      { status: 400 }
    );
  }

  // Campos obrigatórios
  const obrigatorios: (keyof DadosUsuario)[] = [
    "nome",
    "sexo",
    "idade",
    "peso",
    "altura",
    "nivelAtividade",
    "objetivo",
  ];
  for (const campo of obrigatorios) {
    if (body[campo] === undefined || body[campo] === null || body[campo] === "") {
      return NextResponse.json(
        { erro: `Campo obrigatório faltando: ${campo}` },
        { status: 400 }
      );
    }
  }

  // Validação de tipos e ranges
  const idade = Number(body.idade);
  const peso = Number(body.peso);
  const altura = Number(body.altura);

  if (!Number.isFinite(idade) || idade < 10 || idade > 110) {
    return NextResponse.json({ erro: "Idade inválida (10-110)." }, { status: 400 });
  }
  if (!Number.isFinite(peso) || peso < 20 || peso > 400) {
    return NextResponse.json({ erro: "Peso inválido (20-400 kg)." }, { status: 400 });
  }
  if (!Number.isFinite(altura) || altura < 80 || altura > 250) {
    return NextResponse.json({ erro: "Altura inválida (80-250 cm)." }, { status: 400 });
  }

  const sexosValidos = ["masculino", "feminino", "outro"];
  if (!sexosValidos.includes(body.sexo as string)) {
    return NextResponse.json({ erro: "Sexo inválido." }, { status: 400 });
  }

  const niveisValidos = ["sedentario", "leve", "moderado", "intenso"];
  if (!niveisValidos.includes(body.nivelAtividade as string)) {
    return NextResponse.json({ erro: "Nível de atividade inválido." }, { status: 400 });
  }

  const objetivosValidos = ["emagrecer", "ganhar_massa", "definir", "saude_geral"];
  if (!objetivosValidos.includes(body.objetivo as string)) {
    return NextResponse.json({ erro: "Objetivo inválido." }, { status: 400 });
  }

  // Limite de tamanho da foto (DoS protection)
  if (body.foto && body.foto.length > MAX_FOTO_BASE64) {
    return NextResponse.json(
      {
        erro: `Foto muito grande. Máximo ${Math.round(
          MAX_FOTO_BASE64 / 1024 / 1024
        )}MB.`,
      },
      { status: 413 }
    );
  }

  // Validação de mimeType da foto (whitelist)
  if (body.foto) {
    if (!body.fotoMimeType || !MIMES_FOTO.includes(body.fotoMimeType)) {
      return NextResponse.json(
        { erro: "Formato de foto inválido. Use JPEG, PNG ou WebP." },
        { status: 400 }
      );
    }
  }

  // Fotos do CORPO ATUAL em vários ângulos (frente/costas/lado) — máx 3, cada
  // uma validada por tamanho, mimeType e ângulo.
  const ANGULOS_VALIDOS = ["frente", "costas", "lado"];
  let fotosCorpo: DadosUsuario["fotos"];
  if (body.fotos !== undefined) {
    if (!Array.isArray(body.fotos) || body.fotos.length > 3) {
      return NextResponse.json(
        { erro: "Envie no máximo 3 fotos do corpo." },
        { status: 400 }
      );
    }
    for (const f of body.fotos) {
      if (!f || typeof f.data !== "string" || f.data.length > MAX_FOTO_BASE64) {
        return NextResponse.json(
          {
            erro: `Foto muito grande. Máximo ${Math.round(
              MAX_FOTO_BASE64 / 1024 / 1024
            )}MB por foto.`,
          },
          { status: 413 }
        );
      }
      if (!f.mimeType || !MIMES_FOTO.includes(f.mimeType)) {
        return NextResponse.json(
          { erro: "Formato de foto inválido. Use JPEG, PNG ou WebP." },
          { status: 400 }
        );
      }
      if (!ANGULOS_VALIDOS.includes(f.angulo)) {
        return NextResponse.json(
          { erro: "Ângulo de foto inválido." },
          { status: 400 }
        );
      }
    }
    if (body.fotos.length > 0) fotosCorpo = body.fotos;
  }

  // Foto de SHAPE DE REFERÊNCIA (opcional) — mesmas regras de tamanho e formato
  if (body.fotoReferencia) {
    if (body.fotoReferencia.length > MAX_FOTO_BASE64) {
      return NextResponse.json(
        {
          erro: `Foto de referência muito grande. Máximo ${Math.round(
            MAX_FOTO_BASE64 / 1024 / 1024
          )}MB.`,
        },
        { status: 413 }
      );
    }
    if (
      !body.fotoReferenciaMimeType ||
      !MIMES_FOTO.includes(body.fotoReferenciaMimeType)
    ) {
      return NextResponse.json(
        { erro: "Formato da foto de referência inválido. Use JPEG, PNG ou WebP." },
        { status: 400 }
      );
    }
  }

  // Preferências da análise (rotina/dieta/meta) — sanitizadas contra whitelists
  const preferencias = sanitizarPreferencias(body.preferencias);

  // Limite de tamanho do nome
  const nome = (body.nome as string).slice(0, 100).trim();
  if (!nome) {
    return NextResponse.json({ erro: "Nome inválido." }, { status: 400 });
  }

  const dados: DadosUsuario = {
    nome,
    sexo: body.sexo as DadosUsuario["sexo"],
    idade,
    peso,
    altura,
    nivelAtividade: body.nivelAtividade as DadosUsuario["nivelAtividade"],
    objetivo: body.objetivo as DadosUsuario["objetivo"],
    ...(fotosCorpo ? { fotos: fotosCorpo } : {}),
    ...(body.foto && body.fotoMimeType
      ? { foto: body.foto, fotoMimeType: body.fotoMimeType }
      : {}),
    ...(body.fotoReferencia && body.fotoReferenciaMimeType
      ? {
          fotoReferencia: body.fotoReferencia,
          fotoReferenciaMimeType: body.fotoReferenciaMimeType,
        }
      : {}),
    ...(preferencias ? { preferencias } : {}),
  };

  // 3b. MEDIDAS: puxa as circunferências do último check-in (Evolução) pra dar
  // precisão ao ranking por grupo. Sem check-in / sem medidas → segue sem elas.
  try {
    const { data: ultimoCheckin } = await supabase
      .from("checkins")
      .select(
        "peso, cintura, quadril, braco, peito, coxa, ombros, panturrilha, antebraco, pescoco, criado_em"
      )
      .eq("user_id", user.id)
      .order("criado_em", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (ultimoCheckin) {
      const temMedida =
        ultimoCheckin.cintura != null ||
        ultimoCheckin.quadril != null ||
        ultimoCheckin.braco != null ||
        ultimoCheckin.peito != null ||
        ultimoCheckin.coxa != null ||
        ultimoCheckin.ombros != null ||
        ultimoCheckin.panturrilha != null ||
        ultimoCheckin.antebraco != null ||
        ultimoCheckin.pescoco != null;
      if (temMedida) {
        dados.medidas = {
          cintura: ultimoCheckin.cintura,
          quadril: ultimoCheckin.quadril,
          braco: ultimoCheckin.braco,
          peito: ultimoCheckin.peito,
          coxa: ultimoCheckin.coxa,
          ombros: ultimoCheckin.ombros,
          panturrilha: ultimoCheckin.panturrilha,
          antebraco: ultimoCheckin.antebraco,
          pescoco: ultimoCheckin.pescoco,
          registradoEm: new Date(ultimoCheckin.criado_em).toLocaleDateString(
            "pt-BR"
          ),
        };
      }
    }
  } catch {
    // falha ao buscar check-in não bloqueia a análise
  }

  // 4. BUSCA API KEY (banco tem prioridade sobre env)
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
    // Usa env como fallback
  }

  // Decide provider (preparado pra Claude). Por enquanto sempre gemini.
  const provider: ProviderIA = "gemini";

  // 5. CHAMA IA
  let analise;
  try {
    analise = await gerarAnaliseBiotipo(dados, apiKeyDoBanco);
  } catch (err) {
    const e = err as Error;
    await logError({
      origem: "/api/analyze",
      mensagem: `Falha na chamada Gemini: ${e.message}`,
      stack: e.stack,
      userId: user.id,
      userEmail: user.email,
      metadata: { etapa: "gemini" },
    });
    return NextResponse.json(
      { erro: "A IA falhou ao gerar a análise. Tente novamente em alguns segundos." },
      { status: 502 }
    );
  }

  // 6. SALVA NO BANCO (server-side, dados validados, provider rastreado)
  // Remove as fotos base64 do que vai pro banco (eram só pra IA). As
  // preferências FICAM — são o retrato da rotina daquela análise.
  const dadosParaSalvar = { ...dados } as Partial<DadosUsuario>;
  delete dadosParaSalvar.fotos;
  delete dadosParaSalvar.foto;
  delete dadosParaSalvar.fotoMimeType;
  delete dadosParaSalvar.fotoReferencia;
  delete dadosParaSalvar.fotoReferenciaMimeType;

  let analiseId: string | null = null;
  try {
    const { data, error } = await supabase
      .from("analyses")
      .insert({
        user_id: user.id,
        dados_entrada: dadosParaSalvar,
        resultado: analise,
        provider_ia: provider,
      })
      .select("id")
      .single();

    if (error) throw error;
    analiseId = data.id;

    // Atualiza nome do perfil se mudou
    if (nome) {
      await supabase.from("profiles").update({ nome }).eq("id", user.id);
    }
  } catch (err) {
    const e = err as Error;
    await logError({
      origem: "/api/analyze",
      mensagem: `Falha ao salvar análise: ${e.message}`,
      stack: e.stack,
      userId: user.id,
      userEmail: user.email,
      metadata: { etapa: "db_insert" },
    });
    // Mesmo se salvar falhou, retorna a análise pro usuário (não perde o trabalho)
    return NextResponse.json({ analise, id: null, alerta: "Análise gerada mas não foi salva. Tente repetir mais tarde." });
  }

  return NextResponse.json({ analise, id: analiseId });
}
