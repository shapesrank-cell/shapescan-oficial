import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";
import {
  calcularRankGeral,
  ordenarGrupos,
  resolverRank,
  GRUPO_LABEL,
  formatarElo,
  ELO_MAX,
  type RankingGrupo,
} from "@/lib/ranking";
import type { AnaliseBiotipo } from "@/lib/gemini";

// Usa o client do Supabase (cookies) → precisa de runtime Node.
export const runtime = "nodejs";

/** #RRGGBB + alpha → rgba() (Satori/next-og lida melhor com rgba que hex-8). */
function rgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * GET /dashboard/ranking/card
 * Gera uma imagem (1080x1080) do rank do usuário, pronta pra compartilhar.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Não autorizado", { status: 401 });

  const [{ data: analises }, { data: perfil }] = await Promise.all([
    supabase
      .from("analyses")
      .select("resultado, criado_em")
      .order("criado_em", { ascending: false })
      .limit(20),
    supabase.from("profiles").select("nome").eq("id", user.id).single(),
  ]);

  const comRank = (analises ?? []).find(
    (a) => (a.resultado as AnaliseBiotipo)?.ranking?.grupos?.length
  );
  const grupos: RankingGrupo[] | null = comRank
    ? (comRank.resultado as AnaliseBiotipo).ranking!.grupos
    : null;
  if (!grupos) return new Response("Sem ranking ainda", { status: 404 });

  const nome = (perfil?.nome as string)?.split(" ")[0] || "";

  const geral = calcularRankGeral(grupos)!;
  const ordenados = ordenarGrupos(grupos);

  return new ImageResponse(
    (
      <div
        style={{
          width: "1080px",
          height: "1080px",
          display: "flex",
          flexDirection: "column",
          background: "#111111",
          padding: "72px",
          fontFamily: "sans-serif",
          color: "#ffffff",
        }}
      >
        {/* Cabeçalho */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "6px",
              background: "#fb923c",
            }}
          />
          <div style={{ fontSize: "34px", fontWeight: 800, letterSpacing: "1px" }}>
            ShapeScan
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ fontSize: "26px", color: rgba("#ffffff", 0.4) }}>
            {nome ? `Rank de ${nome}` : "Meu rank"}
          </div>
        </div>

        {/* Rank geral em destaque */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: "60px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              fontSize: "26px",
              letterSpacing: "8px",
              color: rgba("#ffffff", 0.5),
              textTransform: "uppercase",
            }}
          >
            Rank Geral
          </div>
          <div
            style={{
              display: "flex",
              width: "200px",
              height: "200px",
              marginTop: "24px",
              marginBottom: "24px",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "32px",
              background: rgba(geral.tier.cor, 0.15),
              border: `6px solid ${geral.tier.cor}`,
            }}
          >
            <div
              style={{ fontSize: "120px", fontWeight: 900, color: geral.tier.cor }}
            >
              {geral.tier.nome.charAt(0)}
            </div>
          </div>
          <div
            style={{ fontSize: "88px", fontWeight: 900, color: geral.tier.cor }}
          >
            {geral.tier.nome}
          </div>
          <div
            style={{
              fontSize: "40px",
              color: rgba("#ffffff", 0.67),
              marginTop: "4px",
            }}
          >
            {`${formatarElo(geral.elo)} / ${formatarElo(ELO_MAX)} pts`}
          </div>
        </div>

        {/* Grupos */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            marginTop: "30px",
          }}
        >
          {ordenados.map((g) => {
            const r = resolverRank(g.nota);
            return (
              <div
                key={g.grupo}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "20px",
                  background: rgba("#ffffff", 0.04),
                  borderRadius: "18px",
                  padding: "18px 28px",
                }}
              >
                <div
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "6px",
                    background: r.tier.cor,
                  }}
                />
                <div style={{ fontSize: "34px", fontWeight: 700, flex: 1 }}>
                  {GRUPO_LABEL[g.grupo]}
                </div>
                <div
                  style={{ fontSize: "32px", fontWeight: 800, color: r.tier.cor }}
                >
                  {`${r.tier.nome} · ${formatarElo(r.elo)}`}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ flex: 1 }} />
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            fontSize: "26px",
            color: rgba("#ffffff", 0.33),
          }}
        >
          shapescan-oficial.vercel.app
        </div>
      </div>
    ),
    { width: 1080, height: 1080 }
  );
}
