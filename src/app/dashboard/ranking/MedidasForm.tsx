"use client";

/**
 * Form enxuto de medidas na aba Ranking. Salva via a MESMA action de check-in
 * (criarCheckin) — então entra na Evolução e alimenta a próxima análise/ranking.
 * Sem foto/observações aqui (a Evolução tem o fluxo completo).
 */
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Ruler, Scale, Save, Check, User } from "lucide-react";
import { salvarMedidasRanking } from "./actions";

type ChaveCampo =
  | "peso"
  | "altura"
  | "idade"
  | "peito"
  | "braco"
  | "cintura"
  | "quadril"
  | "coxa";

type Campo = {
  chave: ChaveCampo;
  rotulo: string;
  unidade: string;
  obrigatorio?: boolean;
  grupo: "perfil" | "medidas";
};

const CAMPOS: Campo[] = [
  { chave: "altura", rotulo: "Altura", unidade: "cm", grupo: "perfil" },
  { chave: "idade", rotulo: "Idade", unidade: "anos", grupo: "perfil" },
  { chave: "peso", rotulo: "Peso", unidade: "kg", obrigatorio: true, grupo: "medidas" },
  { chave: "peito", rotulo: "Peito", unidade: "cm", grupo: "medidas" },
  { chave: "braco", rotulo: "Braço", unidade: "cm", grupo: "medidas" },
  { chave: "cintura", rotulo: "Cintura", unidade: "cm", grupo: "medidas" },
  { chave: "quadril", rotulo: "Quadril", unidade: "cm", grupo: "medidas" },
  { chave: "coxa", rotulo: "Coxa", unidade: "cm", grupo: "medidas" },
];

export type MedidasIniciais = Record<ChaveCampo, number | null>;

export function MedidasForm({ iniciais }: { iniciais: MedidasIniciais }) {
  const router = useRouter();

  const paraTexto = (v: number | null) => (v === null ? "" : String(v));
  const [valores, setValores] = useState<Record<ChaveCampo, string>>({
    altura: paraTexto(iniciais.altura),
    idade: paraTexto(iniciais.idade),
    peso: paraTexto(iniciais.peso),
    peito: paraTexto(iniciais.peito),
    braco: paraTexto(iniciais.braco),
    cintura: paraTexto(iniciais.cintura),
    quadril: paraTexto(iniciais.quadril),
    coxa: paraTexto(iniciais.coxa),
  });
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);

  function setCampo(chave: ChaveCampo, valor: string) {
    const limpo = valor.replace(",", ".").replace(/[^0-9.]/g, "");
    setValores((v) => ({ ...v, [chave]: limpo }));
    setSalvo(false);
  }

  function parseNum(s: string): number | null {
    if (s.trim() === "") return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  }

  async function salvar() {
    setErro(null);
    const peso = parseNum(valores.peso);
    if (peso === null) {
      setErro("Informe o peso — é o único campo obrigatório.");
      return;
    }

    setEnviando(true);
    const resultado = await salvarMedidasRanking({
      altura: parseNum(valores.altura),
      idade: parseNum(valores.idade),
      peso,
      peito: parseNum(valores.peito),
      braco: parseNum(valores.braco),
      cintura: parseNum(valores.cintura),
      quadril: parseNum(valores.quadril),
      coxa: parseNum(valores.coxa),
    });

    if ("erro" in resultado) {
      setErro(resultado.erro ?? "Erro ao salvar as medidas.");
      setEnviando(false);
      return;
    }

    setEnviando(false);
    setSalvo(true);
    router.refresh();
  }

  function renderCampo(campo: Campo) {
    return (
      <label key={campo.chave} className="flex flex-col gap-1.5">
        <span className="text-[11px] text-white/50 uppercase tracking-wider font-medium flex items-center gap-1">
          {campo.chave === "peso" ? <Scale size={11} /> : <Ruler size={11} />}
          {campo.rotulo}
          {campo.obrigatorio && <span className="text-orange-400">*</span>}
        </span>
        <div className="relative">
          <input
            type="text"
            inputMode="decimal"
            value={valores[campo.chave]}
            onChange={(e) => setCampo(campo.chave, e.target.value)}
            placeholder="0"
            className="w-full h-11 pl-3 pr-12 rounded-xl bg-white/[0.05] border border-white/[0.12] text-white placeholder:text-white/25 focus:border-orange-400/50 focus:outline-none transition-colors"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/30">
            {campo.unidade}
          </span>
        </div>
      </label>
    );
  }

  return (
    <section className="rounded-2xl border border-white/[0.10] bg-white/[0.04] p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-1">
        <Ruler size={18} className="text-orange-400" />
        <h2 className="text-lg sm:text-xl font-[family-name:var(--font-bebas)] tracking-wide text-white">
          Suas medidas
        </h2>
      </div>
      <p className="text-xs text-white/40 mb-4">
        Quanto mais medidas você preenche, mais preciso fica o ranking. Salva na
        sua Evolução e entra na <strong className="text-white/60">próxima
        análise com foto</strong>.
      </p>

      {/* Perfil: altura e idade (dados fixos) */}
      <div className="flex items-center gap-1.5 mb-2">
        <User size={12} className="text-white/40" />
        <span className="text-[11px] text-white/40 uppercase tracking-wider font-semibold">
          Perfil
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
        {CAMPOS.filter((c) => c.grupo === "perfil").map(renderCampo)}
      </div>

      {/* Peso e circunferências (vira um check-in) */}
      <div className="flex items-center gap-1.5 mb-2">
        <Ruler size={12} className="text-white/40" />
        <span className="text-[11px] text-white/40 uppercase tracking-wider font-semibold">
          Peso e medidas
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {CAMPOS.filter((c) => c.grupo === "medidas").map(renderCampo)}
      </div>

      {erro && (
        <p className="mt-3 text-sm text-red-400">
          <strong>Erro:</strong> {erro}
        </p>
      )}

      <button
        type="button"
        onClick={salvar}
        disabled={enviando}
        className={`mt-4 w-full h-12 rounded-xl font-semibold inline-flex items-center justify-center gap-2 transition-all disabled:opacity-50 ${
          salvo
            ? "bg-green-500/15 text-green-400 border border-green-500/30"
            : "bg-orange-400 text-black hover:bg-orange-300 active:scale-[0.99]"
        }`}
      >
        {salvo ? (
          <>
            <Check size={18} /> Medidas salvas!
          </>
        ) : (
          <>
            <Save size={18} /> {enviando ? "Salvando..." : "Salvar medidas"}
          </>
        )}
      </button>
      {salvo && (
        <p className="mt-2 text-[11px] text-white/40 text-center">
          Pronto! Gere uma nova análise com foto pra ver o ranking recalculado
          com essas medidas.
        </p>
      )}
    </section>
  );
}
