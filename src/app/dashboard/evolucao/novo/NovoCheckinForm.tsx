"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Camera, X, Save, Scale, Ruler } from "lucide-react";
import { criarCheckin } from "../actions";

type Medidas = {
  peso: number | null;
  cintura: number | null;
  quadril: number | null;
  braco: number | null;
  peito: number | null;
  coxa: number | null;
  ombros: number | null;
  panturrilha: number | null;
  antebraco: number | null;
  pescoco: number | null;
};

const CAMPOS: {
  chave: keyof Medidas;
  rotulo: string;
  unidade: string;
  obrigatorio?: boolean;
}[] = [
  { chave: "peso", rotulo: "Peso", unidade: "kg", obrigatorio: true },
  { chave: "peito", rotulo: "Peito", unidade: "cm" },
  { chave: "ombros", rotulo: "Ombros", unidade: "cm" },
  { chave: "braco", rotulo: "Braço", unidade: "cm" },
  { chave: "antebraco", rotulo: "Antebraço", unidade: "cm" },
  { chave: "cintura", rotulo: "Cintura", unidade: "cm" },
  { chave: "quadril", rotulo: "Quadril", unidade: "cm" },
  { chave: "coxa", rotulo: "Coxa", unidade: "cm" },
  { chave: "panturrilha", rotulo: "Panturrilha", unidade: "cm" },
  { chave: "pescoco", rotulo: "Pescoço", unidade: "cm" },
];

// Mesma lógica de redimensionamento usada na análise (máx 800px, jpeg 0.7)
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

export function NovoCheckinForm({
  valoresIniciais,
}: {
  valoresIniciais: Medidas;
}) {
  const router = useRouter();

  const paraTexto = (v: number | null) => (v === null ? "" : String(v));
  const [valores, setValores] = useState<Record<keyof Medidas, string>>({
    peso: paraTexto(valoresIniciais.peso),
    cintura: paraTexto(valoresIniciais.cintura),
    quadril: paraTexto(valoresIniciais.quadril),
    braco: paraTexto(valoresIniciais.braco),
    peito: paraTexto(valoresIniciais.peito),
    coxa: paraTexto(valoresIniciais.coxa),
    ombros: paraTexto(valoresIniciais.ombros),
    panturrilha: paraTexto(valoresIniciais.panturrilha),
    antebraco: paraTexto(valoresIniciais.antebraco),
    pescoco: paraTexto(valoresIniciais.pescoco),
  });
  const [observacoes, setObservacoes] = useState("");
  const [foto, setFoto] = useState<{ base64: string; mimeType: string } | null>(
    null
  );
  const [fotoPreview, setFotoPreview] = useState("");
  const [processandoFoto, setProcessandoFoto] = useState(false);
  const [arrastandoFoto, setArrastandoFoto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function setCampo(chave: keyof Medidas, valor: string) {
    // Aceita só número com vírgula/ponto
    const limpo = valor.replace(",", ".").replace(/[^0-9.]/g, "");
    setValores((v) => ({ ...v, [chave]: limpo }));
  }

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErro("Arraste um arquivo de imagem (JPG, PNG ou WebP).");
      return;
    }
    setProcessandoFoto(true);
    setErro(null);
    try {
      const { base64, mimeType, preview } = await redimensionarImagem(file);
      setFoto({ base64, mimeType });
      setFotoPreview(preview);
    } catch {
      setErro("Não foi possível processar a foto. Tente outra imagem.");
    } finally {
      setProcessandoFoto(false);
    }
  }

  function removerFoto() {
    setFoto(null);
    setFotoPreview("");
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
    const resultado = await criarCheckin({
      peso,
      cintura: parseNum(valores.cintura),
      quadril: parseNum(valores.quadril),
      braco: parseNum(valores.braco),
      peito: parseNum(valores.peito),
      coxa: parseNum(valores.coxa),
      ombros: parseNum(valores.ombros),
      panturrilha: parseNum(valores.panturrilha),
      antebraco: parseNum(valores.antebraco),
      pescoco: parseNum(valores.pescoco),
      observacoes: observacoes.trim() || null,
      ...(foto && { foto: foto.base64, fotoMimeType: foto.mimeType }),
    });

    if ("erro" in resultado) {
      setErro(resultado.erro ?? "Erro ao salvar o check-in.");
      setEnviando(false);
      return;
    }

    router.push("/dashboard/evolucao");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Medidas */}
      <div className="bg-white/[0.04] border border-white/[0.10] rounded-2xl p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Scale size={16} className="text-orange-400" />
          <h2 className="text-sm font-bold text-white/70 uppercase tracking-wider">
            Peso e medidas
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {CAMPOS.map((campo) => (
            <label key={campo.chave} className="flex flex-col gap-1.5">
              <span className="text-[11px] text-white/50 uppercase tracking-wider font-medium flex items-center gap-1">
                {campo.chave === "peso" ? (
                  <Scale size={11} />
                ) : (
                  <Ruler size={11} />
                )}
                {campo.rotulo}
                {campo.obrigatorio && (
                  <span className="text-orange-400">*</span>
                )}
              </span>
              <div className="relative">
                <input
                  type="text"
                  inputMode="decimal"
                  value={valores[campo.chave]}
                  onChange={(e) => setCampo(campo.chave, e.target.value)}
                  placeholder="0"
                  className="w-full h-11 pl-3 pr-10 rounded-xl bg-white/[0.05] border border-white/[0.12] text-white placeholder:text-white/25 focus:border-orange-400/50 focus:outline-none transition-colors"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/30">
                  {campo.unidade}
                </span>
              </div>
            </label>
          ))}
        </div>
        <p className="text-[11px] text-white/30">
          Só o peso é obrigatório. As medidas são opcionais — preencha as que
          conseguir medir.
        </p>
      </div>

      {/* Foto de progresso */}
      <div className="bg-white/[0.04] border border-white/[0.10] rounded-2xl p-5 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Camera size={16} className="text-orange-400" />
          <h2 className="text-sm font-bold text-white/70 uppercase tracking-wider">
            Foto de progresso (opcional)
          </h2>
        </div>
        <p className="text-xs text-white/40">
          Tire sempre na mesma pose e iluminação pra comparar antes/depois. A
          foto fica guardada de forma privada — só você consegue ver.
        </p>

        {fotoPreview ? (
          <div className="flex flex-col items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={fotoPreview}
              alt="Foto do check-in"
              className="w-40 h-40 sm:w-48 sm:h-48 object-cover rounded-2xl border-2 border-orange-400/50 shadow-lg shadow-orange-400/10"
            />
            <button
              type="button"
              onClick={removerFoto}
              className="text-sm text-red-400 hover:text-red-300 transition-colors inline-flex items-center gap-1"
            >
              <X size={13} /> Remover foto
            </button>
          </div>
        ) : (
          <label
            onDragOver={(e) => {
              e.preventDefault();
              if (!processandoFoto) setArrastandoFoto(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setArrastandoFoto(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setArrastandoFoto(false);
              if (processandoFoto) return;
              handleFile(e.dataTransfer.files?.[0]);
            }}
            className={`flex flex-col items-center gap-2 p-6 rounded-xl border-2 border-dashed transition-colors cursor-pointer ${
              arrastandoFoto
                ? "border-orange-400 bg-orange-400/[0.10]"
                : "border-white/[0.15] bg-white/[0.04] hover:border-orange-400/40 hover:bg-white/[0.06]"
            }`}
          >
            <div className="w-10 h-10 rounded-lg bg-white/[0.08] flex items-center justify-center text-white/40">
              <Camera size={18} />
            </div>
            <p className="text-sm font-medium text-white/60 text-center">
              {processandoFoto
                ? "Processando..."
                : arrastandoFoto
                  ? "Solte a imagem aqui"
                  : "Tirar foto ou escolher da galeria"}
            </p>
            <p className="text-[10px] text-white/30">
              Arraste e solte ou clique · JPG, PNG, WebP — máx. 5MB
            </p>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              capture="environment"
              onChange={(e) => handleFile(e.target.files?.[0])}
              className="hidden"
              disabled={processandoFoto}
            />
          </label>
        )}
      </div>

      {/* Observações */}
      <div className="bg-white/[0.04] border border-white/[0.10] rounded-2xl p-5 flex flex-col gap-2">
        <label
          htmlFor="observacoes"
          className="text-sm font-bold text-white/70 uppercase tracking-wider"
        >
          Observações (opcional)
        </label>
        <textarea
          id="observacoes"
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value.slice(0, 500))}
          rows={3}
          placeholder="Ex: Comecei dieta nova essa semana, treino pesado..."
          className="w-full rounded-xl bg-white/[0.05] border border-white/[0.12] text-white placeholder:text-white/25 p-3 text-sm focus:border-orange-400/50 focus:outline-none transition-colors resize-none"
        />
        <span className="text-[10px] text-white/30 self-end">
          {observacoes.length}/500
        </span>
      </div>

      {erro && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30">
          <p className="text-sm text-red-400">
            <strong>Erro:</strong> {erro}
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={salvar}
        disabled={enviando || processandoFoto}
        className="w-full h-14 rounded-full bg-orange-400 text-black font-semibold text-lg hover:bg-orange-300 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
      >
        <Save size={18} />
        {enviando ? "Salvando..." : "Salvar check-in"}
      </button>
    </div>
  );
}
