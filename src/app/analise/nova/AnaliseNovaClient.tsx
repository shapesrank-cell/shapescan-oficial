"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import {
  Camera,
  Sparkles,
  X,
  Settings,
  Target,
  Dumbbell,
  Utensils,
  ChevronDown,
  Plus,
} from "lucide-react";

type Perfil = {
  nome: string;
  sexo: "masculino" | "feminino" | "outro";
  idade: number;
  peso: number;
  altura: number;
  nivelAtividade: "sedentario" | "leve" | "moderado" | "intenso";
  objetivo: "emagrecer" | "ganhar_massa" | "definir" | "saude_geral";
};

// Espelha PreferenciasAnalise de @/lib/gemini (não importamos de lá pra não
// puxar o SDK do Gemini pro bundle do cliente).
type PrazoV = "1_mes" | "3_meses" | "6_meses" | "sem_pressa";
type LocalV = "academia" | "casa" | "ar_livre";
type ExpV = "iniciante" | "intermediario" | "avancado";
type RestricaoV = "lactose" | "gluten" | "vegetariano" | "vegano";
type OrcamentoV = "economico" | "medio" | "sem_limite";

type Preferencias = {
  pesoAlvo?: number | null;
  prazo?: PrazoV | null;
  diasSemana?: number | null;
  local?: LocalV | null;
  experiencia?: ExpV | null;
  lesoes?: string | null;
  restricoes?: RestricaoV[] | null;
  evita?: string | null;
  refeicoesDia?: number | null;
  orcamento?: OrcamentoV | null;
};

const OBJETIVO_LABEL: Record<Perfil["objetivo"], string> = {
  emagrecer: "Emagrecer",
  ganhar_massa: "Ganhar massa",
  definir: "Definir",
  saude_geral: "Saúde geral",
};

const ATIVIDADE_LABEL: Record<Perfil["nivelAtividade"], string> = {
  sedentario: "Sedentário",
  leve: "Leve",
  moderado: "Moderado",
  intenso: "Intenso",
};

const PRAZO_OPCOES = [
  { v: "1_mes", l: "1 mês" },
  { v: "3_meses", l: "3 meses" },
  { v: "6_meses", l: "6 meses" },
  { v: "sem_pressa", l: "Sem pressa" },
] as const;

const LOCAL_OPCOES = [
  { v: "academia", l: "Academia" },
  { v: "casa", l: "Em casa" },
  { v: "ar_livre", l: "Ao ar livre" },
] as const;

const EXPERIENCIA_OPCOES = [
  { v: "iniciante", l: "Iniciante" },
  { v: "intermediario", l: "Intermediário" },
  { v: "avancado", l: "Avançado" },
] as const;

const RESTRICAO_OPCOES = [
  { v: "lactose", l: "Sem lactose" },
  { v: "gluten", l: "Sem glúten" },
  { v: "vegetariano", l: "Vegetariano" },
  { v: "vegano", l: "Vegano" },
] as const;

const ORCAMENTO_OPCOES = [
  { v: "economico", l: "Econômico" },
  { v: "medio", l: "Médio" },
  { v: "sem_limite", l: "Sem limite" },
] as const;

async function redimensionarImagem(
  file: File
): Promise<{ base64: string; mimeType: string; preview: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const MAX = 800;
        let w = img.width;
        let h = img.height;
        if (w > MAX || h > MAX) {
          if (w > h) {
            h = Math.round((h * MAX) / w);
            w = MAX;
          } else {
            w = Math.round((w * MAX) / h);
            h = MAX;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        const base64 = dataUrl.split(",")[1];
        resolve({ base64, mimeType: "image/jpeg", preview: dataUrl });
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

type Foto = { base64: string; mimeType: string };
type AnguloFoto = "frente" | "costas" | "lado";

const FOTOS_CORPO: {
  angulo: AnguloFoto;
  rotulo: string;
  badge: string;
  dica: string;
}[] = [
  { angulo: "frente", rotulo: "Frente", badge: "Recomendada", dica: "De frente, braços levemente abertos" },
  { angulo: "costas", rotulo: "Costas", badge: "Opcional", dica: "De costas, braços abertos" },
  { angulo: "lado", rotulo: "Lado", badge: "Opcional", dica: "De perfil, postura neutra" },
];

export function AnaliseNovaClient({
  perfil,
  preferenciasIniciais,
}: {
  perfil: Perfil;
  preferenciasIniciais?: Preferencias | null;
}) {
  const router = useRouter();

  // Seções opcionais colapsadas (foto primeiro: tudo o resto começa fechado)
  const [mostrarAngulos, setMostrarAngulos] = useState(false);
  const [mostrarPlano, setMostrarPlano] = useState(false);

  // Fotos do corpo atual (até 3 ângulos) + foto de referência
  const [fotosCorpo, setFotosCorpo] = useState<Record<AnguloFoto, Foto | null>>(
    { frente: null, costas: null, lado: null }
  );
  const [previewsCorpo, setPreviewsCorpo] = useState<Record<AnguloFoto, string>>(
    { frente: "", costas: "", lado: "" }
  );
  const [fotoRef, setFotoRef] = useState<Foto | null>(null);
  const [fotoRefPreview, setFotoRefPreview] = useState("");
  const [processando, setProcessando] = useState<AnguloFoto | "ref" | null>(
    null
  );

  // Preferências (pré-preenchidas com a última análise)
  const ini = preferenciasIniciais ?? {};
  const [pesoAlvo, setPesoAlvo] = useState(
    ini.pesoAlvo != null ? String(ini.pesoAlvo) : ""
  );
  const [prazo, setPrazo] = useState<PrazoV | "">(ini.prazo ?? "");
  const [diasSemana, setDiasSemana] = useState<number | null>(
    ini.diasSemana ?? null
  );
  const [local, setLocal] = useState<LocalV | "">(ini.local ?? "");
  const [experiencia, setExperiencia] = useState<ExpV | "">(
    ini.experiencia ?? ""
  );
  const [lesoes, setLesoes] = useState(ini.lesoes ?? "");
  const [restricoes, setRestricoes] = useState<RestricaoV[]>(
    ini.restricoes ?? []
  );
  const [evita, setEvita] = useState(ini.evita ?? "");
  const [refeicoesDia, setRefeicoesDia] = useState<number | null>(
    ini.refeicoesDia ?? null
  );
  const [orcamento, setOrcamento] = useState<OrcamentoV | "">(
    ini.orcamento ?? ""
  );

  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const temPrefill = Boolean(preferenciasIniciais);

  async function handleFile(file: File | undefined, qual: AnguloFoto | "ref") {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErro("Arraste um arquivo de imagem (JPG, PNG ou WebP).");
      return;
    }
    setProcessando(qual);
    setErro(null);
    try {
      const { base64, mimeType, preview } = await redimensionarImagem(file);
      if (qual === "ref") {
        setFotoRef({ base64, mimeType });
        setFotoRefPreview(preview);
      } else {
        setFotosCorpo((s) => ({ ...s, [qual]: { base64, mimeType } }));
        setPreviewsCorpo((s) => ({ ...s, [qual]: preview }));
      }
    } catch {
      setErro("Não foi possível processar a foto. Tente outra imagem.");
    } finally {
      setProcessando(null);
    }
  }

  function removerFotoCorpo(a: AnguloFoto) {
    setFotosCorpo((s) => ({ ...s, [a]: null }));
    setPreviewsCorpo((s) => ({ ...s, [a]: "" }));
  }

  const algumaFotoCorpo =
    !!fotosCorpo.frente || !!fotosCorpo.costas || !!fotosCorpo.lado;

  function toggleRestricao(v: NonNullable<Preferencias["restricoes"]>[number]) {
    setRestricoes((atual) =>
      atual.includes(v) ? atual.filter((r) => r !== v) : [...atual, v]
    );
  }

  function montarPreferencias(): Preferencias {
    const p: Preferencias = {};
    const peso = Number(pesoAlvo.replace(",", "."));
    if (pesoAlvo.trim() && Number.isFinite(peso)) p.pesoAlvo = peso;
    if (prazo) p.prazo = prazo;
    if (diasSemana) p.diasSemana = diasSemana;
    if (local) p.local = local;
    if (experiencia) p.experiencia = experiencia;
    if (lesoes.trim()) p.lesoes = lesoes.trim();
    if (restricoes.length) p.restricoes = restricoes;
    if (evita.trim()) p.evita = evita.trim();
    if (refeicoesDia) p.refeicoesDia = refeicoesDia;
    if (orcamento) p.orcamento = orcamento;
    return p;
  }

  async function gerarAnalise() {
    setEnviando(true);
    setErro(null);

    try {
      const preferencias = montarPreferencias();
      const resposta = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: perfil.nome,
          sexo: perfil.sexo,
          idade: perfil.idade,
          peso: perfil.peso,
          altura: perfil.altura,
          nivelAtividade: perfil.nivelAtividade,
          objetivo: perfil.objetivo,
          ...(algumaFotoCorpo && {
            fotos: FOTOS_CORPO.map((f) => f.angulo)
              .filter((a) => fotosCorpo[a])
              .map((a) => ({
                data: fotosCorpo[a]!.base64,
                mimeType: fotosCorpo[a]!.mimeType,
                angulo: a,
              })),
          }),
          ...(fotoRef && {
            fotoReferencia: fotoRef.base64,
            fotoReferenciaMimeType: fotoRef.mimeType,
          }),
          ...(Object.keys(preferencias).length > 0 && { preferencias }),
        }),
      });

      const dados = await resposta.json();
      if (!resposta.ok) {
        throw new Error(dados.erro || "Erro desconhecido");
      }

      if (dados.id) {
        router.push(`/dashboard/analise/${dados.id}`);
      } else {
        setErro(
          dados.alerta ||
            "Análise gerada mas não foi possível redirecionar. Volte ao dashboard."
        );
        setEnviando(false);
      }
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro inesperado");
      setEnviando(false);
    }
  }

  if (enviando) {
    return <GerandoAnalise temFoto={algumaFotoCorpo || !!fotoRef} />;
  }

  return (
    <div className="flex flex-col gap-5">
      {/* ========== HERÓI: FOTO DO CORPO ========== */}
      <div className="bg-gradient-to-b from-orange-400/[0.10] to-white/[0.02] border border-orange-400/25 rounded-3xl p-5 sm:p-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-orange-400">
            <Camera size={18} />
            <h2 className="text-sm font-bold uppercase tracking-wider">
              Sua foto
            </h2>
          </div>
          <p className="text-sm text-white/55 leading-relaxed">
            Tire uma foto <strong className="text-white/85">de frente</strong> e
            receba seu ranking na hora. Tudo o resto é opcional.
          </p>
        </div>

        {/* Foto de frente — protagonista */}
        <UploadFoto
          preview={previewsCorpo.frente}
          processando={processando === "frente"}
          onFile={(f) => handleFile(f, "frente")}
          onRemove={() => removerFotoCorpo("frente")}
          textoVazio="Tirar ou enviar foto de frente"
        />

        {/* Ângulos extras (colapsado) */}
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => setMostrarAngulos((v) => !v)}
            className="self-start inline-flex items-center gap-1.5 text-xs font-medium text-white/55 hover:text-white transition-colors"
          >
            <Plus size={13} className={mostrarAngulos ? "rotate-45 transition-transform" : "transition-transform"} />
            Adicionar costas e lado
            <span className="text-white/30">(ranking ainda mais preciso)</span>
          </button>

          {mostrarAngulos && (
            <div className="grid grid-cols-2 gap-3 animate-[fadeIn_0.25s_ease-out]">
              {FOTOS_CORPO.filter((f) => f.angulo !== "frente").map((f) => (
                <div key={f.angulo} className="flex flex-col gap-1.5">
                  <span className="text-[11px] text-white/60 uppercase tracking-wider font-semibold">
                    {f.rotulo}
                  </span>
                  <UploadFoto
                    preview={previewsCorpo[f.angulo]}
                    processando={processando === f.angulo}
                    onFile={(file) => handleFile(file, f.angulo)}
                    onRemove={() => removerFotoCorpo(f.angulo)}
                    textoVazio={f.dica}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="text-[10px] text-white/30">
          Braços levemente abertos (~30°), postura neutra e boa luz. As fotos são
          processadas e descartadas — não ficam salvas.
        </p>
      </div>

      {erro && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30">
          <p className="text-sm text-red-400">
            <strong>Erro:</strong> {erro}
          </p>
        </div>
      )}

      {/* ========== CTA PRINCIPAL: GERAR ========== */}
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={gerarAnalise}
          disabled={enviando || processando !== null}
          className="h-14 rounded-full bg-orange-400 text-black font-bold text-base hover:bg-orange-300 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
        >
          <Sparkles size={20} />
          Gerar minha análise
        </button>
        <p className="text-center text-xs text-white/40">
          {algumaFotoCorpo
            ? "Pronto! A IA vai analisar sua foto e montar seu ranking."
            : "Pode gerar sem foto — mas com foto o ranking fica muito melhor."}
        </p>
      </div>

      {/* ========== PERSONALIZAR PLANO (colapsado) ========== */}
      <div className="border border-white/[0.10] rounded-2xl overflow-hidden">
        <button
          type="button"
          onClick={() => setMostrarPlano((v) => !v)}
          className="w-full flex items-center justify-between p-4 hover:bg-white/[0.03] transition-colors"
        >
          <span className="flex items-center gap-2 text-sm font-semibold text-white/80">
            <Settings size={16} className="text-orange-400" />
            Personalizar treino e dieta
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/[0.06] text-white/40 font-medium">
              opcional
            </span>
          </span>
          <ChevronDown
            size={18}
            className={`text-white/40 transition-transform ${mostrarPlano ? "rotate-180" : ""}`}
          />
        </button>

        {mostrarPlano && (
          <div className="px-4 pb-4 flex flex-col gap-5 animate-[fadeIn_0.25s_ease-out]">
            <p className="text-xs text-white/40">
              Quanto mais você conta, mais personalizado fica o treino e a dieta
              do seu plano.
            </p>

            {temPrefill && (
              <p className="text-xs text-white/40 -mt-2">
                Preenchemos com as respostas da sua última análise. Mude só o que
                mudou na sua rotina.
              </p>
            )}

            {/* Meta */}
            <Secao icone={<Target size={16} />} titulo="Meta desta análise">
              <div className="flex flex-col gap-4">
                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] text-white/50 uppercase tracking-wider font-medium">
                    Peso-alvo (opcional)
                  </span>
                  <div className="relative max-w-[160px]">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={pesoAlvo}
                      onChange={(e) =>
                        setPesoAlvo(
                          e.target.value.replace(",", ".").replace(/[^0-9.]/g, "")
                        )
                      }
                      placeholder="Ex: 75"
                      className="w-full h-11 pl-3 pr-10 rounded-xl bg-white/[0.05] border border-white/[0.12] text-white placeholder:text-white/25 focus:border-orange-400/50 focus:outline-none transition-colors"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/30">
                      kg
                    </span>
                  </div>
                </label>

                <CampoChips
                  rotulo="Em quanto tempo?"
                  opcoes={PRAZO_OPCOES}
                  valor={prazo}
                  onSelect={(v) => setPrazo(prazo === v ? "" : v)}
                />

                <div className="flex flex-col gap-2">
                  <span className="text-[11px] text-white/50 uppercase tracking-wider font-medium">
                    Foto de shape de referência (opcional)
                  </span>
                  <p className="text-[11px] text-white/35">
                    Um físico que você quer alcançar — a IA usa como direção do
                    plano, com metas realistas pro seu corpo.
                  </p>
                  <UploadFoto
                    preview={fotoRefPreview}
                    processando={processando === "ref"}
                    onFile={(f) => handleFile(f, "ref")}
                    onRemove={() => {
                      setFotoRef(null);
                      setFotoRefPreview("");
                    }}
                    textoVazio="Escolher foto de referência"
                  />
                </div>
              </div>
            </Secao>

            {/* Treino */}
            <Secao icone={<Dumbbell size={16} />} titulo="Sua rotina de treino">
              <div className="flex flex-col gap-4">
                <CampoChips
                  rotulo="Dias por semana que pode treinar"
                  opcoes={[2, 3, 4, 5, 6].map((n) => ({ v: n, l: `${n}x` }))}
                  valor={diasSemana}
                  onSelect={(v) => setDiasSemana(diasSemana === v ? null : v)}
                />
                <CampoChips
                  rotulo="Onde você treina"
                  opcoes={LOCAL_OPCOES}
                  valor={local}
                  onSelect={(v) => setLocal(local === v ? "" : v)}
                />
                <CampoChips
                  rotulo="Sua experiência"
                  opcoes={EXPERIENCIA_OPCOES}
                  valor={experiencia}
                  onSelect={(v) => setExperiencia(experiencia === v ? "" : v)}
                />
                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] text-white/50 uppercase tracking-wider font-medium">
                    Lesões ou limitações (opcional)
                  </span>
                  <input
                    type="text"
                    value={lesoes}
                    onChange={(e) => setLesoes(e.target.value.slice(0, 200))}
                    placeholder="Ex: dor no joelho, hérnia de disco..."
                    className="w-full h-11 px-3 rounded-xl bg-white/[0.05] border border-white/[0.12] text-white placeholder:text-white/25 focus:border-orange-400/50 focus:outline-none transition-colors text-sm"
                  />
                </label>
              </div>
            </Secao>

            {/* Dieta */}
            <Secao icone={<Utensils size={16} />} titulo="Sua alimentação">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] text-white/50 uppercase tracking-wider font-medium">
                    Restrições (pode marcar mais de uma)
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {RESTRICAO_OPCOES.map((o) => (
                      <Chip
                        key={o.v}
                        ativo={restricoes.includes(o.v)}
                        onClick={() => toggleRestricao(o.v)}
                      >
                        {o.l}
                      </Chip>
                    ))}
                  </div>
                </div>

                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] text-white/50 uppercase tracking-wider font-medium">
                    Alimentos que você NÃO gosta (opcional)
                  </span>
                  <input
                    type="text"
                    value={evita}
                    onChange={(e) => setEvita(e.target.value.slice(0, 200))}
                    placeholder="Ex: peixe, fígado, brócolis..."
                    className="w-full h-11 px-3 rounded-xl bg-white/[0.05] border border-white/[0.12] text-white placeholder:text-white/25 focus:border-orange-400/50 focus:outline-none transition-colors text-sm"
                  />
                </label>

                <CampoChips
                  rotulo="Refeições por dia"
                  opcoes={[3, 4, 5, 6].map((n) => ({ v: n, l: String(n) }))}
                  valor={refeicoesDia}
                  onSelect={(v) => setRefeicoesDia(refeicoesDia === v ? null : v)}
                />

                <CampoChips
                  rotulo="Orçamento pra comida"
                  opcoes={ORCAMENTO_OPCOES}
                  valor={orcamento}
                  onSelect={(v) => setOrcamento(orcamento === v ? "" : v)}
                />
              </div>
            </Secao>
          </div>
        )}
      </div>

      {/* Dados salvos do perfil — rodapé discreto */}
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[11px] font-bold text-white/40 uppercase tracking-wider">
            Seus dados salvos
          </h2>
          <Link
            href="/perfil"
            className="text-xs text-orange-400/80 hover:text-orange-400 hover:underline inline-flex items-center gap-1"
          >
            <Settings size={11} /> Editar
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <Info label="Sexo" valor={capitalizar(perfil.sexo)} />
          <Info label="Idade" valor={`${perfil.idade} anos`} />
          <Info label="Peso" valor={`${perfil.peso} kg`} />
          <Info label="Altura" valor={`${perfil.altura} cm`} />
          <Info label="Atividade" valor={ATIVIDADE_LABEL[perfil.nivelAtividade]} />
          <Info label="Objetivo" valor={OBJETIVO_LABEL[perfil.objetivo]} />
        </div>
      </div>
    </div>
  );
}

/* ---------------- Subcomponentes ---------------- */

function Secao({
  icone,
  titulo,
  children,
}: {
  icone: React.ReactNode;
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white/[0.04] border border-white/[0.10] rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-center gap-2 text-orange-400">
        {icone}
        <h2 className="text-sm font-bold text-white/70 uppercase tracking-wider">
          {titulo}
        </h2>
      </div>
      {children}
    </div>
  );
}

function CampoChips<T extends string | number>({
  rotulo,
  opcoes,
  valor,
  onSelect,
}: {
  rotulo: string;
  opcoes: readonly { v: T; l: string }[];
  valor: T | null | "";
  onSelect: (v: T) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[11px] text-white/50 uppercase tracking-wider font-medium">
        {rotulo}
      </span>
      <div className="flex flex-wrap gap-2">
        {opcoes.map((o) => (
          <Chip
            key={String(o.v)}
            ativo={valor === o.v}
            onClick={() => onSelect(o.v)}
          >
            {o.l}
          </Chip>
        ))}
      </div>
    </div>
  );
}

function Chip({
  ativo,
  onClick,
  children,
}: {
  ativo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 h-10 rounded-full text-sm font-medium border transition-all active:scale-95 ${
        ativo
          ? "bg-orange-400 text-black border-orange-400"
          : "bg-white/[0.05] text-white/70 border-white/[0.12] hover:border-white/30 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function UploadFoto({
  preview,
  processando,
  onFile,
  onRemove,
  textoVazio,
}: {
  preview: string;
  processando: boolean;
  onFile: (file: File | undefined) => void;
  onRemove: () => void;
  textoVazio: string;
}) {
  const [arrastando, setArrastando] = useState(false);

  if (preview) {
    return (
      <div className="flex flex-col items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={preview}
          alt="Pré-visualização"
          className="w-40 h-40 sm:w-48 sm:h-48 object-cover rounded-2xl border-2 border-orange-400/50 shadow-lg shadow-orange-400/10"
        />
        <button
          type="button"
          onClick={onRemove}
          className="text-sm text-red-400 hover:text-red-300 transition-colors inline-flex items-center gap-1"
        >
          <X size={13} /> Remover foto
        </button>
      </div>
    );
  }

  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        if (!processando) setArrastando(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setArrastando(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setArrastando(false);
        if (processando) return;
        onFile(e.dataTransfer.files?.[0]);
      }}
      className={`flex flex-col items-center gap-2 p-6 rounded-xl border-2 border-dashed transition-colors cursor-pointer ${
        arrastando
          ? "border-orange-400 bg-orange-400/[0.10]"
          : "border-white/[0.15] bg-white/[0.04] hover:border-orange-400/40 hover:bg-white/[0.06]"
      }`}
    >
      <div className="w-10 h-10 rounded-lg bg-white/[0.08] flex items-center justify-center text-white/40">
        <Camera size={18} />
      </div>
      <p className="text-sm font-medium text-white/60 text-center">
        {processando
          ? "Processando..."
          : arrastando
            ? "Solte a imagem aqui"
            : textoVazio}
      </p>
      <p className="text-[10px] text-white/30">
        Arraste e solte ou clique · JPG, PNG, WebP — máx. 5MB
      </p>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => onFile(e.target.files?.[0])}
        className="hidden"
        disabled={processando}
      />
    </label>
  );
}

function Info({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] text-white/40 uppercase tracking-wider font-medium">
        {label}
      </span>
      <span className="text-sm font-bold text-white capitalize">{valor}</span>
    </div>
  );
}

function capitalizar(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "—";
}

function GerandoAnalise({ temFoto }: { temFoto: boolean }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="flex flex-col items-center gap-6 max-w-md text-center">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 rounded-3xl bg-orange-400 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-bold text-black">S</span>
          </div>
          <div className="absolute -inset-3 rounded-3xl bg-orange-400 blur-xl opacity-20 animate-pulse" />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-xl font-[family-name:var(--font-bebas)] tracking-wide text-white">
            {temFoto ? "Analisando com IA + foto" : "Gerando análise"}
          </p>
          <p className="text-sm text-white/50">
            Montando seu plano personalizado em instantes...
          </p>
        </div>
        <div className="w-full max-w-xs bg-white/[0.08] rounded-full h-1.5 overflow-hidden">
          <div className="h-full bg-orange-400 rounded-full animate-[progress_15s_ease-out_forwards]" />
        </div>
      </div>
    </div>
  );
}
