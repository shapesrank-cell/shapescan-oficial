"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Camera, Sparkles, X, Settings } from "lucide-react";

type Perfil = {
  nome: string;
  sexo: "masculino" | "feminino" | "outro";
  idade: number;
  peso: number;
  altura: number;
  nivelAtividade: "sedentario" | "leve" | "moderado" | "intenso";
  objetivo: "emagrecer" | "ganhar_massa" | "definir" | "saude_geral";
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

export function AnaliseNovaClient({ perfil }: { perfil: Perfil }) {
  const router = useRouter();
  const [foto, setFoto] = useState<{ base64: string; mimeType: string } | null>(
    null
  );
  const [fotoPreview, setFotoPreview] = useState<string>("");
  const [processandoFoto, setProcessandoFoto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
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

  async function gerarAnalise() {
    setEnviando(true);
    setErro(null);

    try {
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
          ...(foto && {
            foto: foto.base64,
            fotoMimeType: foto.mimeType,
          }),
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
      }
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro inesperado");
      setEnviando(false);
    }
  }

  if (enviando) {
    return <GerandoAnalise temFoto={!!foto} />;
  }

  return (
    <>
      {/* Summary do perfil */}
      <div className="bg-white/[0.04] border border-white/[0.10] rounded-2xl p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white/70 uppercase tracking-wider">
            Seus dados salvos
          </h2>
          <Link
            href="/onboarding"
            className="text-xs text-orange-400 hover:underline inline-flex items-center gap-1"
          >
            <Settings size={11} /> Editar
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
          <Info label="Sexo" valor={capitalizar(perfil.sexo)} />
          <Info label="Idade" valor={`${perfil.idade} anos`} />
          <Info label="Peso" valor={`${perfil.peso} kg`} />
          <Info label="Altura" valor={`${perfil.altura} cm`} />
          <Info label="Atividade" valor={ATIVIDADE_LABEL[perfil.nivelAtividade]} />
          <Info label="Objetivo" valor={OBJETIVO_LABEL[perfil.objetivo]} />
        </div>
      </div>

      {/* Upload foto opcional */}
      <div className="bg-white/[0.04] border border-white/[0.10] rounded-2xl p-5 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Camera size={16} className="text-orange-400" />
          <h2 className="text-sm font-bold text-white/70 uppercase tracking-wider">
            Foto (opcional)
          </h2>
        </div>
        <p className="text-xs text-white/40">
          Enviar uma foto ajuda a IA a refinar a análise visual do biotipo. A
          foto é processada e descartada — não fica armazenada.
        </p>

        {fotoPreview ? (
          <div className="flex flex-col items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={fotoPreview}
              alt="Foto enviada"
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
          <label className="flex flex-col items-center gap-2 p-6 rounded-xl border-2 border-dashed border-white/[0.15] bg-white/[0.04] hover:border-orange-400/40 hover:bg-white/[0.06] transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-lg bg-white/[0.08] flex items-center justify-center text-white/40">
              <Camera size={18} />
            </div>
            <p className="text-sm font-medium text-white/60">
              {processandoFoto
                ? "Processando..."
                : "Tirar foto ou escolher da galeria"}
            </p>
            <p className="text-[10px] text-white/30">JPG, PNG, WebP — máx. 5MB</p>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              capture="environment"
              onChange={handleFile}
              className="hidden"
              disabled={processandoFoto}
            />
          </label>
        )}
      </div>

      {/* Botão gerar */}
      <button
        type="button"
        onClick={gerarAnalise}
        disabled={enviando}
        className="w-full h-14 rounded-full bg-orange-400 text-black font-semibold text-lg hover:bg-orange-300 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
      >
        <Sparkles size={18} />
        {enviando ? "Gerando..." : "Gerar análise"}
      </button>

      {erro && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30">
          <p className="text-sm text-red-400">
            <strong>Erro:</strong> {erro}
          </p>
        </div>
      )}
    </>
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
            Levando você ao resultado em instantes...
          </p>
        </div>
        <div className="w-full max-w-xs bg-white/[0.08] rounded-full h-1.5 overflow-hidden">
          <div className="h-full bg-orange-400 rounded-full animate-[progress_15s_ease-out_forwards]" />
        </div>
      </div>
    </div>
  );
}
