import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  TrendingUp,
  TrendingDown,
  Minus,
  LineChart,
  Camera,
  Scale,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DeletarCheckinBotao } from "./DeletarCheckinBotao";
import { ComparadorFotos, type FotoCheckin } from "./ComparadorFotos";

type Checkin = {
  id: string;
  peso: number;
  cintura: number | null;
  quadril: number | null;
  braco: number | null;
  peito: number | null;
  coxa: number | null;
  foto_path: string | null;
  observacoes: string | null;
  criado_em: string;
};

const MEDIDAS: { chave: keyof Checkin; rotulo: string; unidade: string }[] = [
  { chave: "cintura", rotulo: "Cintura", unidade: "cm" },
  { chave: "quadril", rotulo: "Quadril", unidade: "cm" },
  { chave: "braco", rotulo: "Braço", unidade: "cm" },
  { chave: "peito", rotulo: "Peito", unidade: "cm" },
  { chave: "coxa", rotulo: "Coxa", unidade: "cm" },
];

function dataCurta(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

export default async function EvolucaoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Ordem cronológica (mais antigo → mais novo) facilita gráfico e deltas
  const { data } = await supabase
    .from("checkins")
    .select(
      "id, peso, cintura, quadril, braco, peito, coxa, foto_path, observacoes, criado_em"
    )
    .eq("user_id", user.id)
    .order("criado_em", { ascending: true });

  const checkins = (data ?? []) as Checkin[];
  const total = checkins.length;

  // --- Signed URLs das fotos (bucket privado) ---
  const comFoto = checkins.filter((c) => c.foto_path);
  const fotosUrl = new Map<string, string>();
  if (comFoto.length > 0) {
    const { data: assinadas } = await supabase.storage
      .from("checkins")
      .createSignedUrls(
        comFoto.map((c) => c.foto_path as string),
        60 * 60 // 1 hora
      );
    assinadas?.forEach((a, i) => {
      if (a.signedUrl) fotosUrl.set(comFoto[i].id, a.signedUrl);
    });
  }

  const fotosComparador: FotoCheckin[] = comFoto
    .filter((c) => fotosUrl.has(c.id))
    .map((c) => ({
      id: c.id,
      dataLabel: new Date(c.criado_em).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      fotoUrl: fotosUrl.get(c.id) as string,
      peso: c.peso,
    }));

  const primeiro = checkins[0];
  const ultimo = checkins[total - 1];
  const variacaoPeso = ultimo && primeiro ? ultimo.peso - primeiro.peso : 0;

  return (
    <div className="flex flex-1 flex-col px-4 py-8 sm:py-12 bg-[#111111] animate-[fadeIn_0.4s_ease-out]">
      <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">
        {/* Header */}
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center h-9 w-9 rounded-full border border-white/20 text-white/70 hover:border-white/40 hover:text-white transition-all"
            >
              <ArrowLeft size={16} />
            </Link>
            <div className="flex flex-col">
              <h1 className="text-2xl sm:text-3xl font-[family-name:var(--font-bebas)] tracking-wide text-white">
                Evolução
              </h1>
              <p className="text-sm text-white/50">
                {total === 0
                  ? "Acompanhe peso, medidas e fotos ao longo do tempo."
                  : `${total} ${total === 1 ? "check-in" : "check-ins"} registrados`}
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/evolucao/novo"
            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-full bg-orange-400 text-black font-semibold text-sm hover:bg-orange-300 active:scale-95 transition-all whitespace-nowrap"
          >
            <Plus size={16} /> Check-in
          </Link>
        </header>

        {total === 0 ? (
          <div className="bg-white/[0.05] border border-dashed border-white/[0.12] rounded-2xl p-10 text-center flex flex-col items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-white/[0.08] flex items-center justify-center text-white/30">
              <LineChart size={24} />
            </div>
            <p className="font-medium text-white/60">Nenhum check-in ainda</p>
            <p className="text-sm text-white/30 max-w-sm">
              Registre seu primeiro check-in com peso, medidas e foto. Depois é
              só voltar de tempos em tempos pra ver sua evolução.
            </p>
            <Link
              href="/dashboard/evolucao/novo"
              className="mt-2 inline-flex items-center gap-1.5 h-11 px-5 rounded-full bg-orange-400 text-black font-semibold text-sm hover:bg-orange-300 active:scale-95 transition-all"
            >
              <Plus size={16} /> Fazer primeiro check-in
            </Link>
          </div>
        ) : (
          <>
            {/* Resumo */}
            <div className="grid grid-cols-3 gap-3">
              <ResumoCard
                label="Peso atual"
                value={`${ultimo.peso.toFixed(1)} kg`}
                highlight
              />
              <ResumoCard
                label="Variação total"
                value={
                  variacaoPeso === 0
                    ? "0 kg"
                    : `${variacaoPeso > 0 ? "+" : ""}${variacaoPeso.toFixed(1)} kg`
                }
                tendencia={
                  variacaoPeso < 0
                    ? "baixa"
                    : variacaoPeso > 0
                      ? "alta"
                      : "neutra"
                }
              />
              <ResumoCard label="Check-ins" value={String(total)} />
            </div>

            {/* Gráfico de peso */}
            {total >= 2 && (
              <section className="bg-white/[0.04] border border-white/[0.10] rounded-2xl p-5 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Scale size={16} className="text-orange-400" />
                  <h2 className="text-sm font-bold text-white/70 uppercase tracking-wider">
                    Peso ao longo do tempo
                  </h2>
                </div>
                <GraficoPeso checkins={checkins} />
              </section>
            )}

            {/* Evolução das medidas */}
            <section className="bg-white/[0.04] border border-white/[0.10] rounded-2xl p-5 flex flex-col gap-4">
              <h2 className="text-sm font-bold text-white/70 uppercase tracking-wider">
                Medidas atuais
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {MEDIDAS.map((m) => {
                  const serie = checkins
                    .map((c) => c[m.chave] as number | null)
                    .filter((v): v is number => v !== null);
                  if (serie.length === 0) {
                    return (
                      <MedidaCard
                        key={m.chave}
                        rotulo={m.rotulo}
                        atual={null}
                        delta={null}
                        unidade={m.unidade}
                      />
                    );
                  }
                  const atual = serie[serie.length - 1];
                  const delta =
                    serie.length >= 2 ? atual - serie[0] : null;
                  return (
                    <MedidaCard
                      key={m.chave}
                      rotulo={m.rotulo}
                      atual={atual}
                      delta={delta}
                      unidade={m.unidade}
                    />
                  );
                })}
              </div>
            </section>

            {/* Comparador antes/depois */}
            {fotosComparador.length >= 2 && (
              <section className="bg-white/[0.04] border border-white/[0.10] rounded-2xl p-5 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Camera size={16} className="text-orange-400" />
                  <h2 className="text-sm font-bold text-white/70 uppercase tracking-wider">
                    Antes e depois
                  </h2>
                </div>
                <ComparadorFotos fotos={fotosComparador} />
              </section>
            )}

            {/* Histórico */}
            <section className="flex flex-col gap-3">
              <h2 className="text-lg font-[family-name:var(--font-bebas)] tracking-wide text-white">
                Histórico de check-ins
              </h2>
              <ul className="flex flex-col gap-2">
                {[...checkins].reverse().map((c) => {
                  const medidasPreenchidas = MEDIDAS.filter(
                    (m) => c[m.chave] !== null
                  ).length;
                  return (
                    <li
                      key={c.id}
                      className="flex items-center gap-3 p-4 bg-white/[0.05] border border-white/[0.08] rounded-2xl"
                    >
                      <div className="h-10 w-10 rounded-xl bg-orange-400/10 border border-orange-400/20 flex items-center justify-center flex-shrink-0">
                        {c.foto_path && fotosUrl.has(c.id) ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={fotosUrl.get(c.id)}
                            alt=""
                            className="h-full w-full object-cover rounded-xl"
                          />
                        ) : (
                          <Scale size={16} className="text-orange-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white text-sm">
                          {c.peso.toFixed(1)} kg
                          {medidasPreenchidas > 0 && (
                            <span className="text-white/40 font-normal">
                              {" "}
                              · {medidasPreenchidas}{" "}
                              {medidasPreenchidas === 1 ? "medida" : "medidas"}
                            </span>
                          )}
                          {c.foto_path && (
                            <span className="text-orange-400/70 font-normal inline-flex items-center gap-0.5">
                              {" "}
                              · <Camera size={11} /> foto
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-white/40">
                          {new Date(c.criado_em).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                        {c.observacoes && (
                          <p className="text-xs text-white/30 mt-0.5 truncate">
                            {c.observacoes}
                          </p>
                        )}
                      </div>
                      <DeletarCheckinBotao id={c.id} />
                    </li>
                  );
                })}
              </ul>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

function ResumoCard({
  label,
  value,
  highlight,
  tendencia,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  tendencia?: "alta" | "baixa" | "neutra";
}) {
  const cor =
    tendencia === "baixa"
      ? "text-emerald-400"
      : tendencia === "alta"
        ? "text-orange-400"
        : highlight
          ? "text-orange-400"
          : "text-white";
  return (
    <div
      className={`flex flex-col gap-1 p-4 rounded-2xl border ${
        highlight
          ? "bg-orange-400/10 border-orange-400/30"
          : "bg-white/[0.05] border-white/[0.10]"
      }`}
    >
      <span className="text-[10px] text-white/40 uppercase tracking-wider font-medium">
        {label}
      </span>
      <span className={`font-bold text-lg ${cor}`}>{value}</span>
    </div>
  );
}

function MedidaCard({
  rotulo,
  atual,
  delta,
  unidade,
}: {
  rotulo: string;
  atual: number | null;
  delta: number | null;
  unidade: string;
}) {
  return (
    <div className="flex flex-col gap-1 p-3 rounded-xl bg-white/[0.04] border border-white/[0.08]">
      <span className="text-[10px] text-white/40 uppercase tracking-wider font-medium">
        {rotulo}
      </span>
      {atual === null ? (
        <span className="text-sm text-white/25">—</span>
      ) : (
        <div className="flex items-baseline gap-1.5">
          <span className="font-bold text-base text-white">
            {atual.toFixed(1)}
            <span className="text-xs text-white/40 font-normal"> {unidade}</span>
          </span>
          {delta !== null && delta !== 0 && (
            <span
              className={`inline-flex items-center text-[11px] font-semibold ${
                delta < 0 ? "text-emerald-400" : "text-orange-400"
              }`}
            >
              {delta < 0 ? (
                <TrendingDown size={11} />
              ) : (
                <TrendingUp size={11} />
              )}
              {delta > 0 ? "+" : ""}
              {delta.toFixed(1)}
            </span>
          )}
          {delta === 0 && (
            <span className="inline-flex items-center text-[11px] text-white/30">
              <Minus size={11} />
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Gráfico de linha simples (SVG puro, renderizado no servidor) do peso.
 */
function GraficoPeso({ checkins }: { checkins: Checkin[] }) {
  const W = 320;
  const H = 140;
  const padX = 8;
  const padY = 16;

  const pesos = checkins.map((c) => c.peso);
  const min = Math.min(...pesos);
  const max = Math.max(...pesos);
  const range = max - min || 1;

  const innerW = W - padX * 2;
  const innerH = H - padY * 2;

  const pontos = checkins.map((c, i) => {
    const x =
      checkins.length === 1
        ? W / 2
        : padX + (i / (checkins.length - 1)) * innerW;
    const y = padY + (1 - (c.peso - min) / range) * innerH;
    return { x, y, peso: c.peso };
  });

  const linha = pontos.map((p) => `${p.x},${p.y}`).join(" ");
  const area = `${padX},${H - padY} ${linha} ${W - padX},${H - padY}`;

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        preserveAspectRatio="none"
        role="img"
        aria-label="Gráfico de evolução do peso"
      >
        <defs>
          <linearGradient id="pesoFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Área */}
        <polygon points={area} fill="url(#pesoFill)" />

        {/* Linha */}
        <polyline
          points={linha}
          fill="none"
          stroke="#fb923c"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {/* Pontos */}
        {pontos.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="#fb923c" />
        ))}
      </svg>

      {/* Eixo de datas (primeira e última) */}
      <div className="flex justify-between mt-1 text-[10px] text-white/30">
        <span>{dataCurta(checkins[0].criado_em)}</span>
        <span className="text-white/40">
          {min.toFixed(1)}–{max.toFixed(1)} kg
        </span>
        <span>{dataCurta(checkins[checkins.length - 1].criado_em)}</span>
      </div>
    </div>
  );
}
